from fastapi import APIRouter, Body, Depends, Path
from src.domain import Movie, User, WatchEvent
from src.infra import (
    GoogleSheetsMovieRepository,
    GoogleSheetsUserRepository,
    GoogleSheetsWatchEventRepository,
    NotOwnUserError,
)
from src.dependencies import (
    get_movie_repo,
    get_user_repo,
    get_watch_event_repo,
    get_current_user,
)
from src.application.dtos import (
    MovieWatchedDTO,
    MovieWatchedErrorDTO,
    MovieWatchedItemDTO,
    MovieWatchedSuccessDTO,
    UpdateMoviesWatchedResponseDTO,
    UserDetailDTO,
    UserWatchedMoviesResponseDTO,
    WatchedMoviesMetadataDTO,
)

users_controller = APIRouter(
    prefix="/api",
    tags=["Users"],
)


@users_controller.get("/users/{user_id}", response_model=UserDetailDTO)
async def get_user(
    user_id: int = Path(..., gt=0, description="El ID del usuario debe ser mayor a 0"),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise NotOwnUserError()
    return user_repo.get_by_id(user_id)


# 2 CALLS
@users_controller.get(
    "/users/me/watched-movies",
    response_model=UserWatchedMoviesResponseDTO,
)
async def get_my_watched_movies(
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    watch_events = sorted(
        watch_event_repo.get_all_by_user_id(user_id),  # 1 CALL
        key=lambda event: event.watched_at,
        reverse=True,
    )
    movies = movie_repo.get_all()  # 1 CALL
    movies_by_id = {movie.id: movie for movie in movies}

    watched_movies = [
        MovieWatchedDTO(
            movie_id=event.movie_id,
            title=movies_by_id[event.movie_id].title,
            year=movies_by_id[event.movie_id].year,
            poster_url=movies_by_id[event.movie_id].poster_url,
            watched_at=event.watched_at,
        )
        for event in watch_events
        if event.movie_id in movies_by_id
    ]

    return UserWatchedMoviesResponseDTO(
        metadata=WatchedMoviesMetadataDTO(
            movie_count=len(movies),
            movies_watched=len(watched_movies),
        ),
        movies=watched_movies,
    )


# MIN = 1 CALL, MAX = 7 CALLS
@users_controller.patch(
    "/users/me/watched-movies",
    response_model=UpdateMoviesWatchedResponseDTO,
)
async def update_my_watched_movies(
    items: list[MovieWatchedItemDTO] = Body(..., min_length=1, max_length=100),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    all_movies = movie_repo.get_all()  # 1 CALL
    movies_by_id = {movie.id: movie for movie in all_movies}

    valid_items: list[tuple[MovieWatchedItemDTO, Movie]] = []
    errors: list[MovieWatchedErrorDTO] = []

    for item in items:
        movie = None

        if item.movie_id is not None:
            # movie_id tiene prioridad sobre title
            movie = movies_by_id.get(item.movie_id)
            if movie is None:
                errors.append(
                    MovieWatchedErrorDTO(
                        movie_id=item.movie_id,
                        title=item.title or "",
                        watched=item.watched,
                        error=f"movie_not_found: no movie with id {item.movie_id}",
                    )
                )
                continue
        else:
            # Priorizar coincidencia exacta (case-insensitive, trimeado)
            pattern = (item.title or "").strip().lower()
            exact_matches = [
                m for m in all_movies if m.title.strip().lower() == pattern
            ]

            if len(exact_matches) > 1:
                errors.append(
                    MovieWatchedErrorDTO(
                        title=item.title or "",
                        watched=item.watched,
                        error=(
                            f"ambiguous_title: {len(exact_matches)} movies match "
                            f"'{item.title}'"
                        ),
                        matches=[m.title for m in exact_matches[:20]],
                    )
                )
                continue

            if len(exact_matches) == 1:
                movie = exact_matches[0]
            else:
                # Sin coincidencia exacta, buscar por substring
                substring_matches = [
                    m for m in all_movies if pattern in m.title.strip().lower()
                ]
                if not substring_matches:
                    errors.append(
                        MovieWatchedErrorDTO(
                            title=item.title or "",
                            watched=item.watched,
                            error=f"movie_not_found: no movie matches '{item.title}'",
                        )
                    )
                    continue
                if len(substring_matches) > 1:
                    errors.append(
                        MovieWatchedErrorDTO(
                            title=item.title or "",
                            watched=item.watched,
                            error=(
                                f"ambiguous_title: {len(substring_matches)} movies "
                                f"match '{item.title}'"
                            ),
                            matches=[m.title for m in substring_matches[:20]],
                        )
                    )
                    continue
                movie = substring_matches[0]

        valid_items.append((item, movie))

    current_events = watch_event_repo.get_all_by_user_id(user_id)  # 1 CALL
    watched_movie_ids = {event.movie_id for event in current_events}

    to_add = [
        WatchEvent(movie_id=movie.id, user_id=user_id)
        for item, movie in valid_items
        if item.watched and movie.id not in watched_movie_ids
    ]
    to_remove = [
        movie.id
        for item, movie in valid_items
        if not item.watched and movie.id in watched_movie_ids
    ]

    if to_add:
        watch_event_repo.add_many(to_add)  # 2 CALLS

    if to_remove:
        watch_event_repo.delete_by_user_and_movie_ids(user_id, to_remove)  # 2 CALLS

    watch_event_id_by_movie_id = {event.movie_id: event.id for event in current_events}
    for event in to_add:
        watch_event_id_by_movie_id[event.movie_id] = event.id

    success = [
        MovieWatchedSuccessDTO(
            movie_id=movie.id,
            title=movie.title,
            watched=item.watched,
            watch_event_id=(
                watch_event_id_by_movie_id.get(movie.id) if item.watched else None
            ),
        )
        for item, movie in valid_items
    ]

    return UpdateMoviesWatchedResponseDTO(success=success, errors=errors)
