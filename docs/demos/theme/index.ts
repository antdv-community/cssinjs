import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject } from 'vue'
import { TinyColor } from '@ctrl/tinycolor'
import type { CSSObject, Theme } from '../../../src'
import { createTheme, useCacheToken } from '../../../src'
import type { MaybeComputedRef } from '../../../src/util'

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

export const defaultDesignToken: DesignToken = {
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

const defaultTheme = createTheme(derivative)

export const DesignTokenContextKey: InjectionKey<{
  token?: Partial<DesignToken>
  hashed?: string | boolean | undefined
  theme?: Theme<any, any>
}> = Symbol('DesignTokenContext')
export const defaultConfig = {
  token: defaultDesignToken,
  hashed: true,
}

export function useToken(): [MaybeComputedRef<Theme<any, any>>, ComputedRef<DerivativeToken>, ComputedRef<string>] {
  const designTokenContext = inject(DesignTokenContextKey, defaultConfig)
  const salt = computed(() => `${designTokenContext.hashed || ''}`)

  const mergedTheme = computed(() => designTokenContext.theme || defaultTheme)
  const cacheToken = useCacheToken<DesignToken, DerivativeToken>(
    mergedTheme,
    computed(() => {
      return [defaultDesignToken, designTokenContext.token]
    }) as Ref<DesignToken[]>,
    computed(() => ({
      salt: salt.value,
    })),
  )
  return [
    mergedTheme,
    computed(() => cacheToken.value[0]) as any,
    computed(() => (designTokenContext.hashed ? cacheToken.value[1] : '')),
  ]
}
