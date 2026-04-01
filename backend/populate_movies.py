"""
Script para poblar los campos runtime, plot y poster_url de las películas
existentes, consultando OMDB para obtener los datos faltantes.

Uso:
    python populate_movies.py

Variables de entorno requeridas (o modificar las constantes al inicio):
    OMDB_API_URL    - URL base de OMDB (ej: http://www.omdbapi.com)
    OMDB_API_KEY    - Tu API key de OMDB
"""

import asyncio
import httpx
import os
from src.infra import ExternalAPIMovieRepository
from dotenv import load_dotenv

load_dotenv()

# ── Configuración ────────────────────────────────────────────────────────────
API_BASE_URL = "http://backend:5000"
OMDB_API_URL = os.getenv("MOVIE_API_URL")
OMDB_API_KEY = os.getenv("MOVIE_API_KEY")
PAGE = int(os.getenv("PAGE", 1))
PAGE_SIZE = int(os.getenv("PAGE_SIZE", 50))
# ─────────────────────────────────────────────────────────────────────────────


def extract_omdb_fields(omdb_data: dict) -> dict:
    """Extrae runtime, plot y poster_url del response de OMDB, ignorando 'N/A'."""
    def clean(value):
        return value if value and value != "N/A" else None

    return {
        "runtime": clean(omdb_data.get("Runtime")),
        "plot": clean(omdb_data.get("Plot")),
        "poster_url": clean(omdb_data.get("Poster")),
    }


def already_populated(movie: dict) -> bool:
    """Devuelve True si la película ya fue populada (poster_url como indicador)."""
    return movie.get("poster_url") is not None


async def populate_movies():
    omdb_repo = ExternalAPIMovieRepository(OMDB_API_URL, OMDB_API_KEY)

    print(f"📥 Obteniendo películas de la API (página {PAGE}, tamaño {PAGE_SIZE})...")
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(f"{API_BASE_URL}/movies", params={"page": PAGE, "size": PAGE_SIZE})
        response.raise_for_status()
        movies = response.json().get("movies", [])

    if not movies:
        print("⚠️  No se encontraron películas. Verificá que la API esté corriendo.")
        return

    print(f"✅ {len(movies)} películas obtenidas.\n")

    results = {"updated": 0, "skipped": 0, "errors": 0}

    for movie in movies:
        movie_id = movie["id"]
        title = movie["title"]
        year = movie.get("year")

        if already_populated(movie):
            print(f"⏭️  [{movie_id}] '{title}' — ya tiene todos los campos, se omite.")
            results["skipped"] += 1
            continue

        print(f"🔍 [{movie_id}] '{title}' ({year}) — consultando OMDB...", end=" ")

        try:
            omdb_data = await omdb_repo.get_by_title_and_year(title, year)

            if omdb_data.get("Response") == "False":
                print(f"❌ No encontrada en OMDB: {omdb_data.get('Error', 'Unknown error')}")
                results["errors"] += 1
                continue

            new_fields = extract_omdb_fields(omdb_data)
            payload = {k: v for k, v in new_fields.items() if v is not None}

            if not payload:
                print("⚠️  OMDB no devolvió ningún campo nuevo con valor.")
                results["skipped"] += 1
                continue

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.patch(f"{API_BASE_URL}/movies/{movie_id}", json=payload)
                response.raise_for_status()

            print(f"✅ Actualizada — {list(payload.keys())}")
            results["updated"] += 1

        except httpx.HTTPStatusError as e:
            print(f"❌ Error HTTP {e.response.status_code}: {e.response.text}")
            results["errors"] += 1
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
            results["errors"] += 1

        await asyncio.sleep(0.3)

    print("\n── Resumen ─────────────────────────")
    print(f"  ✅ Actualizadas : {results['updated']}")
    print(f"  ⏭️  Omitidas     : {results['skipped']}")
    print(f"  ❌ Errores      : {results['errors']}")
    print("────────────────────────────────────")


if __name__ == "__main__":
    asyncio.run(populate_movies())