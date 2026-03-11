import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Rewrite /admin routes to the admin entry point in dev
function adminRewrite(): Plugin {
  return {
    name: 'admin-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && (req.url === '/admin' || req.url === '/admin/' || req.url.startsWith('/admin/#'))) {
          req.url = '/src/admin/index.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [adminRewrite(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'src/admin/index.html'),
      },
    },
  },
})
