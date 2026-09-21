import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'qr-engine': ['qr-code-styling']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
