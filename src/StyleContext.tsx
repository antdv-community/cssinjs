import type { ExtractPropTypes, InjectionKey, PropType } from 'vue'
import { defineComponent, inject, provide } from 'vue'
import CacheEntity from './Cache'
import type { Linter } from './linters'
import type { Transformer } from './transformers/interface'

export const ATTR_TOKEN = 'data-token-hash'
export const ATTR_MARK = 'data-css-hash'
export const ATTR_DEV_CACHE_PATH = 'data-dev-cache-path'

// Mark css-in-js instance in style element
export const CSS_IN_JS_INSTANCE = '__cssinjs_instance__'
export const CSS_IN_JS_INSTANCE_ID = Math.random().toString(12).slice(2)

export function createCache() {
  if (typeof document !== 'undefined' && document.head && document.body) {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`) || []
    const { firstChild } = document.head

    Array.from(styles).forEach((style) => {
      (style as any)[CSS_IN_JS_INSTANCE]
        = (style as any)[CSS_IN_JS_INSTANCE] || CSS_IN_JS_INSTANCE_ID

      // Not force move if no head
      document.head.insertBefore(style, firstChild)
    })

    // Deduplicate of moved styles
    const styleHash: Record<string, boolean> = {}
    Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach(
      (style) => {
        const hash = style.getAttribute(ATTR_MARK)!
        if (styleHash[hash]) {
          if ((style as any)[CSS_IN_JS_INSTANCE] === CSS_IN_JS_INSTANCE_ID)
            style.parentNode?.removeChild(style)
        }
        else {
          styleHash[hash] = true
        }
      },
    )
  }

  return new CacheEntity()
}

export type HashPriority = 'low' | 'high'

export const styleContextProps = {
  autoClear: {
    type: Boolean as PropType<boolean>,
    default: undefined,
  },
  mock: {
    type: String as PropType<'server' | 'client'>,
    default: undefined,
  },
  cache: {
    type: Object as PropType<CacheEntity>,
    default: () => createCache(),
  },
  defaultCache: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  hashPriority: {
    type: String as PropType<HashPriority>,
    default: 'low',
  },
  container: {
    type: Object as PropType<Element | ShadowRoot>,
    default: undefined,
  },
  ssrInline: {
    type: Boolean as PropType<boolean>,
    default: undefined,
  },
  transformers: {
    type: Array as PropType<Transformer[]>,
    default: undefined,
  },
  linters: {
    type: Array as PropType<Linter[]>,
    default: undefined,
  },
}

export type StyleContextProps = ExtractPropTypes<typeof styleContextProps>

export const STYLE_CONTEXT: InjectionKey<StyleContextProps> = Symbol('styleContext')

export const StyleProvider = defineComponent({
  name: 'StyleProvider',
  props: {
    ...styleContextProps,
  },
  setup(props, { slots }) {
    provide(STYLE_CONTEXT, props)
    return () => {
      return slots?.default?.()
    }
  },
})
export const useStyleContext = () => {
  return inject(STYLE_CONTEXT, {
    cache: createCache(),
    defaultCache: true,
    hashPriority: 'low',
  })
}
