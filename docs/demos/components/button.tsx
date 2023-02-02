import { computed, defineComponent } from 'vue'
import classNames from 'classnames'
import { useStyleRegister } from '../../../src'
import { useToken } from '../theme'
import { genDefaultButtonStyle, genGhostButtonStyle, genPrimaryButtonStyle } from './button.style'

export default defineComponent({
  name: 'AButton',
  props: {
    type: {
      type: String,
      default: 'default',
    },
  },
  setup(props, { slots, attrs }) {
    const prefixCls = 'ant-btn'
    const [theme, token, hashId] = useToken()
    const registerParam = computed(() => {
      console.log(token, 'token')
      return {
        theme: theme.value,
        token: token.value,
        hashId: hashId.value,
        path: [prefixCls],
      }
    })
    const defaultCls = `${prefixCls}-default`
    const primaryCls = `${prefixCls}-primary`
    const ghostCls = `${prefixCls}-ghost`
    const wrapSSR = useStyleRegister(registerParam, () => [
      genDefaultButtonStyle(defaultCls, token.value),
      genPrimaryButtonStyle(primaryCls, token.value),
      genGhostButtonStyle(ghostCls, token.value),
    ])
    return () => {
      const typeCls: any = {
        [defaultCls]: props.type === 'default',
        [primaryCls]: props.type === 'primary',
        [ghostCls]: props.type === 'ghost',
      }
      const className = slots?.class
      return (wrapSSR(<button class={classNames(prefixCls, typeCls, hashId.value, className)} {...attrs}>
        {slots?.default?.()}
      </button>))
    }
  },
})
