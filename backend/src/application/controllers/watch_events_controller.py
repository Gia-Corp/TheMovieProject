from fastapi import APIRouter, Depends
from src.application.dtos import CreateWatchEventDTO
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
)

watch_events_controller = APIRouter(
    prefix="/api",
    tags=["Watch Events"],
)


@watch_events_controller.post("/watch-events")
async def create_watch_event(
    watch_event_dto: CreateWatchEventDTO = None,
    movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
    user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
    watch_event_repo: GoogleSheetsWatchEventRepository = Depends(get_watch_event_repo),
    current_user: User = Depends(get_current_user),
):
    movie = movie_repo.get_by_id(watch_event_dto.movie_id)
    if not movie:
        raise MovieNotFoundError(watch_event_dto.movie_id)

    user = user_repo.get_by_id(watch_event_dto.user_id)
    if not user:
        raise UserNotFoundError(watch_event_dto.user_id)

    watch_event = WatchEvent(
        movie_id=watch_event_dto.movie_id, user_id=watch_event_dto.user_id
    )
    return watch_event_repo.add(watch_event)


# @watch_events_controller.put("/movies/{movie_id}/watch-events")
# async def update_watch_events(
#     movie_id: int = Path(
#         ..., gt=0, description="El ID de la película debe ser mayor a 0"
#     ),
#     user_ids: list[int] = Body(...),
#     movie_repo: GoogleSheetsMovieRepository = Depends(get_movie_repo),
#     user_repo: GoogleSheetsUserRepository = Depends(get_user_repo),
#     current_user=Depends(get_current_user),
# ):
#     movie = movie_repo.get_by_id(movie_id)
#     if not movie:
#         raise MovieNotFoundError(movie_id)

#     if not user_ids:
#         print("BORRO TODOS LOS ASOCIADOS A ESTA PELI")

#     users_exist = user_repo.all_exist(user_ids)
#     if not users_exist:
#         raise UserNotFoundError()

#     # TENGO QUE DISTINGUIR SI HAY QUE AGREGAR NUEVOS WATCH EVENTS, BORRAR EXISTENTES O AMBAS COSAS

#     new_user_ids = set(user_ids)
#     current_user_ids = set([w.user_id for w in movie.watched_by])
#     user_ids_to_add = new_user_ids.difference(current_user_ids)

#     if not user_ids_to_add:
#         if len(new_user_ids) < len(current_user_ids):
#             print(f"HAY QUE BORRAR TODOS MENOS {new_user_ids}")
#         else:
#             print("NO HAY QUE CAMBIAR NADA")

#     watch_events_to_add = [WatchEvent(user_id=w) for w in user_ids_to_add]
#     movie.watched_by.extend(watch_events_to_add)
