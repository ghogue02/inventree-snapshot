import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Log environment information
console.log('Vite config environment:', {
  NODE_ENV: process.env.NODE_ENV,
  BASE_URL: process.env.BASE_URL,
  PWD: process.env.PWD,
  cwd: process.cwd(),
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    process.env.NODE_ENV === 'development' && componentTagger(),
    {
      name: 'log-env',
      configResolved(config) {
        console.log('Resolved config:', {
          base: config.base,
          mode: config.mode,
          root: config.root,
          publicDir: config.publicDir,
        });
      },
    },
  ].filter(Boolean),
  base: '/inventree-snapshot/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envPrefix: 'VITE_',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
});
