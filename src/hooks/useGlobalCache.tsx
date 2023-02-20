import type { ComputedRef, Ref } from 'vue'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
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
  const cachePath = ref([...fullPath.value])

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

  watch(() => fullPath.value.slice(), (newVal, oldValue) => {
    clearCache(oldValue)
    cachePath.value = newVal
    fullPathStr.value = newVal.join('-')
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
  return computed(() => {
    const cache = styleContext.cache.get(cachePath.value)
    return cache![1]
  })
}
