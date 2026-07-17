import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The engine reads localStorage and document.hidden.
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
