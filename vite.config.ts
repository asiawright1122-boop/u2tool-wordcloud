import { defineConfig } from 'vite';

export default defineConfig({
  base: '/u2tool-wordcloud/',
  build: {
    chunkSizeWarningLimit: 1600,
  },
  test: {
    environment: 'node',
  },
} as never);
