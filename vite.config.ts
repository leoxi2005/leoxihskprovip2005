import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The site is served from https://leoxi2005.github.io/leoxihskprovip2005/, so asset
  // URLs need that prefix. Dev keeps "/" — a base of "./" would break the dev server.
  base: process.env.NODE_ENV === 'production' ? '/leoxihskprovip2005/' : '/',
});
