<script lang="ts" setup>
import { ref } from 'vue'
import { StyleProvider } from '../../src'
import Button from './components/button'

const show = ref(false)
</script>

<template>
  <StyleProvider auto-clear>
    <div style="background: rgba(0,0,0,0.1); padding: 16px ">
      <div style="font-weight: bold">
        配置同步自动删除添加的样式
      </div>
      <label>
        <input
          v-model="show"
          type="checkbox"
        >
        Show Components
      </label>

      <template v-if="show">
        <div style="display: flex;gap:10px">
          <Button>Default</Button>
          <Button type="primary">
            Primary
          </Button>
          <Button type="ghost">
            Ghost
          </Button>
        </div>
      </template>
    </div>
  </StyleProvider>
</template>

<style scoped>
</style>
