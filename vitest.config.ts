import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      include: ['src/lib/**/*.ts'],
      reporter: ['text', 'html'],
      // 布局度量是全站可信度的根基 —— 它们必须被覆盖
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
