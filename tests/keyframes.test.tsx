import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent } from 'vue'
import { Keyframes, Theme, useCacheToken, useStyleRegister } from '../src'

interface DesignToken {
  primaryColor: string
}

interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string
}

const derivative = (designToken: DesignToken): DerivativeToken => ({
  ...designToken,
  primaryColorDisabled: designToken.primaryColor,
})

const baseToken: DesignToken = {
  primaryColor: '#1890ff',
}

const theme = computed(() => new Theme(derivative))
const animation = new Keyframes('anim', {
  to: {
    transform: 'rotate(360deg)',
  },
})

describe('keyframes', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'))
    styles.forEach((style) => {
      style.parentNode?.removeChild(style)
    })
  })

  describe('without hashed', () => {
    const Box = defineComponent({
      setup() {
        const tokens = computed(() => [baseToken])
        const cacheToken = useCacheToken(theme, tokens)

        const info1 = computed(() => ({
          theme: theme.value,
          token: cacheToken.value[0],
          path: ['.box'],
          hashId: cacheToken.value?.[1],
        }))
        useStyleRegister(info1, () => ({
          '.box': {
            animationName: animation,
          },
        }))

        const info2 = computed(() => ({
          theme: theme.value,
          token: cacheToken.value[0],
          path: ['.test'],
          hashId: cacheToken.value?.[1],
        }))
        useStyleRegister(info2, () => ({
          '.test': {
            animationName: animation,
          },
        }))
        const info3 = computed(() => ({
          theme: theme.value,
          token: cacheToken.value[0],
          path: ['.nest'],
          hashId: cacheToken.value?.[1],
        }))
        useStyleRegister(info3, () => ({
          '.nest': {
            '.child': {
              animationName: animation,
            },
          },
        }))

        return () => <div class="hash">{cacheToken.value?.[1]}</div>
      },
    })

    it('no conflict keyframes', () => {
      expect(document.head.querySelectorAll('style')).toHaveLength(0)

      // Multiple time only has one style instance
      const container = mount(Box)
      const hashId = container.find('.hash')?.text()

      let count = 0
      const styles = Array.from(document.head.querySelectorAll('style'))
      styles.forEach((style) => {
        if (style.textContent?.includes(`@keyframes ${hashId}-anim`))
          count += 1
      })

      expect(count).toEqual(1)
    })
  })
})
