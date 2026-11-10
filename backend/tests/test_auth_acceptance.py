import bcrypt
from fastapi.testclient import TestClient

from src.application.auth import JWTHandler


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


class TestAuthAcceptance:
    def test_login_returns_access_token_and_secure_refresh_cookie(
        self, client: TestClient, fake_repos
    ) -> None:
        password = "secret"
        fake_repos.make_user(
            user_id=1,
            nickname="tester",
            email="tester@example.com",
            hashed_password=_hash_password(password),
        )

        response = client.post(
            "/auth/login",
            data={"username": "tester@example.com", "password": password},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["token_type"] == "bearer"
        assert body["access_token"]
        assert body["user"] == {"id": 1, "nickname": "tester", "profile_pic": ""}
        assert "hashed_password" not in body["user"]
        assert "email" not in body["user"]

        set_cookie = response.headers["set-cookie"].lower()
        assert "refresh_token=" in set_cookie
        assert "httponly" in set_cookie
        assert "secure" in set_cookie
        assert "samesite=lax" in set_cookie

    def test_login_rejects_wrong_password(self, client: TestClient, fake_repos) -> None:
        fake_repos.make_user(
            user_id=1,
            email="tester@example.com",
            hashed_password=_hash_password("secret"),
        )

        response = client.post(
            "/auth/login",
            data={"username": "tester@example.com", "password": "wrong"},
        )

        assert response.status_code == 401
        assert response.json()["message"] == "Credenciales incorrectas"
        assert "set-cookie" not in response.headers

    def test_login_rejects_unknown_email(self, client: TestClient) -> None:
        response = client.post(
            "/auth/login",
            data={"username": "missing@example.com", "password": "secret"},
        )

        assert response.status_code == 404
        assert response.json()["message"] == "User not found"
        assert "timestamp" in response.json()

    def test_refresh_returns_a_new_access_token(
        self, client: TestClient, fake_repos, jwt_handler: JWTHandler
    ) -> None:
        password = "secret"
        fake_repos.make_user(
            user_id=1,
            nickname="tester",
            email="tester@example.com",
            hashed_password=_hash_password(password),
            role="user",
        )
        login = client.post(
            "/auth/login",
            data={"username": "tester@example.com", "password": password},
        )
        assert login.status_code == 200

        response = client.post("/auth/refresh")

        assert response.status_code == 200
        body = response.json()
        assert body["token_type"] == "bearer"
        payload = jwt_handler.verify_token(body["access_token"], "access")
        assert payload is not None
        assert payload["sub"] == "1"
        assert body["user"]["id"] == 1
        assert body["user"]["nickname"] == "tester"
        assert "hashed_password" not in body["user"]

    def test_refresh_rejects_missing_cookie(self, client: TestClient) -> None:
        response = client.post("/auth/refresh")

        assert response.status_code == 401
        assert "message" in response.json()

    def test_refresh_rejects_access_token_used_as_refresh(
        self, client: TestClient, fake_repos, jwt_handler: JWTHandler
    ) -> None:
        user = fake_repos.make_user(user_id=1, role="user")
        access_token = jwt_handler.create_access_token(
            {"sub": str(user.id), "role": user.role}
        )
        client.cookies.set("refresh_token", access_token)

        response = client.post("/auth/refresh")

        assert response.status_code == 401
        assert response.json()["message"] == "Refresh token inválido o expirado"

    def test_logout_clears_the_refresh_cookie(
        self, client: TestClient, fake_repos
    ) -> None:
        password = "secret"
        fake_repos.make_user(
            user_id=1,
            email="tester@example.com",
            hashed_password=_hash_password(password),
        )
        login = client.post(
            "/auth/login",
            data={"username": "tester@example.com", "password": password},
        )
        assert login.status_code == 200

        response = client.post("/auth/logout")

        assert response.status_code == 200
        assert response.json()["message"] == "Sesión cerrada"
        refresh = client.post("/auth/refresh")
        assert refresh.status_code == 401
