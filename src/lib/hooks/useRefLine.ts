import { reactive, getCurrentInstance, onMounted, onUnmounted, toRefs } from 'vue'
import { DragInstance, useDetectionContainers } from '../Detection'
import check from '../utils/ref-line'
import useShared from './useShared'

const useRefLine = function() {
  const { proxy: instance } = (getCurrentInstance() as unknown) as { proxy: DragInstance }
  const containers = useDetectionContainers()
  const shared = useShared()

  const reflineState = reactive<{
    horizontalLine: (number | null)[] | undefined
    verticalLine: (number | null)[] | undefined
  }>({
    // 水平辅助线
    horizontalLine: undefined,
    // 垂直辅助线
    verticalLine: undefined,
  })

  // TODO: 下个版本删除 - 
  if (shared.checkDetection) {
    onMounted(() => {
      containers && containers.add(instance.$el)
    })
  
    onUnmounted(() => {
      containers && containers.delete(instance.$el)
    })
  }

  const changeCheckNodes: Element[] = []

  const resetRefLine = function() {
    reflineState.horizontalLine = undefined
    reflineState.verticalLine = undefined

    let cur
    while ((cur = changeCheckNodes.pop())) {
      cur.classList.remove('checking')
    }
  }

  const nearBounds = function(
    { parentWidth, parentHeight, width, height }: Record<'parentWidth' | 'parentHeight' | 'width' | 'height', number>,
    { top, right, bottom, left }: Record<'top' | 'right' | 'bottom' | 'left', number>
  ) {

    if (containers) {
      resetRefLine()

      const arr = containers || new Set()

      // TODO: 下个版本删除 - 考虑到会有shared.checkDetection, 这里会把当前dom添加两次进来
      const [dragNode, checkNodes] = [...arr!, instance.$el].reduce<[Element, Element[]]>(
        (result, item) => {
          if (item === instance.$el) {
            result[0] = item
          } else {
            result[1].push(item)
          }
          return result
        },
        [(null as unknown) as Element, []]
      )
  
      let tempVerticalLine: typeof reflineState.verticalLine
      let tempHorizontalLine: typeof reflineState.horizontalLine
  
      // 2. 设置新的对齐线
      check(dragNode, checkNodes, {
        gap: 5,
        callback: (node, conditions) => {
          const checkCur = () => {
            if (!changeCheckNodes.includes(node)) {
              changeCheckNodes.push(node)
              node.classList.add('checking')
            }
          }
  
          tempVerticalLine = conditions.top.map((ins, index) => {
            if (!ins.isNearly) return tempVerticalLine ? tempVerticalLine[index] : null
  
            checkCur()
  
            if (Math.abs(top - ins.dragValue) < 10) {
              top = ins.dragValue
              bottom = parentHeight - height - top
            }
  
            return ins.lineValue
          })
  
          tempHorizontalLine = conditions.left.map((ins, index) => {
            if (!ins.isNearly) return tempHorizontalLine ? tempHorizontalLine[index] : null
  
            checkCur()
  
            if (!changeCheckNodes.includes(node)) {
              changeCheckNodes.push(node)
            }
  
            if (Math.abs(left - ins.dragValue) < 10) {
              left = ins.dragValue
              right = parentWidth - width - left
            }
  
            return ins.lineValue
          })
        },
      })
  
      reflineState.horizontalLine = tempHorizontalLine
      reflineState.verticalLine = tempVerticalLine
    }

    return { top, right, bottom, left }
  }

  return {
    nearBounds,
    resetRefLine,
    ...toRefs(reflineState),
  }
}

export default useRefLine
