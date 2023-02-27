import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h } from 'vue'
import { Keyframes, Theme, useCacheToken, useStyleRegister } from '../src'
import type { CSSInterpolation } from '../src'
import { _cf } from '../src/hooks/useStyleRegister'

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

describe('animation', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'))
    styles.forEach((style) => {
      style.parentNode?.removeChild(style)
    })

    _cf!()
  })

  describe('without hashed', () => {
    const genStyle = (): CSSInterpolation => [
      {
        '.box': {
          animation: `${animation.getName()} 1s`,
        },
      },
      animation,
    ]

    const Box = defineComponent({
      setup() {
        const tokens = computed(() => [baseToken])
        const cacheToken = useCacheToken(theme, tokens)
        const info = computed(() => ({
          theme: theme.value,
          token: cacheToken.value[0],
          path: ['.box'],
        }))
        useStyleRegister(info, () => [genStyle()])

        return () => h('div', { class: 'box' })
      },
    })

    it('work', () => {
      expect(document.head.querySelectorAll('style')).toHaveLength(0)

      // Multiple time only has one style instance
      mount(Box)

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(2)

      expect(styles[0].innerHTML).toEqual('.box{animation:anim 1s;}')
      expect(styles[1].innerHTML).toEqual(
        '@keyframes anim{to{transform:rotate(360deg);}}',
      )
    })
  })

  describe('hashed', () => {
    it('should accept Keyframes as animationName value', () => {
      let testHashId = ''

      const Demo = defineComponent({
        setup() {
          const tokens = computed(() => [baseToken])
          const cacheToken = useCacheToken(theme, tokens)
          testHashId = cacheToken.value?.[1]
          const info = computed(() => ({
            theme: theme.value,
            token: cacheToken.value[0],
            path: ['keyframes-hashed'],
            hashId: cacheToken.value?.[1],
          }))
          useStyleRegister(
            info,
            () => [animation, { '.demo': { animationName: animation } }],
          )
          return () => {
            return h('div')
          }
        },
      })
      mount(Demo)

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(2)

      expect(styles[0].innerHTML).toEqual(
          `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      )
      expect(styles[1].innerHTML).toEqual(
          `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      )
    })

    it('could be declared in CSSObject', () => {
      let testHashId = ''

      const Demo = defineComponent({
        setup() {
          const tokens = computed(() => [baseToken])
          const cacheToken = useCacheToken(theme, tokens)
          testHashId = cacheToken.value?.[1]
          const info = computed(() => ({
            theme: theme.value,
            token: cacheToken.value[0],
            path: ['keyframes-in-CSSObject'],
            hashId: cacheToken.value?.[1],
          }))
          useStyleRegister(
            info,
            () => [{ '.demo': { animationName: animation, test: animation } }],
          )
          return () => {
            return h('div')
          }
        },
      })
      mount(Demo)

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(2)

      expect(styles[0].innerHTML).toEqual(
          `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      )
      expect(styles[1].innerHTML).toEqual(
          `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      )
    })

    it('could be used without declaring keyframes', () => {
      let testHashId = ''

      const Demo = defineComponent({
        setup() {
          const tokens = computed(() => [baseToken])
          const cacheToken = useCacheToken(theme, tokens)
          testHashId = cacheToken.value?.[1]
          const info = computed(() => ({
            theme: theme.value,
            token: cacheToken.value[0],
            path: ['keyframes-not-declared'],
            hashId: cacheToken.value?.[1],
          }))
          useStyleRegister(
            info,
            () => [{ '.demo': { animationName: animation } }],
          )
          return () => h('div')
        },
      })
      mount(Demo)

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(2)

      expect(styles[0].innerHTML).toEqual(
          `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      )
      expect(styles[1].innerHTML).toEqual(
          `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      )
    })

    it('keyframes should be only declared once', () => {
      let testHashId = ''
      const anim = animation

      const Demo = defineComponent({
        setup() {
          const tokens = computed(() => [baseToken])
          const cacheToken = useCacheToken(theme, tokens)
          testHashId = cacheToken.value?.[1]
          const info = computed(() => ({
            theme: theme.value,
            token: cacheToken.value[0],
            path: ['keyframes-declared-once'],
            hashId: cacheToken.value?.[1],
          }))
          useStyleRegister(
            info,
            () => [{ '.demo': { animationName: animation, anim } }],
          )
          return () => h('div')
        },
      })
      mount(Demo)

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(2)

      expect(styles[0].innerHTML).toEqual(
          `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      )
      expect(styles[1].innerHTML).toEqual(
          `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      )
    })
  })
})
