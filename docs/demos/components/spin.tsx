import { computed, defineComponent } from 'vue'
import classNames from 'classnames'
import type { CSSInterpolation } from '../../../src'
import { Keyframes, useStyleRegister } from '../../../src'
import { useToken } from '../theme'
import type { DerivativeToken } from '../theme'

const animation = new Keyframes('loadingCircle', {
  to: {
    transform: 'rotate(360deg)',
  },
})

// 通用框架
const genSpinStyle = (
  prefixCls: string,
  token: DerivativeToken,
  hashId: string,
): CSSInterpolation => [
  {
    [`.${prefixCls}`]: {
      width: 20,
      height: 20,
      backgroundColor: token.primaryColor,

      animation: `${animation.getName(hashId)} 1s infinite linear`,
    },
  },
  animation,
]

const Spin = defineComponent({
  name: 'ASpin',
  setup(props, { attrs }) {
    const prefixCls = 'ant-spin'
    const [theme, token, hashId] = useToken()
    const registerInfo = computed(() => {
      return { theme: theme.value, token: token.value, hashId: hashId.value, path: [prefixCls] }
    })
    const wrapSSR = useStyleRegister(
      registerInfo,
      () => [genSpinStyle(prefixCls, token.value, hashId.value)],
    )
    return () => {
      return wrapSSR(
        <div {...attrs} class={classNames(prefixCls, hashId.value)} />,
      )
    }
  },
})
export default Spin
