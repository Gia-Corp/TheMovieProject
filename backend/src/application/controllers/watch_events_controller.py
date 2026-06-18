from fastapi import APIRouter, Depends, Path, Body
from typing import Optional
from src.application.dtos import (
    CreateWatchEventDTO,
    DetailWatchEventDTO,
    UserSummaryDTO,
)
from src.dependencies import (
    get_movie_repo,
    get_user_repo,
    get_watch_event_repo,
    get_current_user,
)
from src.domain import User, WatchEvent
from src.infra import (
    MovieNotFoundError,
    UserNotFoundError,
    GoogleSheetsMovieRepository,
    GoogleSheetsUserRepository,
    GoogleSheetsWatchEventRepository,
    WatchEventNotFoundError,
)

watch_events_controller = APIRouter(
    prefix="/api",
    tags=["Watch Events"],
)


# MIN = 1 CALL, MAX = 2 CALLS
@watch_events_controller.get("/watch-events")
async def get_watch_events(
    movie_id: Optional[int] = None,
    user_id: Optional[int] = None,
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
):
    if movie_id:
        watch_events = watch_event_repo.find_by_movie_id(movie_id)  # 2 CALLS
        if not watch_events:
            raise WatchEventNotFoundError()
        return watch_events

    if user_id:
        watch_events = watch_event_repo.find_by_user_id(user_id)  # 2 CALLS
        if not watch_events:
            raise WatchEventNotFoundError()
        return watch_events

    return watch_event_repo.get_all()  # 1 CALL


# 7 CALLS
@watch_events_controller.post("/watch-events")
async def create_watch_event(
    watch_event_dto: CreateWatchEventDTO = None,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user: User = Depends(get_current_user),
):
    movie_repo.get_by_id(watch_event_dto.movie_id)  # 1 CALL
    user_repo.get_by_id(watch_event_dto.user_id)  # 1 CALL

    watch_event = WatchEvent(
        movie_id=watch_event_dto.movie_id, user_id=watch_event_dto.user_id
    )
    return watch_event_repo.add(watch_event)  # 5 CALLS


# MIN = 4 CALLS, MAX = N + 12 CALLS
@watch_events_controller.put("/movies/{movie_id}/watch-events")
async def update_watch_events_from_movie(
    movie_id: int = Path(
        ..., gt=0, description="El ID de la película debe ser mayor a 0"
    ),
    user_ids: list[int] = Body(...),
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user: User = Depends(get_current_user),
):
    movie = movie_repo.get_by_id(movie_id)  # 2 CALLS
    if not movie:
        raise MovieNotFoundError(movie_id)

    if not user_ids:
        watch_event_repo.delete_by_movie_id(movie_id)  # 2 CALLS
        return []

    users_exist = user_repo.all_exist(user_ids)  # 1 CALL
    if not users_exist:
        raise UserNotFoundError()

    watch_events = watch_event_repo.find_by_movie_id(movie_id)  # 2 CALLS

    new_user_ids = set(user_ids)
    current_user_ids = set([w.user_id for w in watch_events])
    user_ids_to_add = new_user_ids.difference(current_user_ids)

    if user_ids_to_add:
        watch_events_to_add = [
            WatchEvent(user_id=u, movie_id=movie_id) for u in user_ids_to_add
        ]
        watch_event_repo.add_many(watch_events_to_add)  # N + 2 CALLS

    user_ids_to_delete = current_user_ids.difference(new_user_ids)

    if user_ids_to_delete:
        watch_event_repo.delete_by_movie_and_user_ids(
            movie_id, user_ids_to_delete
        )  # 2 CALLS

    users = user_repo.get_all()  # 1 CALL
    users_dict = {u.id: u for u in users}
    watch_events = watch_event_repo.find_by_movie_id(movie_id)  # 2 CALLS
    return [
        DetailWatchEventDTO(
            id=w.id,
            watched_at=w.watched_at,
            user=UserSummaryDTO.model_validate(users_dict[w.user_id]),
        )
        for w in watch_events
    ]


# 4 CALLS
@watch_events_controller.delete("/watch-events/{watch_event_id}")
async def delete_watch_event(
    watch_event_id: int = Path(
        ..., gt=0, description="El ID del watch event debe ser mayor a 0"
    ),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user: User = Depends(get_current_user),
):
    watch_event = watch_event_repo.get_by_id(watch_event_id)  # 2 CALLS

    if not watch_event:
        raise WatchEventNotFoundError(watch_event_id)

    watch_event_repo.delete(watch_event_id)  # 2 CALLS

    return watch_event
