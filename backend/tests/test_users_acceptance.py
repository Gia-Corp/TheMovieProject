from fastapi.testclient import TestClient


class TestUsersAcceptance:
    def test_owner_reads_their_profile_without_password(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(
            user_id=1,
            nickname="tester",
            email="tester@example.com",
            hashed_password="hashed-password",
            role="user",
            profile_pic="pic.png",
        )

        response = client.get("/api/users/1", headers=auth_headers(1))

        assert response.status_code == 200
        assert response.json() == {
            "id": 1,
            "nickname": "tester",
            "email": "tester@example.com",
            "role": "user",
            "profile_pic": "pic.png",
        }
        assert "hashed_password" not in response.json()

    def test_other_user_cannot_read_the_profile(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, email="owner@example.com")
        fake_repos.make_user(user_id=2, nickname="other", email="other@example.com")

        response = client.get("/api/users/1", headers=auth_headers(2))

        assert response.status_code == 403
        assert response.json()["message"] == "That user is not yours"
        assert "timestamp" in response.json()

    def test_user_id_must_be_positive(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)

        response = client.get("/api/users/0", headers=auth_headers(1))

        assert response.status_code == 422
        assert "message" in response.json()
