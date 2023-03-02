import { mount as render } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import type { PropType } from 'vue'
import { computed, defineComponent, watch } from 'vue'
import {
  StyleProvider,
  Theme,
  createCache,
  useCacheToken,
  useStyleRegister,
} from '../src'
import type { CSSInterpolation } from '../src'
import {
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
  CSS_IN_JS_INSTANCE_ID,
} from '../src/StyleContext'

const classs = (...args: any) => args
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
const cpBaseToken = (tokens: any[]) => computed(() => [...tokens])

const cpc = (data: any) => computed(() => data)

const theme = computed(() => new Theme(derivative))

describe('csssinjs', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'))
    styles.forEach((style) => {
      style.parentNode?.removeChild(style)
    })
  })

  const genStyle = (token: DerivativeToken): CSSInterpolation => ({
    '.box': {
      width: 93,
      lineHeight: 1,
      backgroundColor: token.primaryColor,
    },
  })

  const Box = defineComponent({
    props: {
      propToken: {
        type: Object,
        default: () => baseToken,
      },
    },
    setup(props) {
      const cacheToken = useCacheToken<DerivativeToken>(theme, computed(() => [props.propToken]))
      const token = cacheToken.value?.[0]
      const info = computed(() => ({
        theme: theme.value,
        token,
        path: ['.box'],
      }))

      useStyleRegister(info, () => [genStyle(token)])
      return () => {
        return <div class="box" />
      }
    },
  })

  it('theme', () => {
    expect(theme.value.getDerivativeToken(baseToken)).toEqual({
      ...baseToken,
      primaryColorDisabled: baseToken.primaryColor,
    })
  })

  describe('Component', () => {
    it('useToken', () => {
      // Multiple time only has one style instance
      const wrapper = render(defineComponent({
        setup() {
          return () => (<div>
              <Box />
              <Box />
              <Box />
          </div>)
        },
      }))

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(1)

      const style = styles[0]
      expect(style.innerHTML).toEqual(
        '.box{width:93px;line-height:1;background-color:#1890ff;}',
      )

      // Default not remove style
      wrapper.unmount()
      expect(document.head.querySelectorAll('style')).toHaveLength(1)
    })

    // We will not remove style immediately,
    // but remove when second style patched.
    it('remove old style to ensure style set only exist one', () => {
      const wrapper = render(Box)
      expect(document.head.querySelectorAll('style')).toHaveLength(1)

      // First change
      wrapper.setProps({
        propToken: {
          primaryColor: 'red',
        },
      })
      expect(document.head.querySelectorAll('style')).toHaveLength(1)

      // Second change
      wrapper.setProps({
        propToken: {
          primaryColor: 'green',
        },
      })
      expect(document.head.querySelectorAll('style')).toHaveLength(1)
    })

    // it('remove style when unmount', () => {
    //   const Demo = defineComponent({
    //     setup() {
    //       return () => (
    //           <StyleProvider autoClear>
    //               <Box />
    //           </StyleProvider>
    //       )
    //     },
    //   })
    //
    //   const wrapper = render(Demo)
    //   expect(document.head.querySelectorAll('style')).toHaveLength(1)
    //
    //   wrapper.unmount()
    //   expect(document.head.querySelectorAll('style')).toHaveLength(0)
    // })
  })

  it('nest style', () => {
    const genNestStyle = (token: DerivativeToken): CSSInterpolation => ({
      '.parent': {
        '.child': {
          'background': token.primaryColor,

          '&:hover': {
            borderColor: token.primaryColor,
          },
        },
      },
    })

    const Nest = defineComponent({
      setup() {
        const cacheToken = useCacheToken<DerivativeToken>(theme, cpBaseToken([baseToken]))
        const token = cacheToken?.value?.[0]
        const info = computed(() => ({
          theme: theme.value,
          token,
          path: ['.parent'],
        }))
        useStyleRegister(info, () => [
          genNestStyle(token),
        ])

        return () => null
      },
    })

    render(Nest)

    const styles = Array.from(document.head.querySelectorAll('style'))
    expect(styles).toHaveLength(1)

    const style = styles[0]
    expect(style.innerHTML).toEqual(
      '.parent .child{background:#1890ff;}.parent .child:hover{border-color:#1890ff;}',
    )
  })

  it('serialize nest object token', () => {
    const TokenShower = defineComponent({
      setup() {
        const cacheToken = useCacheToken(theme, computed(() => [
          {
            nest: {
              nothing: 1,
            },
          },
        ]))

        return () => cacheToken.value?.[0]?._tokenKey
      },
    })

    const wrapper = render(TokenShower)

    // src/util.tsx - token2key func
    expect(wrapper.text()).toEqual('rqtnqb')
  })

  it('hash', () => {
    const genHashStyle = (): CSSInterpolation => ({
      '.a,.b, .c .d': {
        background: 'red',
      },
    })

    const Holder = defineComponent({
      setup() {
        const cacheToken = useCacheToken<DerivativeToken>(theme, computed(() => []), computed(() => ({
          salt: 'test',
        })))
        const [token, hashId] = cacheToken.value

        useStyleRegister(computed(() => ({ theme: theme.value, token, hashId, path: ['holder'] })), () => [
          genHashStyle(),
        ])

        return () => {
          return <div class={classs('box', hashId)} />
        }
      },
    })

    const wrapper = render(Holder)

    const styles = Array.from(document.head.querySelectorAll('style'))
    expect(styles).toHaveLength(1)

    const style = styles[0]
    expect(style.innerHTML).toContain(
      ':where(.css-dev-only-do-not-override-6dmvpu).a',
    )
    expect(style.innerHTML).toContain(
      ':where(.css-dev-only-do-not-override-6dmvpu).b',
    )
    expect(style.innerHTML).toContain(
      ':where(.css-dev-only-do-not-override-6dmvpu).c .d',
    )

    wrapper.unmount()
  })

  describe('override', () => {
    interface MyDerivativeToken extends DerivativeToken {
      color: string
    }

    const genOverrideStyle = (token: MyDerivativeToken): CSSInterpolation => ({
      '.box': {
        width: 93,
        lineHeight: 1,
        backgroundColor: token.primaryColor,
        color: token.color,
      },
    })

    const OverBox = defineComponent({
      props: {
        propToken: Object as PropType<DesignToken>,
        override: Object,
      },
      setup(props) {
        const cacheToken = useCacheToken<MyDerivativeToken>(theme, cpBaseToken([baseToken]), cpc({
          override: props?.override,
          formatToken: (origin: DerivativeToken) => ({
            ...origin,
            color: origin.primaryColor,
          }),
        }))
        const [token] = cacheToken.value

        useStyleRegister(cpc({ theme: theme.value, token, path: ['.box'] }), () => [
          genOverrideStyle(token),
        ])
        return () => <div class="box" />
      },
    })

    it('work', () => {
      const Demo = defineComponent({
        setup() {
          return () => (
              <OverBox
                  override={{
                    primaryColor: '#010203',
                  }}
              />
          )
        },
      })

      const wrapper = render(Demo)

      const styles = Array.from(document.head.querySelectorAll('style'))
      expect(styles).toHaveLength(1)

      const style = styles[0]
      expect(style.innerHTML).toContain('background-color:#010203;')
      expect(style.innerHTML).toContain('color:#010203;')

      wrapper.unmount()
    })
  })

  // it('style should contain instance id', () => {
  //   const genDemoStyle = (token: DerivativeToken): CSSInterpolation => ({
  //     div: {
  //       color: token.primaryColor,
  //     },
  //   })
  //
  //   const Demo = defineComponent({
  //     props: {
  //       colorPrimary: {
  //         type: String,
  //         default: 'red',
  //       },
  //     },
  //     setup(props) {
  //       const cacheToken = useCacheToken<DerivativeToken>(
  //         theme,
  //         computed(() => {
  //           return [{ primaryColor: props.colorPrimary }]
  //         }),
  //         computed(() => ({
  //           salt: 'test',
  //         })),
  //       )
  //
  //       // const [token, hashId] = cacheToken.value
  //
  //       useStyleRegister(
  //         computed(() => ({ theme: theme.value, token: cacheToken.value[0], hashId: cacheToken.value[1], path: ['cssinjs-instance'] })),
  //         () => [genDemoStyle(cacheToken.value[0])],
  //       )
  //
  //       return () => <div class={classs('box', cacheToken.value[1])} />
  //     },
  //   })
  //
  //   const wrapper = render(Demo)
  //   const styles = document.querySelectorAll(`style[${ATTR_TOKEN}]`)
  //   expect(styles.length).toBe(1)
  //   // expect(
  //   //   Array.from(styles).some(style => style.innerHTML.includes('color:red')),
  //   // ).toBeTruthy()
  //   expect((styles[0] as any)[CSS_IN_JS_INSTANCE]).toBe(CSS_IN_JS_INSTANCE_ID)
  //
  //   wrapper.setProps({
  //     colorPrimary: 'blue',
  //   })
  //   const stylesRe = document.querySelectorAll(`style[${ATTR_TOKEN}]`)
  //   expect(stylesRe.length).toBe(1)
  //   expect(
  //     Array.from(stylesRe).some((style) => {
  //       console.log(style.innerHTML)
  //       return style.innerHTML.includes('color:blue')
  //     }
  //       ,
  //     ),
  //   ).toBeTruthy()
  //   expect((styles[0] as any)[CSS_IN_JS_INSTANCE]).toBe(CSS_IN_JS_INSTANCE_ID);
  //   (stylesRe[0] as any)[CSS_IN_JS_INSTANCE] = '123'
  //
  //   wrapper.setProps({
  //     colorPrimary: 'yellow',
  //   })
  //   const stylesRe2 = document.querySelectorAll(`style[${ATTR_TOKEN}]`)
  //   expect(stylesRe2.length).toBe(1)
  //   // expect(
  //   //   Array.from(stylesRe2).some(style =>
  //   //     style.innerHTML.includes('color:blue'),
  //   //   ),
  //   // ).toBeTruthy()
  //   // expect(
  //   //   Array.from(stylesRe2).some(style =>
  //   //     style.innerHTML.includes('color:yellow'),
  //   //   ),
  //   // ).toBeTruthy()
  // })

  it('style under hash should work without hash', () => {
    const genStyle1 = (token: DerivativeToken): CSSInterpolation => ({
      a: {
        color: token.primaryColor,
      },
    })
    const genStyle2 = (): CSSInterpolation => ({
      div: {
        color: 'blue',
      },
    })

    let hash = ''

    const Demo = defineComponent({
      props: {
        colorPrimary: {
          type: String,
          default: 'red',
        },
      },
      setup(props) {
        const cacheToken = useCacheToken<DerivativeToken>(
          theme,
          cpc([{ primaryColor: props.colorPrimary }]),
          cpc({
            salt: 'test',
          }),
        )
        const [token, hashId] = cacheToken.value
        hash = hashId

        useStyleRegister(
          cpc({ theme, token, path: ['cssinjs-style-directly-under-hash'] }),
          () => [{ '&': genStyle1(token) }, { '': genStyle2() }],
        )

        useStyleRegister(
          cpc({
            theme,
            token,
            hashId,
            path: ['cssinjs-style-directly-under-hash-hashed'],
          }),
          () => [{ '&': genStyle1(token) }, { '': genStyle2() }],
        )

        return () => {
          return <div class={classs('box')} />
        }
      },
    })

    render(Demo)
    const styles = Array.from(document.head.querySelectorAll('style'))
    expect(styles).toHaveLength(2)

    expect(styles[0].innerHTML).toBe('a{color:red;}div{color:blue;}')
    expect(styles[1].innerHTML).toBe(
            `:where(.${hash}) a{color:red;}:where(.${hash}) div{color:blue;}`,
    )
  })

  // https://github.com/ant-design/ant-design/issues/38911
  // it('StyleProvider with target insert style container', () => {
  //   const container = document.createElement('div')
  //
  //   // Multiple time only has one style instance
  //   const Demo = defineComponent({
  //     setup() {
  //       return () => <StyleProvider cache={createCache()} container={container}>
  //         <Box />
  //       </StyleProvider>
  //     },
  //   })
  //   render(Demo)
  //
  //   // expect(container.querySelectorAll('style')).toHaveLength(1)
  // })
})
