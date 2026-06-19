from src.application.dtos import (
    DetailWatchedByDTO,
    DetailWatchEventDTO,
    MovieDetailDTO,
    UserSummaryDTO,
)


class MovieDetailAssembler:
    def __init__(self, users, watch_events):
        self._users = {u.id: u for u in users}
        self._watch_events = watch_events

    def assemble(self, movie):
        watch_events = [
            DetailWatchEventDTO(
                id=w.id,
                watched_at=w.watched_at,
                user=UserSummaryDTO.model_validate(self._users[w.user_id]),
            )
            for w in self._watch_events
        ]

        watched_by = DetailWatchedByDTO(
            watch_events=watch_events,
            watcher_users=len(watch_events),
            total_users=len(self._users),
        )
        return MovieDetailDTO(
            id=movie.id,
            title=movie.title,
            director=movie.director,
            year=movie.year,
            runtime=movie.runtime,
            plot=movie.plot,
            poster_url=movie.poster_url,
            watched_by=watched_by,
        )
