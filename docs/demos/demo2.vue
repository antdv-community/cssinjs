<script lang="ts" setup>
import { ref } from 'vue'
import type { DesignToken } from './theme'
import DesignTokenContext from './components/DesignTokenContext.vue'
import Button from './components/button'

const randomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`
const dynamicTheme = ref<Partial<DesignToken>>({
  primaryColor: randomColor(),
})
const changeColor = () => {
  dynamicTheme.value.primaryColor = randomColor()
}
</script>

<template>
  <DesignTokenContext :token="dynamicTheme">
    <Button type="primary" @click="changeColor">
      随机颜色设置
    </Button>
  </DesignTokenContext>
</template>

<style scoped>
</style>
