<script lang="ts" setup>
import type { PropType } from 'vue'
import { provide, toRefs } from 'vue'
import type { DesignToken } from '../theme'
import { DesignTokenContextKey, defaultDesignToken } from '../theme'

const props = defineProps({
  token: {
    type: Object as PropType<Partial<DesignToken>>,
    default: () => defaultDesignToken,
  },
  hashed: {
    type: [Boolean, String] as PropType<boolean | string>,
    default: undefined,
  },
})

provide(DesignTokenContextKey, toRefs(props))
</script>

<template>
  <slot />
</template>
