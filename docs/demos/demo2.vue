<script lang="ts" setup>
import { ref } from 'vue'
import type { DesignToken } from './theme'
import DesignTokenContext from './components/DesignTokenContext.vue'
import Button from './components/button'
import Spin from './components/spin'

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
  <DesignTokenContext :token="dynamicTheme" :hashed="true">
    <!--    <Button type="primary" @click="changeColor"> -->
    <!--      随机颜色设置 -->
    <!--    </Button> -->
    <Button type="primary" @click="changeColor">
      随机颜色设置
    </Button>
    <!--    <Spin /> -->
  </DesignTokenContext>
</template>

<style scoped>
</style>
