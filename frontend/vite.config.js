import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 1024,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 1024,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
        },
        '/auth': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'build'
    },
    define: process.env.VITEST === "true" ? {
      "import.meta.env.VITE_MOVIE_API_URL_2": JSON.stringify("http://www.omdbapi.com"),
      "import.meta.env.VITE_MOVIE_API_KEY_2": JSON.stringify("test-key-123"),
    } : {},
    test: {
      environment: "jsdom",
      passWithNoTests: true,
    },
  };
})
