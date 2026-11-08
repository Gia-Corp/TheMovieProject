# The Movie Project

Catálogo compartido de películas. El frontend es una SPA en React y el backend es una API en FastAPI. No hay base SQL: los datos viven en un Google Spreadsheet.

Reglas de cada paquete, en el directorio correspondiente:

- `frontend/AGENTS.md`: UI, componentes y experiencia.
- `backend/AGENTS.md`: API, planilla y autenticación.

## Layout

```
frontend/     SPA (Vite, React 19). Se publica en Netlify.
backend/      API (FastAPI, Python 3.13). Se publica en Render.
```

`docker-compose.yml` levanta los dos servicios de desarrollo. `docker-compose.dev.yml` deja los contenedores abiertos para entrar por shell.

## Comandos

Desde la raíz del repo:

```bash
./start_app.sh              # docker compose up (frontend :3000, backend :5000)
./start_dev_backend.sh      # contenedor de backend y shell
./start_dev_frontend.sh     # ambos contenedores; shell en el frontend
```

Si un script no corre, `chmod +x <script>`.

Dentro del contenedor de backend, el server de desarrollo es `./start_dev.sh` (`fastapi dev src/api.py --host backend --port 5000`). Producción usa `./start_prod.sh`.

Checks que corre CI. Ejecutalos en el paquete que tocaste:

```bash
# backend/
ruff check
pytest

# frontend/
npm run format:check
npm run lint
npm run test
npm run build
```

`npm run format` escribe el formato. No hace falta correr el build del otro paquete.

## Arquitectura

El browser habla solo con el origen del frontend. En desarrollo, Vite proxea `/api` y `/auth` hacia `VITE_BACKEND_URL`. En producción, Netlify reescribe esas rutas al backend y el resto cae en `index.html`.

Flujo de una request:

1. Página o componente llama a un repositorio de `frontend/src/repositories/` mediante `useRepos()`.
2. `apiFetch` manda la request. Si recibe 401, renueva el access token con `POST /auth/refresh` (cookie) y reintenta una vez.
3. Un controller de `backend/src/application/controllers/` orquesta repositorios, assemblers y DTOs.
4. `backend/src/infra/` lee y escribe la planilla o OMDb. `backend/src/domain/` valida las entidades.

## Convenciones del repo

- Identificadores de código en inglés. Textos de la interfaz en español, con voseo.
- Mensajes de commit en inglés, con Conventional Commits: `type(scope): description`. El `scope` es opcional. Tipos habituales: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- Nunca ejecutes `git commit` ni `git commit` + `git push` sin pedir autorización explícita antes. Mostrá los cambios y esperá la confirmación del usuario.
- Un cambio de contrato HTTP se hace en los dos lados: DTO y controller en el backend, método del repositorio y la pantalla que lo consume en el frontend.
- No agregues dependencias, servicios ni capas nuevas si el cambio entra en las que ya existen.
- No commitees secretos. Están ignorados: `backend/.env`, `backend/credentials.json`, `frontend/.env`.
- Variables de entorno: las del backend las lee `src/settings.py`; las del frontend salen de `import.meta.env` y tienen prefijo `VITE_`. Nombralas ahí, no hardcodees URLs ni claves.
- CI corre en `main` y `dev` (`.github/workflows/`). El deploy a Render y a Netlify ocurre solo desde `main`.
