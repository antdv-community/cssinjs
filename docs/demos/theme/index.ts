import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject, ref, unref } from 'vue'
import { TinyColor } from '@ctrl/tinycolor'
import type { CSSObject, Theme } from '../../../src'
import { createTheme, useCacheToken } from '../../../src'

export type GetStyle = (prefixCls: string, token: DerivativeToken) => CSSObject

export interface DesignToken {
  primaryColor: string
  textColor: string
  reverseTextColor: string

  componentBackgroundColor: string

  borderRadius: number
  borderColor: string
  borderWidth: number
}

export interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string
}

const defaultDesignToken: DesignToken = {
  primaryColor: '#1890ff',
  textColor: '#333333',
  reverseTextColor: '#FFFFFF',

  componentBackgroundColor: '#FFFFFF',

  borderRadius: 2,
  borderColor: 'black',
  borderWidth: 1,
}

// 模拟推导过程
function derivative(designToken: DesignToken): DerivativeToken {
  return {
    ...designToken,
    primaryColorDisabled: new TinyColor(designToken.primaryColor)
      .setAlpha(0.5).toString(),
  }
}

export const ThemeContext = Symbol('ThemeContext')
export const useThemeContext = () => {
  const theme = inject(ThemeContext, createTheme(derivative))
  return computed(() => unref(theme))
}

export const DesignTokenContext: InjectionKey<{
  token?: Ref< Partial<DesignToken>>
  hashed?: Ref< string | boolean>
}> = Symbol('DesignTokenContext')
export const useDesignTokenContext = () => {
  return inject(DesignTokenContext, {
    token: ref(defaultDesignToken),
  })
}

export function useToken(): [ComputedRef<Theme<any, any>>, ComputedRef<DerivativeToken>, ComputedRef<string>] {
  const designTokenContext
        = useDesignTokenContext()
  const theme = useThemeContext()
  const salt = computed(() => typeof designTokenContext.hashed?.value === 'string' ? designTokenContext.hashed?.value : '')
  const tokens = computed<DesignToken[]>(() => ([
    defaultDesignToken,
    designTokenContext.token?.value || [],
  ] as DesignToken[]))
  const cacheToken = useCacheToken<DerivativeToken, DesignToken>(
    theme,
    tokens,
    computed(() => ({
      salt: salt.value,
    })),
  )
  const token = computed(() => cacheToken.value[0])
  const hashed = computed(() => cacheToken.value[1] ?? '')
  return [theme, token, hashed]
}
