import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions']
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'bins-and-recycling': resolve(__dirname, 'bins-and-recycling/index.html'),
        'bin-collection-days': resolve(__dirname, 'bins-and-recycling/bin-collection-days/index.html'),
      }
    }
  }
})
