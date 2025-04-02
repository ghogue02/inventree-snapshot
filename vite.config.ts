import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
  base: '/inventree-snapshot/',
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    reportCompressedSize: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
});
