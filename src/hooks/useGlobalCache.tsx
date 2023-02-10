import type { ComputedRef, Ref } from 'vue'
import { computed, onBeforeUnmount, shallowRef, watch, watchSyncEffect } from 'vue'
import { useStyleInject } from '../StyleContext'
import type { KeyType } from '../Cache'
import useHMR from './useHMR'

export default function useClientCache<CacheType>(
  prefix: string,
  keyPath: Ref<KeyType[]>,
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
): ComputedRef<CacheType> {
  const styleContext = useStyleInject()
  const fullPathStr = shallowRef('')

  const fullPath = computed(() => {
    return [prefix, ...keyPath.value]
  })
  const oldPath = shallowRef([...fullPath.value])

  const clearCache = (paths: typeof fullPath.value) => {
    styleContext.cache.update(paths, (prevCache) => {
      const [times = 0, cache] = prevCache || []
      const nextCount = times - 1

      if (nextCount === 0) {
        onCacheRemove?.(cache, false)
        return null
      }

      return [times - 1, cache]
    })
  }

  watchSyncEffect(() => {
    const newPath = fullPath.value.join('_')
    if (newPath !== fullPathStr.value) {
      clearCache(oldPath.value)
      fullPathStr.value = fullPath.value.join('_')
      oldPath.value = [...fullPath.value]
    }
  })

  const HMRUpdate = useHMR()

  const flush = () => {
    styleContext.cache.update(fullPath.value, (prevCache) => {
      const [times = 0, cache] = prevCache || []

      // HMR should always ignore cache since developer may change it
      let tmpCache = cache
      if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
        onCacheRemove?.(tmpCache, HMRUpdate)
        tmpCache = null
      }

      const mergedCache = tmpCache || cacheFn()

      return [times + 1, mergedCache]
    })
  }
  // Create cache
  watch(
    fullPathStr,
    () => {
      flush()
    },
    { immediate: true },
  )
  onBeforeUnmount(() => {
    clearCache(fullPath.value)
  })
  const val = computed(() => {
    const cache = styleContext.cache.get(fullPath.value)
    if (!cache) {
      flush()
      const cache = styleContext.cache.get(fullPath.value)
      return cache![1]
    }
    return cache[1]
  })
  return val
}
