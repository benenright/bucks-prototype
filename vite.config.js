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
        'report-it': resolve(__dirname, 'report-it/index.html'),
        search: resolve(__dirname, 'search/index.html'),
        'waste-and-recycling': resolve(__dirname, 'waste-and-recycling/index.html'),
        'bin-collection-days': resolve(__dirname, 'waste-and-recycling/bin-collection-days/index.html'),
        'bin-collections': resolve(__dirname, 'waste-and-recycling/bin-collections/index.html'),
        'replace-bin': resolve(__dirname, 'waste-and-recycling/bin-collections/replace-bin/index.html'),
        'household-recycling-centres': resolve(__dirname, 'waste-and-recycling/household-recycling-centres/index.html'),
        'hrc-find-your-nearest': resolve(__dirname, 'waste-and-recycling/household-recycling-centres/find-your-nearest/index.html'),
        'hrc-hazardous-waste': resolve(__dirname, 'waste-and-recycling/household-recycling-centres/hazardous-waste/index.html'),
        'hrc-permits': resolve(__dirname, 'waste-and-recycling/household-recycling-centres/permits/index.html'),
        'bulky-waste': resolve(__dirname, 'waste-and-recycling/bulky-waste/index.html'),
        'bin-contents': resolve(__dirname, 'waste-and-recycling/bin-collections/bin-contents/index.html'),
        'clinical-sharps-boxes': resolve(__dirname, 'waste-and-recycling/clinical-waste/sharps-boxes/index.html'),
        'street-cleaning': resolve(__dirname, 'waste-and-recycling/street-cleaning/index.html'),
        'street-cleaning-damaged-litter-bin': resolve(__dirname, 'waste-and-recycling/street-cleaning/damaged-litter-bin/index.html'),
        'waste-feedback': resolve(__dirname, 'waste-and-recycling/feedback/index.html'),
        'design-system': resolve(__dirname, 'design-system/index.html'),
      }
    }
  }
})
