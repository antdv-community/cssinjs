<script lang="ts" setup>
import { ref } from 'vue'
import Button from './components/button'
import DesignTokenContext from './components/DesignTokenContext.vue'
import type { DesignToken } from './theme'
const redTheme = ref<Partial<DesignToken>>({
  primaryColor: 'red',
})
const orangeTheme = ref<Partial<DesignToken>>({
  primaryColor: 'orange',
})
</script>

<template>
  <div style="display: flex;gap:10px">
    <Button>按钮测试</Button>
    <Button type="primary">
      按钮测试
    </Button>
    <Button type="ghost">
      按钮测试
    </Button>
    <DesignTokenContext :token="redTheme" hashed>
      <Button>按钮测试</Button>
      <Button type="primary">
        按钮测试
      </Button>
      <Button type="ghost">
        按钮测试
      </Button>
    </DesignTokenContext>
    <DesignTokenContext :token="orangeTheme" hashed>
      <Button>按钮测试</Button>
      <Button type="primary">
        按钮测试
      </Button>
      <Button type="ghost">
        按钮测试
      </Button>
    </DesignTokenContext>
  </div>
</template>

<style scoped>
</style>
