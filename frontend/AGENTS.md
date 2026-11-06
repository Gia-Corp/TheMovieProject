# Frontend

SPA en React 19 y Vite 7. JavaScript y JSX, sin TypeScript. Alias `@` apunta a `src/` (`jsconfig.json` y `vite.config.js`).

## Estructura

```
src/pages/<Nombre>/          pantallas, lazy en App.jsx
src/components/<Nombre>/     un componente por carpeta
src/components/<área>/       auth, modals, movie_crud, navigation, pagination
src/repositories/            acceso HTTP
src/providers/               estado de app
src/hooks/                   contexto y hook (useAuth, useRepos, useNotification)
```

- Componente de función, `export default`. Su CSS vive al lado: `MovieCard/MovieCard.jsx` importa `./MovieCard.css`.
- Providers y hooks se exportan por nombre. El contexto se crea en el hook; el provider solo lo provee.
- Árbol en `main.jsx`: `AuthProvider` → `RepositoriesProvider` → `NotificationProvider` → `App`.
- Rutas actuales: `/`, `/movies/:id`, `/profile`. Una ruta nueva se declara lazy en `App.jsx`, envuelta en `ErrorBoundary` y `Suspense` (el fallback es `SpinnerIcon`).

## Datos

Los componentes no llaman `fetch`. Pasan por el repositorio de `useRepos()`:

- `movieRepo` habla con `/api/movies` y `/api/movies/:id/watch-events`.
- `userRepo` habla con `/api/users/:id`.
- `externalMovieRepo` busca en OMDb (`VITE_MOVIE_API_URL_2`) para el alta.

`buildApiFetch` (`src/apiFetch.js`) renueva la sesión en un 401 y lanza `Error` con `message` y `status`. Las mutaciones reciben `accessToken` y mandan `Authorization: Bearer`.

Sesión: `useAuth()` expone `currentUser`, `accessToken` y sus setters. El access token vive en memoria. El refresh queda en la cookie que maneja el backend.

## UI

Copy en español, voseo informal (`¿Qué peli buscás?`, `Ya la ví`).

- Acciones de alta, edición y borrado solo si hay `accessToken`. `LoginButton` ocupa ese lugar cuando no hay sesión.
- Borrar abre `ConfirmationModal`. El botón de confirmar es `SubmitButton` con `isLoading`.
- Éxito de una mutación: `useNotification().notify("...")`. El popup se cierra solo.
- Error de una página: guardalo en estado y hacé `if (error) throw error` para que lo tome `ErrorBoundary`. No inventes otra pantalla de error.
- Carga de página: `SpinnerIcon` dentro de `.spinner-container`. Grilla: `MovieCardSkeleton` hasta completar `maxMovies` (en Home, 14).
- Póster: no lo muestres hasta `onLoad`. Mientras tanto, clase `skeleton`. Sin póster, mostrá el título.
- Vistas: ícono lleno si `watcher_users === total_users`; ícono a medias si vio alguien. Mismo criterio en la card y en la búsqueda.
- Formularios de modal usan `useActionState` y la clase `modal-form`. Modales son `<dialog>` y se abren con `ref.showModal()`.
- La página viaja en el query `?page=`. Home pide `size` 14.
- Ítems de lista que dependen de poco estado, como `MovieCard`, van envueltos en `memo`.

## Estilos

CSS plano, con nesting nativo. No uses CSS Modules, Tailwind ni styled-components.

- Clases en kebab-case, alineadas al bloque (`.movie-card`, `.movie-detail-page`).
- Colores desde los tokens de `src/index.css`: `--main-clr`, `--text-clr`, `--bg-clr`, `--positive-clr`, `--negative-clr`, `--search-bar-clr`. No pongas hex nuevos en un componente. Un color nuevo entra primero como token semántico.
- Título con `var(--title-font)` (Bakbak One). El resto hereda Cuprum.
- Botones de acción: `primary-button`, `positive-button`, `negative-button`.
- La grilla de pelis es `repeat(auto-fill, minmax(180px, 1fr))`. No le fijes un ancho de viewport.
- `index.css` ya anula animaciones con `prefers-reduced-motion`. No agregues motion que ignore eso.

## Verificación

Desde `frontend/`:

```bash
npm run format        # prettier sobre src/**/*.{js,jsx}
npm run lint          # eslint, cero warnings
npm run test          # vitest
npm run build         # salida en build/
```

CI exige `format:check`, `lint`, `test` y `build`. El dev server escucha en el puerto 3000 y proxea `/api` y `/auth`.
