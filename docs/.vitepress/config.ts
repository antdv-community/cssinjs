import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'antdv-cssinjs',
  description: 'antdv-cssinjs',
  themeConfig: {
    sidebar: [
      {
        text: 'Button和Spin实现',
        link: '/comp',
      },
      {
        text: '基本用法',
        link: '/basic',
      },
      {
        text: '动画',
        link: '/animation',
      },
      {
        text: 'AutoClear',
        link: '/auto-clear',
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/antd-tiny-vue/cssinjs' },
    ],
  },
})
