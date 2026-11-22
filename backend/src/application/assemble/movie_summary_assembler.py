from src.application.dtos import WatchedByDTO, MovieSummaryDTO


class MovieSummaryAssembler:
    def __init__(self, total_users, watch_events):
        self._total_users = total_users

        temp = {}
        for w in watch_events:
            if w.movie_id not in temp:
                temp[w.movie_id] = [w]
            else:
                temp[w.movie_id].append(w)

        self._watch_events = temp

    def assemble(self, movie):
        watcher_users = 0
        watcher_user_ids = []
        if movie.id in self._watch_events:
            watcher_user_ids = [w.user_id for w in self._watch_events[movie.id]]
            watcher_users = len(watcher_user_ids)

        watched_by = WatchedByDTO(
            total_users=self._total_users,
            watcher_users=watcher_users,
            watcher_user_ids=watcher_user_ids,
        )
        return MovieSummaryDTO(
            id=movie.id,
            title=movie.title,
            year=movie.year,
            genre=movie.genre,
            poster_url=movie.poster_url,
            watched_by=watched_by,
        )

    def assemble_many(self, movies):
        return [self.assemble(movie) for movie in movies]
