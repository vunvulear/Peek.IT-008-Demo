import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@backend': path.resolve(__dirname, 'src/backend'),
      '@frontend': path.resolve(__dirname, 'src/frontend'),
    },
  },
});
