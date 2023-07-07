/**
 * @param dragNode {Element} 拖拽元素的原生node
 * @param checkNodes {Element} 原生node集合
 */
function check(
  dragNode: Element,
  checkNodes: Element[],
  options: {
    gap: number
    callback: (
      checkNode: Element,
      condition: {
        top: {
          isNearly: boolean
          lineValue: number
          dragValue: number
        }[]
        left: {
          isNearly: boolean
          lineValue: number
          dragValue: number
        }[]
      }
    ) => void
  }
) {
  options = Object.assign(
    {
      gap: 3,
    },
    options
  )

  const dragRectStyle = getComputedStyle(dragNode)
  const dragRect = {
    width: parseFloat(dragRectStyle.width),
    height: parseFloat(dragRectStyle.height),
    top: parseFloat(dragRectStyle.top),
    bottom: parseFloat(dragRectStyle.bottom),
    left: parseFloat(dragRectStyle.left),
    right: parseFloat(dragRectStyle.right),
  }

  const _isNearly = function(dragValue: number, targetValue: number, gap: number) {
    return Math.abs(dragValue - targetValue) <= gap
  }

  Array.from(checkNodes).forEach(item => {
    if (item === dragNode) return

    const checkRectStyle = getComputedStyle(item)
    const checkRect = {
      top: parseFloat(checkRectStyle.top),
      height: parseFloat(checkRectStyle.height),
      bottom: parseFloat(checkRectStyle.bottom),
      left: parseFloat(checkRectStyle.left),
      width: parseFloat(checkRectStyle.width),
      right: parseFloat(checkRectStyle.right),
    }

    const dragWidthHalf = dragRect.width / 2
    const itemWidthHalf = checkRect.width / 2
    const dragHeightHalf = dragRect.height / 2
    const itemHeightHalf = checkRect.height / 2

    const conditions = {
      top: [
        // xt-top 上-上 ✅
        {
          isNearly: _isNearly(dragRect.top, checkRect.top, options.gap),
          lineValue: 0, // checkRect.top,
          dragValue: checkRect.top,
        },
        // xt-bottom 下-上 ✅
        {
          isNearly: _isNearly(dragRect.top + dragRect.height, checkRect.top, options.gap),
          lineValue: dragRect.height, // checkRect.top,
          dragValue: checkRect.top - dragRect.height,
        },
        // xc 中-中 ✅
        {
          isNearly: _isNearly(dragRect.top + dragHeightHalf, checkRect.top + itemHeightHalf, options.gap),
          lineValue: dragHeightHalf, // checkRect.top + itemHeightHalf,
          dragValue: checkRect.top + itemHeightHalf - dragHeightHalf,
        },
        // xb-top 下-下 ✅
        {
          isNearly: _isNearly(dragRect.bottom, checkRect.bottom, options.gap),
          lineValue: dragRect.height, // checkRect.bottom,
          dragValue: checkRect.top + checkRect.height - dragRect.height, // checkRect.bottom - dragRect.height,
        },
        // xb-bottom 上-下 ✅
        {
          isNearly: _isNearly(dragRect.top, checkRect.top + checkRect.height, options.gap),
          lineValue: 0, // checkRect.bottom,
          dragValue: checkRect.top + checkRect.height,
        },
      ],

      left: [
        // yl-left 左-左 ✅
        {
          isNearly: _isNearly(dragRect.left, checkRect.left, options.gap),
          lineValue: 0,
          dragValue: checkRect.left,
        },
        // yl-right 左-右
        {
          isNearly: _isNearly(dragRect.left, checkRect.left + checkRect.width, options.gap),
          lineValue: 0,
          dragValue: checkRect.left + checkRect.width,
        },
        // yc 中-中 ✅
        {
          isNearly: _isNearly(dragRect.left + dragWidthHalf, checkRect.left + itemWidthHalf, options.gap),
          lineValue: dragWidthHalf,
          dragValue: checkRect.left + itemWidthHalf - dragWidthHalf,
        },
        // yr-left 右-右 ✅
        {
          isNearly: _isNearly(dragRect.right, checkRect.right, options.gap),
          lineValue: dragRect.width,
          dragValue: checkRect.left + checkRect.width - dragRect.width, // checkRect.right - dragRect.width,
        },
        // yr-right 右-左 ???
        {
          isNearly: _isNearly(dragRect.left + dragRect.width, checkRect.left, options.gap),
          lineValue: dragRect.width,
          dragValue: checkRect.left - dragRect.width,
        },
      ],
    }

    options.callback(item, conditions)
  })
}

export default check
