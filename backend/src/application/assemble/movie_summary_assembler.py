from src.application.dtos import WatchedByDTO, MovieSummaryDTO


class MovieSummaryAssembler:
    def __init__(self, total_users: int):
        self._total_users = total_users

    def assemble(self, movie):
        watched_by = WatchedByDTO(
            total_users=self._total_users,
            watcher_users=len(movie.watched_by),
        )
        return MovieSummaryDTO(
            id=movie.id,
            title=movie.title,
            year=movie.year,
            poster_url=movie.poster_url,
            watched_by=watched_by,
        )

    def assemble_many(self, movies):
        return [self.assemble(movie) for movie in movies]
