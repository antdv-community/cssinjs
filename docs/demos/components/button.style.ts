// 通用框架
import type { DerivativeToken } from '../theme'
import type { CSSInterpolation, CSSObject } from '../../../src'

export const genSharedButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => ({
  [`.${prefixCls}`]: {
    borderColor: token.borderColor,
    borderWidth: token.borderWidth,
    borderRadius: token.borderRadius,

    cursor: 'pointer',

    transition: 'background 0.3s',
  },
})

// 实心底色样式
export const genSolidButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
  postFn: () => CSSObject,
): CSSInterpolation => [
  genSharedButtonStyle(prefixCls, token),
  {
    [`.${prefixCls}`]: {
      ...postFn(),
    },
  },
]

// 默认样式
export const genDefaultButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation =>
  genSolidButtonStyle(prefixCls, token, () => ({
    'backgroundColor': token.componentBackgroundColor,
    'color': token.textColor,

    '&:hover': {
      borderColor: token.primaryColor,
      color: token.primaryColor,
    },
  }))

// 主色样式
export const genPrimaryButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation =>
  genSolidButtonStyle(prefixCls, token, () => ({
    'backgroundColor': token.primaryColor,
    'border': `${token.borderWidth}px solid ${token.primaryColor}`,
    'color': token.reverseTextColor,

    '&:hover': {
      backgroundColor: token.primaryColorDisabled,
    },
  }))

// 透明按钮
export const genGhostButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => [
  genSharedButtonStyle(prefixCls, token),
  {
    [`.${prefixCls}`]: {
      'backgroundColor': 'transparent',
      'color': token.primaryColor,
      'border': `${token.borderWidth}px solid ${token.primaryColor}`,

      '&:hover': {
        borderColor: token.primaryColor,
        color: token.primaryColor,
      },
    },
  },
]
