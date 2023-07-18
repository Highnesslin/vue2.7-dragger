import useRefLine from './useRefLine'
import useShared from './useShared'

type Params = {
  isDraggable: () => boolean
  event?: {
    onMouseDown?: () => void
    onMove?: (params: Record<'top' | 'right' | 'bottom' | 'left', number>) => void
    onMoveEnd?: () => void
  }
}
const useDraggable = (options: Params) => {
  const { isDraggable, event: { onMouseDown, onMove, onMoveEnd } = {} } = options

  const {
    state,
    status,
    width,
    height,
    recordState,
    resetStatus,
    saveDimensionsBeforeMove,
    calcDragLimitation,
    rectCorrectionByLimit,
  } = useShared()

  const { horizontalLine, verticalLine, resetRefLine, nearBounds } = useRefLine()

  const bodyDown = function(ev: MouseEvent) {
    const { button } = ev

    onMouseDown && onMouseDown()

    if (button && button !== 0) {
      return
    }

    if (!isDraggable()) {
      return
    }

    if (typeof ev.stopPropagation !== 'undefined') {
      ev.stopPropagation()
    }

    if (typeof ev.preventDefault !== 'undefined') {
      ev.preventDefault()
    }

    recordState()

    status.bodyDrag = true

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

    status.limits = calcDragLimitation()
  }

  const bodyMove = function<E extends Record<'x' | 'y', number>>(delta: E) {
    if (!isDraggable()) return

    const { dimensionsBeforeMove } = status

    let draft = {
      top: dimensionsBeforeMove.top - delta.y,
      right: dimensionsBeforeMove.right + delta.x,
      bottom: dimensionsBeforeMove.bottom + delta.y,
      left: dimensionsBeforeMove.left - delta.x,
    }

    draft = rectCorrectionByLimit(draft)

    draft = nearBounds(
      {
        parentWidth: state.parentWidth,
        parentHeight: state.parentHeight,
        width: width.value,
        height: height.value,
      },
      draft
    )

    state.top = draft.top
    state.right = draft.right
    state.bottom = draft.bottom
    state.left = draft.left

    onMove && onMove(draft)
  }

  const bodyUp = function() {
    if (!isDraggable()) return

    status.bodyDrag = false

    resetStatus()

    onMoveEnd && onMoveEnd()
    resetRefLine()
  }

  return {
    horizontalLine,
    verticalLine,
    state,
    status,
    width,
    height,
    bodyDown,
    bodyMove,
    bodyUp,
  }
}

export default useDraggable
