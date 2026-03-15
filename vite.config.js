import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'EdibleWC',
      formats: ['iife', 'es'],
      fileName: (format) =>
        format === 'es' ? 'edible-wc.esm.js' : 'edible-wc.js',
    },
    emptyOutDir: true,
    minify: 'esbuild',
    cssCodeSplit: false,
  },

  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.js'],
  },
});
