from fastapi.testclient import TestClient


class TestWatchEventsAcceptance:
    def test_replaces_the_watchers_of_a_movie(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, nickname="one")
        fake_repos.make_user(user_id=2, nickname="two")
        fake_repos.make_user(user_id=3, nickname="three")
        fake_repos.make_movie(movie_id=1)
        first = fake_repos.make_watch_event(movie_id=1, user_id=1)
        second = fake_repos.make_watch_event(movie_id=1, user_id=2)
        first.id = 10
        second.id = 11

        response = client.put(
            "/api/movies/1/watch-events",
            json=[2, 3],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        watchers = {item["user"]["id"] for item in response.json()}
        assert watchers == {2, 3}
        for item in response.json():
            assert "watched_at" in item
            assert "hashed_password" not in item["user"]
            assert set(item["user"]) == {"id", "nickname", "profile_pic"}
        stored = {event.user_id for event in fake_repos.watch_events.watch_events}
        assert stored == {2, 3}

    def test_empty_list_clears_watch_events(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)
        fake_repos.make_movie(movie_id=1)
        fake_repos.make_watch_event(movie_id=1, user_id=1)
        fake_repos.make_watch_event(movie_id=2, user_id=1)

        response = client.put(
            "/api/movies/1/watch-events",
            json=[],
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        assert response.json() == []
        remaining = [
            event
            for event in fake_repos.watch_events.watch_events
            if event.movie_id == 1
        ]
        assert remaining == []

    def test_unknown_user_does_not_change_existing_events(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)
        fake_repos.make_movie(movie_id=1)
        event = fake_repos.make_watch_event(movie_id=1, user_id=1)

        response = client.put(
            "/api/movies/1/watch-events",
            json=[1, 99],
            headers=auth_headers(1),
        )

        assert response.status_code == 404
        assert response.json()["message"] == "User not found"
        assert fake_repos.watch_events.watch_events == [event]

    def test_unknown_movie_returns_not_found(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)

        response = client.put(
            "/api/movies/99/watch-events",
            json=[1],
            headers=auth_headers(1),
        )

        assert response.status_code == 404
        assert response.json()["message"] == "No movies found"
        assert fake_repos.watch_events.watch_events == []

    def test_update_requires_authentication(
        self, client: TestClient, fake_repos
    ) -> None:
        fake_repos.make_movie(movie_id=1)
        event = fake_repos.make_watch_event(movie_id=1, user_id=1)

        response = client.put("/api/movies/1/watch-events", json=[1])

        assert response.status_code == 401
        assert fake_repos.watch_events.watch_events == [event]
