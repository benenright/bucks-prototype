import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Inline plugin: replaces <!-- @include "path/to/partial.html" --> with file contents.
// Path is resolved relative to the project root.
function htmlIncludePlugin() {
  return {
    name: 'html-include',
    transformIndexHtml(html) {
      return html.replace(/<!--\s*@include\s+"([^"]+)"\s*-->/g, (_, src) => {
        const filePath = resolve(__dirname, src.replace(/^\//, ''))
        return readFileSync(filePath, 'utf-8')
      })
    }
  }
}

export default defineConfig({
  root: '.',
  plugins: [htmlIncludePlugin()],
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
        'bin-collections': resolve(__dirname, 'bins-and-recycling/bin-collections/index.html'),
      }
    }
  }
})
