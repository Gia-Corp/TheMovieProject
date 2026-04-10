import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log("BACKEND URL:", env.VITE_BACKEND_URL);

  return {
    plugins: [
      react(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
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
    test: {
      passWithNoTests: true,
    },
  };
})
