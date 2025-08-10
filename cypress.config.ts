// cypress.config.ts                 <-- Zwróć uwagę: czysta składnia ESM!
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    env: {
      api: 'http://127.0.0.1:8000/api',
    },
    defaultCommandTimeout: 8000,
    video: false,
  },
});
