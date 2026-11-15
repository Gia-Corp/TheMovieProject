"""
Script para poblar el atributo genre de las películas existentes,
consultando OMDB para obtener el género faltante.

Como GET /api/movies ahora devuelve genre, el script saltea las películas
que ya lo tienen cargado y solo actualiza las que faltan. Recorre todas
las páginas del listado.

Uso:
    python populate_movies.py

Variables de entorno requeridas (o modificar las constantes al inicio):
    API_BASE_URL    - URL base de la API, incluyendo /api (ej: http://localhost:5000/api)
    MOVIE_API_URL   - URL base de OMDB (ej: http://www.omdbapi.com)
    MOVIE_API_KEY   - Tu API key de OMDB
    ACCESS_TOKEN    - Access token para autenticar el PATCH de cada película

Variables opcionales:
    PAGE            - Página inicial (default: 1)
    PAGE_SIZE       - Películas por página (default: 50)
    SLEEP           - Segundos entre películas (default: 1.0)
    MAX_RETRIES     - Reintentos ante HTTP 429/500/503 (default: 3)
    FAILED_IDS_FILE - Archivo donde registrar los ids fallidos
                      (default: failed_movie_ids.txt)
"""

import asyncio
import httpx
import os
from src.infra import ExternalAPIMovieRepository
from dotenv import load_dotenv

load_dotenv()

# ── Configuración ────────────────────────────────────────────────────────────
API_BASE_URL = os.getenv("API_BASE_URL")
OMDB_API_URL = os.getenv("MOVIE_API_URL")
OMDB_API_KEY = os.getenv("MOVIE_API_KEY")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
PAGE = int(os.getenv("PAGE", 1))
PAGE_SIZE = int(os.getenv("PAGE_SIZE", 50))
SLEEP = float(os.getenv("SLEEP", 1.0))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 3))
FAILED_IDS_FILE = os.getenv("FAILED_IDS_FILE", "failed_movie_ids.txt")
# ─────────────────────────────────────────────────────────────────────────────

RETRYABLE_STATUS_CODES = {429, 500, 503}


def extract_omdb_fields(omdb_data: dict) -> dict:
    """Extrae genre del response de OMDB, ignorando 'N/A'."""

    def clean(value):
        return value if value and value != "N/A" else None

    return {
        "genre": clean(omdb_data.get("Genre")),
    }


async def fetch_movies(client):
    """Obtiene todas las películas desde PAGE hasta la última página."""
    movies = []
    page = PAGE

    while True:
        print(f"📥 Obteniendo películas (página {page}, tamaño {PAGE_SIZE})...")
        response = await client.get(
            f"{API_BASE_URL}/movies", params={"page": page, "size": PAGE_SIZE}
        )
        response.raise_for_status()
        body = response.json()
        batch = body.get("movies", [])
        movies.extend(batch)

        page_count = body.get("metadata", {}).get("page_count", 0)
        if not batch or page >= page_count:
            break

        page += 1

    return movies


async def patch_genre(client, movie_id, payload, headers):
    """Hace el PATCH con reintentos ante errores transitorios."""
    delay = SLEEP

    for attempt in range(1, MAX_RETRIES + 1):
        response = await client.patch(
            f"{API_BASE_URL}/movies/{movie_id}",
            json=payload,
            headers=headers,
        )

        if response.status_code in RETRYABLE_STATUS_CODES and attempt < MAX_RETRIES:
            await asyncio.sleep(delay)
            delay *= 2
            continue

        response.raise_for_status()
        return


async def populate_movies():
    omdb_repo = ExternalAPIMovieRepository(OMDB_API_URL, OMDB_API_KEY)
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"} if ACCESS_TOKEN else None

    async with httpx.AsyncClient(timeout=15) as client:
        movies = await fetch_movies(client)

    if not movies:
        print("⚠️  No se encontraron películas. Verificá que la API esté corriendo.")
        return

    print(f"✅ {len(movies)} películas obtenidas.\n")

    results = {"updated": 0, "already_populated": 0, "skipped": 0, "errors": 0}
    failed_ids = []

    for movie in movies:
        movie_id = movie["id"]
        title = movie["title"]
        year = movie.get("year")

        if movie.get("genre"):
            print(f"⏭️  [{movie_id}] '{title}' — ya tiene genre, se omite.")
            results["already_populated"] += 1
            continue

        print(f"🔍 [{movie_id}] '{title}' ({year}) — consultando OMDB...", end=" ")

        try:
            omdb_data = await omdb_repo.get_by_title_and_year(title, year)

            if omdb_data.get("Response") == "False":
                print(
                    f"❌ No encontrada en OMDB: {omdb_data.get('Error', 'Unknown error')}"
                )
                results["errors"] += 1
                failed_ids.append(movie_id)
                continue

            new_fields = extract_omdb_fields(omdb_data)
            payload = {k: v for k, v in new_fields.items() if v is not None}

            if not payload:
                print("⚠️  OMDB no devolvió genre con valor.")
                results["skipped"] += 1
                continue

            async with httpx.AsyncClient(timeout=15) as client:
                await patch_genre(client, movie_id, payload, headers)

            print(f"✅ Actualizada — {list(payload.keys())}")
            results["updated"] += 1

        except httpx.HTTPStatusError as e:
            print(f"❌ Error HTTP {e.response.status_code}: {e.response.text}")
            results["errors"] += 1
            failed_ids.append(movie_id)
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
            results["errors"] += 1
            failed_ids.append(movie_id)

        await asyncio.sleep(SLEEP)

    if failed_ids:
        with open(FAILED_IDS_FILE, "w", encoding="utf-8") as file:
            file.write("\n".join(str(movie_id) for movie_id in failed_ids))

    print("\n── Resumen ─────────────────────────")
    print(f"  ✅ Actualizadas        : {results['updated']}")
    print(f"  ⏭️  Ya pobladas         : {results['already_populated']}")
    print(f"  ⏭️  Omitidas            : {results['skipped']}")
    print(f"  ❌ Errores             : {results['errors']}")
    if failed_ids:
        print(f"  📄 Ids fallidos en     : {FAILED_IDS_FILE}")
    print("────────────────────────────────────")


if __name__ == "__main__":
    asyncio.run(populate_movies())
