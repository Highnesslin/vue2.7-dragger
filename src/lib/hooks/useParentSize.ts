import { getCurrentInstance, onMounted } from 'vue'
import useShared from './useShared'

type ShareStyle<T extends number | null> = Record<'width' | 'height', T>

interface Options {
  getEl: () => HTMLElement
  resize?: (next: ShareStyle<number>) => void
}

const useParentSize = function(options: Options) {
  const shared = useShared()
  const { state } = shared
  const ins = getCurrentInstance()!.proxy

  const preValue: ShareStyle<number | null> = {
    width: null,
    height: null,
  }

  const getter = function(type: 'width' | 'height') {
    const dom = options.getEl() || { clientWidth: 0, clientHeight: 0 }
    const value = dom[type === 'width' ? 'clientWidth' : 'clientHeight']

    if (preValue[type] !== value) {
      preValue[type] = value
      options.resize &&
        options.resize({
          width: dom.clientWidth,
          height: dom.clientHeight,
        })
    }
    return value
  }

  onMounted(() => {
    const dom = options.getEl()
    if (!dom) {
      throw new Error('找不到父节点' + dom)
    }

    Object.defineProperty(state, 'parentWidth', {
      get() {
        return getter('width')
      },
    })
    Object.defineProperty(state, 'parentHeight', {
      get() {
        return getter('height')
      },
    })

    const { w, h, x, y } = ins.$props

    state.left = x
    state.top = y
    state.right = state.parentWidth - w - state.left
    state.bottom = state.parentHeight - h - state.top
  })
}

export default useParentSize
