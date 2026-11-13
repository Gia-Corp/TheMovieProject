// Variables de entorno para los tests de frontend.
// frontend/.env no está versionado (está en .gitignore), así que en CI
// estas claves no existen. Las mockeamos acá para que los tests sean
// deterministas tanto en local como en GitHub Actions sin depender de secrets.
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_MOVIE_API_URL_2: "http://www.omdbapi.com",
    VITE_MOVIE_API_KEY_2: "test-key-123",
  },
  configurable: true,
  writable: true,
});
