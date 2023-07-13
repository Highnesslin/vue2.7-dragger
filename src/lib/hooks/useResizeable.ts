import { getCurrentInstance } from 'vue'
import useShared from './useShared'

const styleMapping = {
  y: {
    t: 'top',
    m: 'marginTop',
    b: 'bottom',
  },
  x: {
    l: 'left',
    m: 'marginLeft',
    r: 'right',
  },
}

type Options = {
  isResizeable: () => boolean
  stickSize: number
  aspectRatio: boolean
}
const useResizeable = function(options: Options) {
  const { stickSize, isResizeable, aspectRatio } = options

  const ins = getCurrentInstance()!.proxy

  const {
    state,
    status,
    width,
    height,
    rect,
    recordState,
    resetStatus,
    saveDimensionsBeforeMove,
    rectCorrectionByLimit,
  } = useShared()

  const vdrStick = function(stick: 'tl' | 'tm' | 'tr' | 'mr' | 'br' | 'bm' | 'bl' | 'ml') {
    const stickStyle = {
      width: `${stickSize}px`,
      height: `${stickSize}px`,
    }
    // @ts-ignore
    stickStyle[styleMapping.y[stick[0]]] = `${stickSize / -2}px`
    // @ts-ignore
    stickStyle[styleMapping.x[stick[1]]] = `${stickSize / -2}px`
    return stickStyle
  }

  const calcResizeLimits = function() {
    const { aspectFactor } = status
    const widthValue = width.value
    const heightValue = height.value
    const { bottom, top, left, right } = state

    const limits: typeof status.limits = {
      left: { min: 0, max: left + widthValue },
      right: { min: 0, max: right + widthValue },
      top: { min: 0, max: top + heightValue },
      bottom: { min: 0, max: bottom + heightValue },
    }

    if (aspectRatio) {
      const aspectLimits = {
        left: {
          min: left - Math.min(top, bottom) * aspectFactor * 2,
          max: left + (heightValue / 2) * aspectFactor * 2,
        },
        right: {
          min: right - Math.min(top, bottom) * aspectFactor * 2,
          max: right + (heightValue / 2) * aspectFactor * 2,
        },
        top: {
          min: top - (Math.min(left, right) / aspectFactor) * 2,
          max: top + (widthValue / 2 / aspectFactor) * 2,
        },
        bottom: {
          min: bottom - (Math.min(left, right) / aspectFactor) * 2,
          max: bottom + (widthValue / 2 / aspectFactor) * 2,
        },
      }

      if (status.currentStick[0] === 'm') {
        limits.left = {
          min: Math.max(limits.left.min, aspectLimits.left.min),
          max: Math.min(limits.left.max, aspectLimits.left.max),
        }
        limits.right = {
          min: Math.max(limits.right.min, aspectLimits.right.min),
          max: Math.min(limits.right.max, aspectLimits.right.max),
        }
      } else if (status.currentStick[1] === 'm') {
        limits.top = {
          min: Math.max(limits.top.min, aspectLimits.top.min),
          max: Math.min(limits.top.max, aspectLimits.top.max),
        }
        limits.bottom = {
          min: Math.max(limits.bottom.min, aspectLimits.bottom.min),
          max: Math.min(limits.bottom.max, aspectLimits.bottom.max),
        }
      }
    }

    return limits
  }

  const rectCorrectionByAspectRatio = function(rect: Record<'left' | 'right' | 'top' | 'bottom', number>) {
    let { left, right, top, bottom } = rect
    const { currentStick, aspectFactor, dimensionsBeforeMove } = status
    const parentWidth = state.parentWidth
    const parentHeight = state.parentHeight

    let newWidth = parentWidth - left - right
    let newHeight = parentHeight - top - bottom

    if (currentStick[1] === 'm') {
      const deltaHeight = newHeight - dimensionsBeforeMove.height

      left -= (deltaHeight * aspectFactor) / 2
      right -= (deltaHeight * aspectFactor) / 2
    } else if (currentStick[0] === 'm') {
      const deltaWidth = newWidth - dimensionsBeforeMove.width

      top -= deltaWidth / aspectFactor / 2
      bottom -= deltaWidth / aspectFactor / 2
    } else if (newWidth / newHeight > aspectFactor) {
      newWidth = aspectFactor * newHeight

      if (currentStick[1] === 'l') {
        left = parentWidth - right - newWidth
      } else {
        right = parentWidth - left - newWidth
      }
    } else {
      newHeight = newWidth / aspectFactor

      if (currentStick[0] === 't') {
        top = parentHeight - bottom - newHeight
      } else {
        bottom = parentHeight - top - newHeight
      }
    }

    return { left, right, top, bottom }
  }

  const stickDown = function<E extends Record<'pageX' | 'pageY', number>>(stick: string, ev: E, force = false) {
    if (!isResizeable() && !force) {
      return
    }

    recordState()

    status.stickDrag = true

    const pointerX = ev.pageX
    const pointerY = ev.pageY

    saveDimensionsBeforeMove(
      { pointerX, pointerY },
      {
        width: width.value,
        height: height.value,
        top: state.top,
        right: state.right,
        bottom: state.bottom,
        left: state.left,
      }
    )

    status.currentStick = stick

    status.limits = calcResizeLimits()
  }

  const stickMove = function(delta: Record<'x' | 'y', number>) {
    const { dimensionsBeforeMove } = status

    let draft = {
      top: dimensionsBeforeMove.top,
      bottom: dimensionsBeforeMove.bottom,
      left: dimensionsBeforeMove.left,
      right: dimensionsBeforeMove.right,
    }

    switch (status.currentStick[0]) {
      case 'b':
        draft.bottom = dimensionsBeforeMove.bottom + delta.y

        break

      case 't':
        draft.top = dimensionsBeforeMove.top - delta.y

        break
      default:
        break
    }

    switch (status.currentStick[1]) {
      case 'r':
        draft.right = dimensionsBeforeMove.right + delta.x

        break

      case 'l':
        draft.left = dimensionsBeforeMove.left - delta.x

        break
      default:
        break
    }

    draft = rectCorrectionByLimit(draft)

    if (aspectRatio) {
      draft = rectCorrectionByAspectRatio(draft)
    }

    state.left = draft.left
    state.right = draft.right
    state.top = draft.top
    state.bottom = draft.bottom

    ins.$emit('resizing', rect.value)
  }

  const stickUp = function() {
    status.stickDrag = false

    resetStatus()

    ins.$emit('resizing', rect.value)
    ins.$emit('resizestop', rect.value)
  }

  return {
    vdrStick,
    stickDown,
    stickMove,
    stickUp,
  }
}

export default useResizeable
