import { onMounted } from 'vue'
import useShared from './useShared'

type ShareStyle<T extends number | null> = Record<'width' | 'height', T>

interface Options {
  getEl: () => HTMLElement
  resize?: (next: ShareStyle<number>) => void
}

const useParentSize = function(options: Options) {
  const shared = useShared()
  const { state, recordState } = shared

  const preValue: ShareStyle<number | null> = {
    width: null,
    height: null,
  }

  const getByResize = function(type: 'width' | 'height') {
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
        return getByResize('width')
      },
    })
    Object.defineProperty(state, 'parentHeight', {
      get() {
        return getByResize('height')
      },
    })

    recordState()
  })
}

export default useParentSize
