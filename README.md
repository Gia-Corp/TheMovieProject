[![Backend CI](https://github.com/Gia-Corp/TheMovieProject/actions/workflows/backend_ci.yml/badge.svg?branch=master)](https://github.com/Gia-Corp/TheMovieProject/actions/workflows/backend_ci.yml)
[![Frontend CI](https://github.com/Gia-Corp/TheMovieProject/actions/workflows/frontend_ci.yml/badge.svg?branch=master)](https://github.com/Gia-Corp/TheMovieProject/actions/workflows/frontend_ci.yml)

## Local development

🚀 To start app locally, run this:

```
make up
```

⚙️ To start development containers for backend and frontend, you can use these respectively:

```
make dev-backend
```
```
make dev-frontend
```

Available make targets: `make help` (default), `make up`, `make start`, `make stop`, `make down`, `make dev-backend`, `make dev-frontend`.

To stop the app:

```
make down
```

To stop without removing the containers (so the next `make up` reuses them):

```
make stop
```

To start again without recreating the containers:

```
make start
```