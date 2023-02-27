# @antd-tiny-vue/cssinjs

[![NPM version][npm-image]][npm-url] 

[![npm download][download-image]][download-url] 

[![vitepress](https://img.shields.io/badge/docs%20by-vitepress-blue?style=flat-square)](https://github.com/vuejs/vitepress)

[//]: # ([![build status][github-actions-image]][github-actions-url])

[![Codecov][codecov-image]][codecov-url]

[![bundle size][bundlephobia-image]][bundlephobia-url]

[npm-image]: http://img.shields.io/npm/v/@antd-tiny-vue/cssinjs.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@antd-tiny-vue/cssinjs
[github-actions-image]: https://github.com/antd-tiny-vue/cssinjs/workflows/CI/badge.svg
[github-actions-url]: https://github.com/antd-tiny-vue/cssinjs/actions
[codecov-image]: https://img.shields.io/codecov/c/github/antd-tiny-vue/cssinjs/master.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/antd-tiny-vue/cssinjs/branch/master
[download-image]: https://img.shields.io/npm/dm/@antd-tiny-vue/cssinjs.svg?style=flat-square
[download-url]: https://npmjs.org/package/@antd-tiny-vue/cssinjs
[bundlephobia-url]: https://bundlephobia.com/result?p=@antd-tiny-vue/cssinjs
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/@antd-tiny-vue/cssinjs

Component level cssinjs solution used in [ant.design](https://ant.design). It's a subset of [Emotion](https://emotion.sh/) with design token logic wrapper. Please feel free to use emotion directly if you want to find a web cssinjs solution. cssinjs related dep packages:

- stylis
- @emotion/hash
- @emotion/unitless

## Install

[![@antd-tiny-vue/cssinjs](https://nodei.co/npm/@antd-tiny-vue/cssinjs.png)](https://npmjs.org/package/@antd-tiny-vue/cssinjs)

## Development

```
npm install
npm start
```

## License

@antd-tiny-vue/cssinjs is released under the MIT license.

## API

### StyleProvider

| Prop | Desc | Type | Default |
| --- | --- | --- | --- |
| autoClear | Clear inject style element when component remove. | boolean | false |
| cache | Config cssinjs cache entity. Only set when you need ssr to extract style on you own. | CacheEntity | - |
| hashPriority | Use `:where` selector to reduce hashId css selector priority | `'low' \| 'high'` | `'low'` |
| container | Tell cssinjs where to inject style in. | Element \| ShadowRoot | `document.head` |
| ssrInline | Component wil render inline `<style />` for fallback in SSR. Not recommend. | boolean | false |
| transformers | Transform css before inject in document. Please note that `transformers` do not support dynamic update | Transformer[] | - |

### createCache

return CacheEntity for StyleProvider.

### createTheme

Create theme object. When same algorithm provided, it will return same object.

### Design Token related API

Since `@antd-tiny-vue/cssinjs` use strong constraints for cache hit performance, we recommend to view demo `basic.tsx` for usage and `animation.tsx` for animation usage.

## Transform

When you need transform CSSObject before inject style. You can use `transformers` to handle this:

```vue
<script lang="ts" setup>
import {legacyLogicalPropertiesTransformer, StyleProvider} from '@antd-tiny-vue/cssinjs';

</script>
<template>
  <StyleProvider :transformers="[legacyLogicalPropertiesTransformer]">
    <MyApp />
  </StyleProvider>
</template>

```

Follow are the transform we provide:

#### legacyLogicalPropertiesTransformer

Convert logical properties to legacy properties. e.g. `marginBlockStart` to `marginTop`:

- inset
- margin
- padding
- border

#### px2remTransformer

Convert pixel units to rem units. [px2remTransformer.options](./src/transformers/px2rem.ts)
