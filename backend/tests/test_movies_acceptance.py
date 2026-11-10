from fastapi.testclient import TestClient


def _seed_external_movie(fake_repos, title: str = "Argo", year: int = 2012) -> None:
    fake_repos.external_api.movies[(title.strip().lower(), year)] = {
        "Title": title,
        "Director": "Ben Affleck",
        "Year": str(year),
        "Runtime": "N/A",
        "Plot": "N/A",
        "Poster": "N/A",
    }


class TestMoviesAcceptance:
    def test_create_movie_persists_movie_and_watch_events(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1, email="tester@example.com")
        fake_repos.make_user(user_id=2, nickname="viewer", email="viewer@example.com")
        _seed_external_movie(fake_repos)

        response = client.post(
            "/api/movies",
            json={"title": "Argo", "year": 2012, "watched_by": [2]},
            headers=auth_headers(1),
        )

        assert response.status_code == 200
        body = response.json()
        assert body["title"] == "Argo"
        assert body["director"] == "Ben Affleck"
        assert body["year"] == 2012
        assert body["runtime"] is None
        assert body["plot"] is None
        assert body["poster_url"] is None

        assert len(fake_repos.movies.movies) == 1
        movie = fake_repos.movies.movies[0]
        assert body["id"] == movie.id
        assert len(fake_repos.watch_events.watch_events) == 1
        watch_event = fake_repos.watch_events.watch_events[0]
        assert watch_event.movie_id == movie.id
        assert watch_event.user_id == 2

    def test_create_movie_rejects_duplicate_title(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)
        fake_repos.make_movie(movie_id=4, title="Argo")

        response = client.post(
            "/api/movies",
            json={"title": " argo ", "year": 2012, "watched_by": []},
            headers=auth_headers(1),
        )

        assert response.status_code == 409
        assert response.json()["message"] == "Movie already exists"
        assert len(fake_repos.movies.movies) == 1
        assert fake_repos.watch_events.watch_events == []

    def test_create_movie_rejects_unknown_watcher_without_persisting(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)
        _seed_external_movie(fake_repos)

        response = client.post(
            "/api/movies",
            json={"title": "Argo", "year": 2012, "watched_by": [99]},
            headers=auth_headers(1),
        )

        assert response.status_code == 404
        assert response.json()["message"] == "User not found"
        assert fake_repos.movies.movies == []
        assert fake_repos.watch_events.watch_events == []

    def test_create_movie_requires_authentication(
        self, client: TestClient, fake_repos
    ) -> None:
        _seed_external_movie(fake_repos)

        response = client.post(
            "/api/movies",
            json={"title": "Argo", "year": 2012, "watched_by": []},
        )

        assert response.status_code == 401
        assert fake_repos.movies.movies == []

    def test_delete_movie_removes_its_watch_events(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)
        fake_repos.make_movie(movie_id=1, title="Argo")
        fake_repos.make_movie(movie_id=2, title="Heat")
        fake_repos.make_watch_event(movie_id=1, user_id=1)
        other_event = fake_repos.make_watch_event(movie_id=2, user_id=1)

        response = client.delete("/api/movies/1", headers=auth_headers(1))

        assert response.status_code == 200
        assert [movie.id for movie in fake_repos.movies.movies] == [2]
        assert fake_repos.watch_events.watch_events == [other_event]

    def test_delete_movie_rejects_unknown_id(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)
        fake_repos.make_movie(movie_id=2, title="Heat")
        event = fake_repos.make_watch_event(movie_id=2, user_id=1)

        response = client.delete("/api/movies/99", headers=auth_headers(1))

        assert response.status_code == 404
        assert response.json()["message"] == "No movies found"
        assert fake_repos.watch_events.watch_events == [event]

    def test_delete_movie_rejects_non_positive_id(
        self, client: TestClient, auth_headers, fake_repos
    ) -> None:
        fake_repos.make_user(user_id=1)

        response = client.delete("/api/movies/0", headers=auth_headers(1))

        assert response.status_code == 422
        assert "message" in response.json()

    def test_delete_movie_requires_authentication(
        self, client: TestClient, fake_repos
    ) -> None:
        fake_repos.make_movie(movie_id=1, title="Argo")

        response = client.delete("/api/movies/1")

        assert response.status_code == 401
        assert len(fake_repos.movies.movies) == 1
