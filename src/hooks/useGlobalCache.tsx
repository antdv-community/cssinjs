import type { ComputedRef, Ref } from 'vue'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useStyleContext } from '../StyleContext'
import type { KeyType } from '../Cache'
import { checkIsSetup } from '../utils/checkIsSetup'
import useHMR from './useHMR'

export default function useClientCache<CacheType>(
  prefix: string,
  keyPath: Ref<KeyType[]>,
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
): ComputedRef<CacheType> {
  const styleContext = useStyleContext()
  const fullPath = computed(() => {
    return [prefix, ...keyPath.value]
  })
  const fullPathStr = computed(() => {
    return fullPath.value.join('-')
  })

  const HMRUpdate = useHMR()

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
  watch(
    () => fullPath.value,
    (_, oldValue) => {
      clearCache(oldValue)
    },
  )
  // Create cache
  watch(
    fullPathStr,
    () => {
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
    },
    { immediate: true },
  )
  checkIsSetup(() => {
    onBeforeUnmount(() => {
      clearCache(fullPath.value)
    })
  })

  return computed(() => {
    const data = styleContext.cache.get(fullPath.value)
    const [, cache] = data || []
    return cache
  })
}
