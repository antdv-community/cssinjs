import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
export default defineConfig({
  plugins: [
    vueJsx(),
    dts(),
  ],
  build: {
    rollupOptions: {
      external: [
        '@emotion/hash',
        '@emotion/unitless',
        'csstype',
        'stylis',
        'vue',
      ],
    },
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
  },
})
