import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Rutas relativas para que funcione tanto en localhost como en GitHub Pages (/Proyecto-Gestion-FInanciera-2026/)
  base: './',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
