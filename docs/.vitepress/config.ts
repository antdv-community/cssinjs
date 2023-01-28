import { defineConfig } from 'vitepress'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  title: 'antdv-cssinjs',
  description: 'antdv-cssinjs',
  vite: {
    plugins: [
      vueJsx(),
    ],
  },
})
