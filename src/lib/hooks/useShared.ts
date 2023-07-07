import { ComputedRef, computed, getCurrentInstance, reactive, watch } from 'vue'

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
    const { parentLimitation, x, y } = props || {}
    const state = reactive({
      parentWidth: 0,
      parentHeight: 0,
      top: y,
      right: 0,
      bottom: 0,
      left: x,
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

    const width = computed(() => {
      return (parentLimitation ? state.parentWidth : 0) - state.left - state.right
    })

    const height = computed(() => {
      return (parentLimitation ? state.parentHeight : 0) - state.top - state.bottom
    })

    const positionStyle = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px',
      width: width.value + 'px',
      height: height.value + 'px'
    }))

    const rect = computed(() => ({
      left: Math.round(state.left),
      top: Math.round(state.top),
      width: Math.round(width.value),
      height: Math.round(height.value),
    }))

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
      const w = width.value
      const h = height.value

      return {
        left: { min: 0, max: parentWidth - w },
        right: { min: 0, max: parentWidth - w },
        top: { min: 0, max: parentHeight - h },
        bottom: { min: 0, max: parentHeight - h },
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

    watch(
      () => props.x,
      newVal => {
        if (status.stickDrag || status.bodyDrag || newVal === state.left) {
          return
        }

        state.left = newVal
        state.right = state.parentWidth - state.left - width.value
      }
    )

    watch(
      () => props.y,
      newVal => {
        if (status.stickDrag || status.bodyDrag || newVal === state.top) {
          return
        }

        state.top = newVal
        state.bottom = state.parentHeight - state.top - height.value
      }
    )

    watch(
      () => props.w,
      newVal => {
        if (status.stickDrag || status.bodyDrag || newVal === width.value) {
          return
        }

        state.left = state.parentWidth - newVal - state.right
      }
    )

    watch(
      () => props.h,
      newVal => {
        if (status.stickDrag || status.bodyDrag || newVal === height.value) {
          return
        }

        state.top = state.parentHeight - newVal - state.bottom
      }
    )

    shared = {
      state,
      status,
      width,
      height,
      positionStyle,
      rect,
      resetStatus,
      saveDimensionsBeforeMove,
      calcDragLimitation,
      rectCorrectionByLimit,
    }
    ;(ins as any)[sharedKey] = shared
  }

  return shared as Shared
}

export default useShared
