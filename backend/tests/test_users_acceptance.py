from datetime import datetime

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


class TestUserWatchedMoviesAcceptance:
    def test_marks_multiple_movies_as_watched(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")
        fake_repos.make_movie(movie_id=2, title="Titanic")
        fake_repos.make_movie(movie_id=3, title="Inception")

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[
                {"movie_id": 1, "watched": True},
                {"movie_id": 2, "watched": True},
                {"movie_id": 3, "watched": True},
            ],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["success"]) == 3
        assert body["errors"] == []
        assert {item["movie_id"] for item in body["success"]} == {1, 2, 3}
        for item in body["success"]:
            assert item["watched"] is True
            assert item["watch_event_id"] is not None

        stored = {
            (event.movie_id, event.user_id)
            for event in fake_repos.watch_events.watch_events
        }
        assert stored == {(1, 1), (2, 1), (3, 1)}

    def test_marks_multiple_movies_as_not_watched(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")
        fake_repos.make_movie(movie_id=2, title="Titanic")
        fake_repos.make_watch_event(movie_id=1, user_id=1)
        fake_repos.make_watch_event(movie_id=2, user_id=1)

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[
                {"movie_id": 1, "watched": False},
                {"movie_id": 2, "watched": False},
            ],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["success"]) == 2
        assert body["errors"] == []
        for item in body["success"]:
            assert item["watched"] is False
            assert item["watch_event_id"] is None

        stored = [
            event
            for event in fake_repos.watch_events.watch_events
            if event.user_id == 1
        ]
        assert stored == []

    def test_mixed_watched_and_not_watched_in_same_request(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")
        fake_repos.make_movie(movie_id=2, title="Titanic")
        fake_repos.make_watch_event(movie_id=1, user_id=1)

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[
                {"movie_id": 1, "watched": False},
                {"movie_id": 2, "watched": True},
            ],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["success"]) == 2
        assert body["errors"] == []

        by_id = {item["movie_id"]: item for item in body["success"]}
        assert by_id[1]["watched"] is False
        assert by_id[1]["watch_event_id"] is None
        assert by_id[2]["watched"] is True
        assert by_id[2]["watch_event_id"] is not None

    def test_partial_success_some_movies_do_not_exist(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[
                {"movie_id": 1, "watched": True},
                {"movie_id": 999, "watched": True},
                {"movie_id": 2, "watched": False},
            ],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["success"]) == 1
        assert body["success"][0]["movie_id"] == 1
        assert body["success"][0]["watched"] is True
        assert body["success"][0]["watch_event_id"] is not None

        assert len(body["errors"]) == 2
        assert {item["movie_id"] for item in body["errors"]} == {999, 2}
        for item in body["errors"]:
            assert item["error"] == "movie_not_found"

        watch_events = fake_repos.watch_events.watch_events
        assert len(watch_events) == 1
        assert watch_events[0].movie_id == 1
        assert watch_events[0].user_id == 1

    def test_all_movies_do_not_exist(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[
                {"movie_id": 1, "watched": True},
                {"movie_id": 2, "watched": False},
            ],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] == []
        assert len(body["errors"]) == 2
        for item in body["errors"]:
            assert item["error"] == "movie_not_found"
        assert fake_repos.watch_events.watch_events == []

    def test_idempotent_marking_already_watched_as_watched(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")
        event = fake_repos.make_watch_event(movie_id=1, user_id=1)
        event.id = 10

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[{"movie_id": 1, "watched": True}],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["success"]) == 1
        assert body["success"][0]["watch_event_id"] == 10
        watch_events = [
            watch_event
            for watch_event in fake_repos.watch_events.watch_events
            if watch_event.movie_id == 1
        ]
        assert len(watch_events) == 1

    def test_requires_authentication(self, client: TestClient, fake_repos) -> None:
        fake_repos.make_movie(movie_id=1)

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[{"movie_id": 1, "watched": True}],
        )

        assert response.status_code == 401

    def test_watch_events_are_created_for_the_authenticated_user(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_user(user_id=2, nickname="two")
        fake_repos.make_movie(movie_id=1, title="Argo")

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[{"movie_id": 1, "watched": True}],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        watch_events = fake_repos.watch_events.watch_events
        assert len(watch_events) == 1
        assert watch_events[0].user_id == 1

    def test_empty_request_returns_validation_error(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)

        response = client.patch(
            "/api/users/me/watched-movies",
            json=[],
            headers=auth_headers(1),
        )

        assert response.status_code == 422

    def test_returns_watched_movies_of_authenticated_user(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(
            movie_id=1, title="Argo", year=2012, poster_url="argo.png"
        )
        fake_repos.make_movie(movie_id=2, title="Titanic", year=1997)
        fake_repos.make_watch_event(movie_id=1, user_id=1)

        response = client.get(
            "/api/users/me/watched-movies",
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["metadata"]["movie_count"] == 2
        assert body["metadata"]["movies_watched"] == 1
        assert body["metadata"]["last_watched"]["movie_id"] == 1
        assert (
            body["metadata"]["last_watched"]["watched_at"]
            == body["movies"][0]["watched_at"]
        )
        assert len(body["movies"]) == 1
        assert body["movies"][0]["movie_id"] == 1
        assert body["movies"][0]["title"] == "Argo"
        assert body["movies"][0]["year"] == 2012
        assert body["movies"][0]["poster_url"] == "argo.png"
        assert "watched_at" in body["movies"][0]

    def test_returns_empty_list_when_user_has_not_watched_movies(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")

        response = client.get(
            "/api/users/me/watched-movies",
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        assert response.json() == {
            "metadata": {
                "movie_count": 1,
                "movies_watched": 0,
                "last_watched": None,
            },
            "movies": [],
        }

    def test_get_watched_movies_requires_authentication(
        self, client: TestClient, fake_repos
    ) -> None:
        response = client.get("/api/users/me/watched-movies")

        assert response.status_code == 401

    def test_only_returns_movies_watched_by_authenticated_user(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_user(user_id=2, nickname="two")
        fake_repos.make_movie(movie_id=1, title="Argo")
        fake_repos.make_movie(movie_id=2, title="Titanic")
        fake_repos.make_watch_event(movie_id=1, user_id=1)
        fake_repos.make_watch_event(movie_id=2, user_id=2)

        response = client.get(
            "/api/users/me/watched-movies",
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["metadata"]["movie_count"] == 2
        assert body["metadata"]["movies_watched"] == 1
        assert body["metadata"]["last_watched"]["movie_id"] == 1
        assert len(body["movies"]) == 1
        assert body["movies"][0]["movie_id"] == 1

    def test_last_watched_is_the_most_recently_watched_movie(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_movie(movie_id=1, title="Argo")
        fake_repos.make_movie(movie_id=2, title="Titanic")

        older = fake_repos.make_watch_event(movie_id=1, user_id=1)
        older.watched_at = datetime(2020, 1, 1, 10, 0, 0)
        newer = fake_repos.make_watch_event(movie_id=2, user_id=1)
        newer.watched_at = datetime(2024, 6, 1, 10, 0, 0)

        response = client.get(
            "/api/users/me/watched-movies",
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["metadata"]["movies_watched"] == 2
        assert body["metadata"]["last_watched"]["movie_id"] == 2
        assert body["metadata"]["last_watched"]["watched_at"] == "2024-06-01T10:00:00"
