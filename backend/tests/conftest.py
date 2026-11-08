from collections.abc import Callable, Iterator

import pytest
from fastapi.testclient import TestClient

from src.api import api
from src.application.auth import JWTHandler
from src.application.pagination import Page
from src.domain import Movie, User, WatchEvent
from src.dependencies import (
    get_external_api_movie_repo,
    get_jwt_handler,
    get_movie_repo,
    get_user_repo,
    get_watch_event_repo,
)
from src.infra import (
    MovieNotFoundError,
    PageOutOfBoundsError,
    UserNotFoundError,
    WatchEventNotFoundError,
)
from src.infra.google_sheets_watch_event_repository import WatchEventAlreadyExistsError


class FakeMovieRepository:
    def __init__(self) -> None:
        self.movies: list[Movie] = []

    def get_all_by_page(self, page: Page) -> list[Movie]:
        first_index = page.get_first_index()
        last_index = page.get_last_index()

        if len(self.movies) < first_index:
            raise PageOutOfBoundsError()

        return self.movies[first_index - 1 : last_index]

    def get_all_by_title(self, title: str) -> list[Movie]:
        movies = [
            movie for movie in self.movies if title.lower() in movie.title.lower()
        ]
        if not movies:
            raise MovieNotFoundError()
        return movies

    def get_all(self) -> list[Movie]:
        return list(self.movies)

    def get_by_id(self, movie_id: int) -> Movie:
        for movie in self.movies:
            if movie.id == movie_id:
                return movie
        raise MovieNotFoundError()

    def total_movies(self) -> int:
        return len(self.movies)

    def add(self, movie: Movie) -> Movie:
        movie.id = max((movie.id for movie in self.movies), default=0) + 1
        self.movies.append(movie)
        return movie

    def save(self, movie: Movie) -> Movie:
        for index, current in enumerate(self.movies):
            if current.id == movie.id:
                self.movies[index] = movie
                return movie
        raise MovieNotFoundError()

    def delete(self, movie_id: int) -> None:
        remaining_movies = [movie for movie in self.movies if movie.id != movie_id]
        if len(remaining_movies) == len(self.movies):
            raise MovieNotFoundError()
        self.movies = remaining_movies

    def exists_by_title(self, title: str) -> bool:
        return any(
            movie.title.lower() == title.strip().lower() for movie in self.movies
        )


class FakeUserRepository:
    def __init__(self) -> None:
        self.users: list[User] = []

    def total_users(self) -> int:
        return len(self.users)

    def get_all(self) -> list[User]:
        return list(self.users)

    def get_by_id(self, user_id: int) -> User:
        for user in self.users:
            if user.id == user_id:
                return user
        raise UserNotFoundError()

    def get_by_email(self, email: str) -> User:
        for user in self.users:
            if user.email == email:
                return user
        raise UserNotFoundError()

    def all_exist(self, ids: list[int]) -> bool:
        existing_ids = {str(user.id) for user in self.users}
        return all(str(user_id) in existing_ids for user_id in ids)


class FakeWatchEventRepository:
    def __init__(self) -> None:
        self.watch_events: list[WatchEvent] = []

    def get_all(self) -> list[WatchEvent]:
        return list(self.watch_events)

    def get_by_id(self, watch_event_id: int) -> WatchEvent:
        for watch_event in self.watch_events:
            if watch_event.id == watch_event_id:
                return watch_event
        raise WatchEventNotFoundError()

    def get_all_by_movies(self, movies: list[Movie]) -> list[WatchEvent]:
        movie_ids = {movie.id for movie in movies}
        return [
            watch_event
            for watch_event in self.watch_events
            if watch_event.movie_id in movie_ids
        ]

    def get_all_by_movie_id(self, movie_id: int) -> list[WatchEvent]:
        return [
            watch_event
            for watch_event in self.watch_events
            if watch_event.movie_id == movie_id
        ]

    def get_all_by_user_id(self, user_id: int) -> list[WatchEvent]:
        return [
            watch_event
            for watch_event in self.watch_events
            if watch_event.user_id == user_id
        ]

    def add(self, watch_event: WatchEvent) -> WatchEvent:
        already_exists = any(
            current.movie_id == watch_event.movie_id
            and current.user_id == watch_event.user_id
            for current in self.watch_events
        )
        if already_exists:
            raise WatchEventAlreadyExistsError()

        watch_event.id = (
            max((current.id or 0 for current in self.watch_events), default=0) + 1
        )
        self.watch_events.append(watch_event)
        return watch_event

    def add_many(self, watch_events: list[WatchEvent]) -> None:
        for watch_event in watch_events:
            watch_event.id = (
                max((current.id or 0 for current in self.watch_events), default=0) + 1
            )
            self.watch_events.append(watch_event)

    def delete(self, watch_event_id: int) -> None:
        remaining_watch_events = [
            watch_event
            for watch_event in self.watch_events
            if watch_event.id != watch_event_id
        ]
        if len(remaining_watch_events) == len(self.watch_events):
            raise WatchEventNotFoundError()
        self.watch_events = remaining_watch_events

    def delete_by_movie_id(self, movie_id: int) -> None:
        self.watch_events = [
            watch_event
            for watch_event in self.watch_events
            if watch_event.movie_id != movie_id
        ]

    def delete_by_movie_and_user_ids(self, movie_id: int, user_ids: list[int]) -> None:
        ids_to_delete = {str(user_id) for user_id in user_ids}
        remaining_watch_events = [
            watch_event
            for watch_event in self.watch_events
            if not (
                watch_event.movie_id == movie_id
                and str(watch_event.user_id) in ids_to_delete
            )
        ]
        if len(remaining_watch_events) == len(self.watch_events):
            raise WatchEventNotFoundError()
        self.watch_events = remaining_watch_events


class FakeExternalAPIMovieRepository:
    def __init__(self) -> None:
        self.movies: dict[tuple[str, int], dict] = {}

    async def get_by_title_and_year(self, title: str, year: int) -> dict:
        movie = self.movies.get((title.strip().lower(), year))
        if movie is None:
            raise MovieNotFoundError()
        return movie


class FakeRepositories:
    def __init__(self) -> None:
        self.movies = FakeMovieRepository()
        self.users = FakeUserRepository()
        self.watch_events = FakeWatchEventRepository()
        self.external_api = FakeExternalAPIMovieRepository()

    def make_user(
        self,
        user_id: int,
        nickname: str = "tester",
        email: str = "tester@example.com",
        hashed_password: str = "hashed-password",
        role: str = "user",
        profile_pic: str = "",
    ) -> User:
        user = User(
            id=user_id,
            nickname=nickname,
            email=email,
            hashed_password=hashed_password,
            role=role,
            profile_pic=profile_pic,
        )
        self.users.users.append(user)
        return user

    def make_movie(
        self,
        movie_id: int,
        title: str = "Argo",
        director: str = "Ben Affleck",
        year: int = 2012,
        runtime: str | None = None,
        plot: str | None = None,
        poster_url: str | None = None,
    ) -> Movie:
        movie = Movie(
            id=movie_id,
            title=title,
            director=director,
            year=year,
            runtime=runtime,
            plot=plot,
            poster_url=poster_url,
        )
        self.movies.movies.append(movie)
        return movie

    def make_watch_event(self, movie_id: int, user_id: int) -> WatchEvent:
        watch_event = WatchEvent(movie_id=movie_id, user_id=user_id)
        self.watch_events.watch_events.append(watch_event)
        return watch_event


@pytest.fixture
def fake_repos() -> FakeRepositories:
    return FakeRepositories()


@pytest.fixture
def jwt_handler() -> JWTHandler:
    return JWTHandler("test-secret", "HS256", 30, 7)


@pytest.fixture
def auth_headers(
    jwt_handler: JWTHandler, fake_repos: FakeRepositories
) -> Callable[[int], dict[str, str]]:
    def _auth_headers(user_id: int = 1) -> dict[str, str]:
        user = fake_repos.users.get_by_id(user_id)
        access_token = jwt_handler.create_access_token(
            {"sub": str(user.id), "role": user.role}
        )
        return {"Authorization": f"Bearer {access_token}"}

    return _auth_headers


@pytest.fixture
def client(
    jwt_handler: JWTHandler, fake_repos: FakeRepositories
) -> Iterator[TestClient]:
    def override_get_movie_repo() -> FakeMovieRepository:
        return fake_repos.movies

    def override_get_user_repo() -> FakeUserRepository:
        return fake_repos.users

    def override_get_watch_event_repo() -> FakeWatchEventRepository:
        return fake_repos.watch_events

    def override_get_external_api_movie_repo() -> FakeExternalAPIMovieRepository:
        return fake_repos.external_api

    def override_get_jwt_handler() -> JWTHandler:
        return jwt_handler

    api.dependency_overrides[get_movie_repo] = override_get_movie_repo
    api.dependency_overrides[get_user_repo] = override_get_user_repo
    api.dependency_overrides[get_watch_event_repo] = override_get_watch_event_repo
    api.dependency_overrides[get_external_api_movie_repo] = (
        override_get_external_api_movie_repo
    )
    api.dependency_overrides[get_jwt_handler] = override_get_jwt_handler

    with TestClient(api) as test_client:
        yield test_client

    api.dependency_overrides.clear()


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    return client
