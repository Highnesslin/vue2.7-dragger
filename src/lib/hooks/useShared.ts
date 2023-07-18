import { ComputedRef, computed, getCurrentInstance, reactive, watch } from 'vue'
import { divide, multiply, subtract } from '../utils/number'

type Shared = {
  state: {
    parentWidth: number
    parentHeight: number
    top: number
    right: number
    bottom: number
    left: number
  }
  status: {
    stickDrag: boolean
    bodyDrag: boolean
    dimensionsBeforeMove: {
      pointerX: number
      pointerY: number
      x: number
      y: number
      w: number
      h: number
      top: number
      bottom: number
      left: number
      right: number
      width: number
      height: number
    }
    limits: Record<'left' | 'right' | 'top' | 'bottom', Record<'min' | 'max', number>>
    currentStick: string
    aspectFactor: number
  }
  width: ComputedRef<number>
  height: ComputedRef<number>
  positionStyle: ComputedRef<{
    top: string
    left: string
  }>
  rect: ComputedRef<{
    left: number
    top: number
    width: number
    height: number
  }>

  resetStatus: () => void

  recordState: () => void

  saveDimensionsBeforeMove: (
    { pointerX, pointerY }: Record<'pointerX' | 'pointerY', number>,
    state: Record<'top' | 'right' | 'bottom' | 'left' | 'width' | 'height', number>
  ) => void

  calcDragLimitation: () => {
    left: {
      min: number
      max: number
    }
    right: {
      min: number
      max: number
    }
    top: {
      min: number
      max: number
    }
    bottom: {
      min: number
      max: number
    }
  }

  rectCorrectionByLimit: (
    rect: Record<'left' | 'right' | 'top' | 'bottom', number>
  ) => {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const sharedKey = '__DragComponentSharedKey'

const useShared = function(props?: any) {
  const ins = getCurrentInstance()!.proxy as Vue & {
    __DragComponentSharedKey: Shared
  }

  let shared = ins[sharedKey]

  if (!shared) {
    const { unit } = props || {}

    const unitIsPx = unit === 'px'

    const state = reactive({
      parentWidth: 0,
      parentHeight: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })

    const status = {
      stickDrag: false,
      bodyDrag: false,
      dimensionsBeforeMove: {
        pointerX: 0,
        pointerY: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
      },
      limits: {
        left: { min: 0, max: 0 },
        right: { min: 0, max: 0 },
        top: { min: 0, max: 0 },
        bottom: { min: 0, max: 0 },
      },
      currentStick: (null as unknown) as string,
      aspectFactor: 0,
    }

    const width = computed(() => subtract(state.parentWidth, state.left, state.right))

    const height = computed(() => subtract(state.parentHeight, state.top, state.bottom))

    const rateToNumber = function (val: number) {
      const num = parseFloat(val.toString())

      if (!Number.isNaN(num)) {
        return divide(num, 100)
      }

      throw new Error(val + '不是期望类型')
    }

    const getter = {
      left: () => unitIsPx ? props.x : multiply(rateToNumber(props.x), state.parentWidth),
      top: () => {
        return unitIsPx ? props.y : multiply(rateToNumber(props.y), state.parentHeight)
      },
      right: () => unitIsPx ? (state.parentWidth - props.w - state.left) : subtract(subtract(state.parentWidth, multiply(rateToNumber(props.w), state.parentWidth)),  state.left),
      bottom: () => unitIsPx ? (state.parentHeight - props.h - state.top) : subtract(subtract(state.parentHeight, multiply(rateToNumber(props.h), state.parentHeight)), state.top),
    }

    const setter = {
      top: () => {
        return unitIsPx ? state.top : multiply((state.top ? divide(state.top, state.parentHeight) : 0), 100)
      },
      left: () => unitIsPx ? state.left : multiply((state.left ? divide(state.left, state.parentWidth) : 0), 100),
      width: () => unitIsPx ? width.value : multiply((width.value ? divide(width.value, state.parentWidth) : 0), 100),
      height: () => unitIsPx ? height.value : multiply((height.value ? divide(height.value, state.parentHeight) : 0), 100),
    }

    const positionStyle = computed(() => {
      return {
        top: setter.top() + (unitIsPx ? 'px' : '%'),
        left: setter.left() + (unitIsPx ? 'px' : '%'),
        width: setter.width() + (unitIsPx ? 'px' : '%'),
        height: setter.height() + (unitIsPx ? 'px' : '%'),
      }
    })

    const rect = computed(() => ({
      top: setter.top(),
      left: setter.left(),
      width: setter.width(),
      height: setter.height(),
    }))

    // 重新记录一次位置、尺寸信息, 防止子组件无法感知父元素变化
    const recordState = function () {
      state.left = getter.left()
      state.top = getter.top()
      state.right = getter.right()
      state.bottom = getter.bottom()
    }

    const saveDimensionsBeforeMove = function(
      { pointerX, pointerY }: Record<'pointerX' | 'pointerY', number>,
      state: Record<'top' | 'right' | 'bottom' | 'left' | 'width' | 'height', number>
    ) {
      const { width, height, left, right, top, bottom } = state

      status.dimensionsBeforeMove.pointerX = pointerX
      status.dimensionsBeforeMove.pointerY = pointerY

      status.dimensionsBeforeMove.left = left
      status.dimensionsBeforeMove.right = right
      status.dimensionsBeforeMove.top = top
      status.dimensionsBeforeMove.bottom = bottom

      status.dimensionsBeforeMove.width = width
      status.dimensionsBeforeMove.height = height

      status.aspectFactor = width / height
    }

    const calcDragLimitation = function() {
      const parentWidth = state.parentWidth
      const parentHeight = state.parentHeight
      const widthValue = width.value
      const heightValue = height.value

      return {
        left: { min: 0, max: parentWidth - widthValue },
        right: { min: 0, max: parentWidth - widthValue },
        top: { min: 0, max: parentHeight - heightValue },
        bottom: { min: 0, max: parentHeight - heightValue },
      }
    }

    const sideCorrectionByLimit = function(limit: Record<'min' | 'max', number>, current: number) {
      let value = current

      if (current < limit.min) {
        value = limit.min
      } else if (limit.max < current) {
        value = limit.max
      }

      return value
    }

    const rectCorrectionByLimit = function(rect: Record<'left' | 'right' | 'top' | 'bottom', number>) {
      const { limits } = status
      const { right, left, bottom, top } = rect

      return {
        top: sideCorrectionByLimit(limits.top, top),
        right: sideCorrectionByLimit(limits.right, right),
        bottom: sideCorrectionByLimit(limits.bottom, bottom),
        left: sideCorrectionByLimit(limits.left, left),
      }
    }

    const resetStatus = function() {
      status.dimensionsBeforeMove = {
        pointerX: 0,
        pointerY: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
      }
      status.limits = {
        left: { min: 0, max: 0 },
        right: { min: 0, max: 0 },
        top: { min: 0, max: 0 },
        bottom: { min: 0, max: 0 },
      }
    }

    watch([() => props.x, () => props.y, () => props.w, () => props.h], ([newLeft, newTop, newWidth, newHeight]) => {
      if (status.stickDrag || status.bodyDrag) return

      if (newLeft !== state.left || newTop !== state.top || newWidth !== width.value, newHeight !== height.value) {
        recordState()
      }
    })

    shared = {
      state,
      status,
      width,
      height,
      positionStyle,
      rect,
      resetStatus,
      saveDimensionsBeforeMove,
      recordState,
      calcDragLimitation,
      rectCorrectionByLimit,
    }
    ;(ins as any)[sharedKey] = shared
  }

  return shared as Shared
}

export default useShared
