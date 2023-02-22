import { defineConfig } from 'vite'
import { VitePluginVitepressDemo } from 'vite-plugin-vitepress-demo'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vueJsx(),
    VitePluginVitepressDemo(),
  ],
})
