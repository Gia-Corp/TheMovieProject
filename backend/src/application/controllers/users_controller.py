from fastapi import APIRouter, Body, Depends, Path
from src.domain import User, WatchEvent
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

    watch_events = watch_event_repo.get_all_by_user_id(user_id)  # 1 CALL
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
            last_watched=(
                max(watched_movies, key=lambda movie: movie.watched_at)
                if watched_movies
                else None
            ),
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

    existing_movie_ids = {movie.id for movie in movie_repo.get_all()}  # 1 CALL

    valid_items = [item for item in items if item.movie_id in existing_movie_ids]
    errors = [
        MovieWatchedErrorDTO(
            movie_id=item.movie_id,
            watched=item.watched,
            error="movie_not_found",
        )
        for item in items
        if item.movie_id not in existing_movie_ids
    ]

    if not valid_items:
        return UpdateMoviesWatchedResponseDTO(success=[], errors=errors)

    current_events = watch_event_repo.get_all_by_user_id(user_id)  # 1 CALL
    watched_movie_ids = {event.movie_id for event in current_events}

    to_add = [
        WatchEvent(movie_id=item.movie_id, user_id=user_id)
        for item in valid_items
        if item.watched and item.movie_id not in watched_movie_ids
    ]
    to_remove = [
        item.movie_id
        for item in valid_items
        if not item.watched and item.movie_id in watched_movie_ids
    ]

    if to_add:
        watch_event_repo.add_many(to_add)  # 2 CALLS

    if to_remove:
        watch_event_repo.delete_by_user_and_movie_ids(user_id, to_remove)  # 2 CALLS

    watch_event_id_by_movie_id = {event.movie_id: event.id for event in current_events}
    watch_event_id_by_movie_id.update({event.movie_id: event.id for event in to_add})

    success = [
        MovieWatchedSuccessDTO(
            movie_id=item.movie_id,
            watched=item.watched,
            watch_event_id=(
                watch_event_id_by_movie_id.get(item.movie_id) if item.watched else None
            ),
        )
        for item in valid_items
    ]

    return UpdateMoviesWatchedResponseDTO(success=success, errors=errors)
