from fastapi.testclient import TestClient


class TestApiInfrastructure:
    def test_root_endpoint_returns_ok(self, client: TestClient) -> None:
        response = client.get("/")
        assert response.status_code == 200

    def test_protected_endpoint_returns_401_without_token(
        self, client: TestClient
    ) -> None:
        response = client.get("/api/users/1")
        assert response.status_code == 401

    def test_protected_endpoint_returns_200_with_valid_token(
        self,
        auth_client: TestClient,
        auth_headers,
        fake_repos,
    ) -> None:
        fake_repos.make_user(
            user_id=1,
            nickname="tester",
            email="tester@example.com",
            hashed_password="hashed-password",
            role="user",
            profile_pic="",
        )

        response = auth_client.get("/api/users/1", headers=auth_headers(1))
        assert response.status_code == 200
        assert response.json()["nickname"] == "tester"
