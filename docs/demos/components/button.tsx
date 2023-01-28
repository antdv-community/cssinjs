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
  setup(props, { slots }) {
    const [theme, token, hashId] = useToken()
    const prefixCls = 'ant-btn'
    const registerParam = computed(() => {
      return {
        theme: theme.value,
        token: token.value,
        hashId: hashId.value,
        path: [prefixCls],
      }
    })

    return () => {
      const defaultCls = `${prefixCls}-default`
      const primaryCls = `${prefixCls}-primary`
      const ghostCls = `${prefixCls}-ghost`
      const wrapSSR = useStyleRegister(registerParam, () => [
        genDefaultButtonStyle(defaultCls, token.value),
        genPrimaryButtonStyle(primaryCls, token.value),
        genGhostButtonStyle(ghostCls, token.value),
      ])
      const typeCls: any = {
        [defaultCls]: props.type === 'default',
        [primaryCls]: props.type === 'primary',
        [ghostCls]: props.type === 'ghost',
      }
      const className = slots?.class
      return (wrapSSR(<button class={classNames(prefixCls, typeCls, hashId.value, className)}>
        {slots?.default?.()}
      </button>))
    }
  },
})
