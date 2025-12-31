
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare var process: any;

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
