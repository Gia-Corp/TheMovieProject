# Backend

API FastAPI empaquetada en `src/`. Python 3.13. Dependencias pinneadas en `requirements.txt`. El linter es Ruff con su config por defecto (`ruff check` desde `backend/`).

## Capas

Respetá la dirección de las dependencias que ya existe:

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Dominio | `src/domain/` | Dataclasses (`Movie`, `User`, `WatchEvent`) e invariantes en `__post_init__` / `validate`. |
| Aplicación | `src/application/` | Controllers, DTOs Pydantic, assemblers, paginación, JWT y excepciones HTTP. |
| Infra | `src/infra/` | Google Sheets y OMDb. Traducen filas a entidades y al revés. |
| Composición | `src/dependencies.py`, `src/api.py`, `src/settings.py` | Singletons, `Depends` y la app. |

- Un controller orquesta: valida el contrato, llama repos, arma la respuesta. No accede a `gspread` ni a `httpx`.
- La regla de negocio que pertenece a la entidad va en el dominio. El mapeo de columnas va en el repositorio.
- Los assemblers (`src/application/assemble/`) arman DTOs de lectura a partir de entidades ya cargadas. No hacen I/O.
- Los repos se inyectan con `Depends(get_*_repo)` desde `src/dependencies.py`. No instancies `gspread` en otro módulo.
- Exportá tipos nuevos en el `__init__.py` del paquete, como hacen `src/infra/` y `src/application/dtos/`.
- Controllers y repos importan con `from src...`.

## API

Routers en `src/application/controllers/`, registrados en `src/api.py`:

- `/auth`: `login`, `refresh`, `logout`.
- `/api`: movies, users, watch events.

Convenciones de los endpoints actuales:

- Escrituras (`POST`, `PATCH`, `PUT`, `DELETE`) dependen de `get_current_user`. Las lecturas de películas y de watch events son públicas. El perfil (`GET /api/users/{user_id}`) solo lo lee su dueño (`NotOwnUserError`, 403).
- Path ids usan `Path(..., gt=0)`. `GET /api/movies` exige `page` y `size` mayores a 0.
- Declará `response_model` con un DTO. Hace falta para que `hashed_password` no salga en las respuestas de usuario.
- DTOs de entrada y de salida en `src/application/dtos/`. Pydantic v2. Los que se arman desde una entidad usan `ConfigDict(from_attributes=True)`.
- Listados paginados devuelven `{"metadata", "movies"}`. `Page` valida número y tamaño; `PageMetadataCalculator` arma `links` (`first`, `previous`, `next`, `last`).
- Alta de película: rechazar título duplicado, completar ficha con OMDb (`ExternalAPIMovieRepository`), verificar que existan los `watched_by`, persistir la peli y después los watch events. `N/A` de OMDb se guarda como `None`.
- Errores de dominio e infra son subclases de `APIException` con `build_message` y `get_status_code`, definidas junto a la entidad o al repo. Los handlers responden siempre `{"message", "timestamp"}`. No armes `JSONResponse` a mano en el controller.
- Mensajes de `APIException` en inglés. `detail` de auth que ya está en español (`Credenciales incorrectas`) se mantiene en español.
- Anotá arriba del endpoint y del método de repo cuántas llamadas a Sheets hace (`# N CALLS`), como en `movies_controller.py`.

## Planilla

Un spreadsheet (`SHEET_NAME`), tres hojas fijas en `dependencies.py`:

| Índice | Hoja | Columnas | Id |
| --- | --- | --- | --- |
| 0 | movies | `director`, `title`, `year`, `id`, `runtime`, `plot`, `poster_url` (A:G) | celda `last_id` |
| 1 | users | `id`, `nickname`, `email`, `hashed_password`, `role`, `profile_pic`, `is_active` | — |
| 2 | watch events | `id`, `movie_id`, `user_id`, `watched_at` | celda `last_watch_event_id` |

- La fila 1 es encabezado. `Page.get_first_index()` ya apunta a datos; el repo de películas suma 1 al armar el rango.
- `watched_at` se serializa con `str(datetime)` y se lee con `%Y-%m-%d %H:%M:%S.%f`.
- Cada método de repo debe minimizar llamadas: rangos, `append_rows`, `get_all_records` y borrados en batch. No recorras filas con una llamada por fila.
- No cambies el orden de las columnas ni el índice de las hojas sin actualizar readers, writers y tests del rango (por ejemplo `A4:G5`).

## Auth y secretos

- Login: form OAuth2 (`username` = email). Contraseñas con `bcrypt`. No las loguees ni las devuelvas.
- Access token JWT en el body (`sub`, `role`, `type=access`). Refresh token en cookie `refresh_token`: `HttpOnly`, `Secure`, `SameSite=lax`. No muevas el refresh a un header ni a `localStorage`.
- `JWTHandler.verify_token` exige el `type` correcto. Un refresh no sirve como access.
- CORS solo permite `FRONTEND_URL`, con credenciales.
- Configuración solo por entorno, leída en `src/settings.py` (`JWT_*`, `SHEET_*`, `MOVIE_API_*`, `FRONTEND_URL`). No copies credenciales al repo ni a tests.

El claim `role` viaja en el token. Hoy las rutas protegidas no distinguen roles: alcanzan con un access token válido.

## Tests

`pytest` desde `backend/`. Tests de unidad junto a `tests/test_*.py`, clase `TestX`, sin red ni Sheets reales.

- Dominio: construí la entidad y esperá la `APIException` concreta (`pytest.raises`).
- Repos: `unittest.mock.Mock` como hoja. Assertá el rango o el método de `gspread` que se llamó.
- Con la composición perezosa, ya no se abre el spreadsheet al importar `src.dependencies` ni `src.api`. Igual en un test no se debe hacer red ni tocar Sheets: usar `dependency_overrides` o fakes.
