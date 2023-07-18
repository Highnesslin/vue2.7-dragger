<template>
  <div
    class="vdr"
    :class="[active || props.isActive ? 'active' : 'inactive', props.contentClass]"
    :style="positionStyle"
    v-on:[eventName]="handleClick"
    @mousedown="bodyDown"
  >
    <!-- 1. 吸附线 -->
    <div v-if="verticalLine" v-for="(line, index) in verticalLine" :key="'vertical' + index" class="align-top" :style="getVerticalStyle(line)" />
    <div v-if="horizontalLine" v-for="(line, index) in horizontalLine" :key="'horizontal' + index" class="align-left" :style="getHorizontalStyle(line)" />

    <!-- 2. 内容区域 -->
    <div class="content-container">
      <slot />
    </div>

    <!-- 3. resize修改按钮 -->
    <div
      v-for="stick in props.sticks"
      :key="stick"
      class="vdr-stick"
      :class="['vdr-stick-' + stick, props.isResizable ? '' : 'not-resizable']"
      :style="vdrStick(stick)"
      @mousedown.stop.prevent="stickDown(stick, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, getCurrentInstance, ref, watch } from 'vue'
import useResizeable from './hooks/useResizeable'
import useParentSize from './hooks/useParentSize'
import useAddEvents from './hooks/useAddEvents'
import useDraggable from './hooks/useDraggable'
import useHasNest from './hooks/useHasNest'
import useShared from './hooks/useShared'

const props = defineProps({
  // 是否需要检查嵌套场景: 嵌套时内部的组件要双击选中
  checkNest: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  // 辅助线尺寸
  lineSize: {
    type: Number as PropType<number>,
    default: 1,
  },
  // 拖拽尺寸的dom尺寸
  stickSize: {
    type: Number as PropType<number>,
    default: 8,
  },
  // 拖拽尺寸的几个位置
  sticks: {
    type: Array as PropType<Array<'tl'| 'tm'| 'tr'| 'mr'| 'br'| 'bm'| 'bl'| 'ml'>>,
    default() {
      return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']
    },
  },
  // 被选中
  isActive: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  // 是否允许被拖拽
  isDraggable: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  // 是否允许被缩放
  isResizable: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  // 是否保持宽高比
  aspectRatio: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  // 单位
  unit: {
    type: String as PropType<'px' | '%'>,
    default: 'px',
  },
  // 宽
  w: {
    type: [Number, String] as PropType<number | string>,
    default: 200,
    required: true,
  },
  // 高
  h: {
    type: [Number, String] as PropType<number | string>,
    default: 200,
    required: true,
  },
  // x轴距离
  x: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
    required: true,
  },
  // y轴距离
  y: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
    required: true,
  },
  // 沿着哪个轴拖拽
  axis: {
    type: String as PropType<string>,
    default: 'both',
    validator(val: string) {
      return ['x', 'y', 'both', 'none'].indexOf(val) !== -1
    },
  },
  // 内容区域的className
  contentClass: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },
})
const emit = defineEmits(['clicked', 'dragging', 'dragstop', 'resizing', 'resizestop', 'activated', 'deactivated'])

const ins = getCurrentInstance()!.proxy

const { state, status, width, height, positionStyle, rect } = useShared(props)

useParentSize({
  getEl: () => ins.$el!.parentNode as HTMLElement,
  resize(nextStyle) {
    state.right = nextStyle.width - width.value - state.left
    state.bottom = nextStyle.height - height.value - state.top
  },
})

const active = ref(props.isActive as boolean)

/**
 * 拖拽
 */
const { horizontalLine, verticalLine, bodyDown, bodyMove, bodyUp } = useDraggable({
  isDraggable: () => active.value,
  event: {
    onMouseDown() {
      // state.active = true
      // emit('clicked', ev)
    },
    onMove() {
      emit('dragging', rect.value)
    },
    onMoveEnd() {
      emit('dragging', rect.value)
      emit('dragstop', rect.value)
    },
  },
})

/**
 * 修改尺寸
 */
const { vdrStick, stickDown, stickMove, stickUp } = useResizeable({
  isResizeable: () => props.isResizable && active.value,
  stickSize: props.stickSize,
  aspectRatio: props.aspectRatio,
})

// 如果是嵌套拖拽, 则双击选中
const hasNest = useHasNest()

const move = function(ev: MouseEvent) {
  if (!status.stickDrag && !status.bodyDrag) {
    return
  }

  ev.stopPropagation()

  const pageX = ev.pageX
  const pageY = ev.pageY

  const { dimensionsBeforeMove } = status

  const delta = {
    x: dimensionsBeforeMove.pointerX - pageX,
    y: dimensionsBeforeMove.pointerY - pageY,
  }

  if (status.stickDrag) {
    stickMove(delta)
  }

  if (status.bodyDrag) {
    if (props.axis === 'x') {
      delta.y = 0
    } else if (props.axis === 'y') {
      delta.x = 0
    } else if (props.axis === 'none') {
      return
    }
    bodyMove(delta)
  }
}

const up = function() {
  if (status.stickDrag) {
    stickUp()
  } else if (status.bodyDrag) {
    bodyUp()
  }
}

const handleClick = function(ev: MouseEvent) {
  if (ev.target !== ev.currentTarget) return

  active.value = true

  emit('activated')
  emit('clicked', ev)
}

const handleMousedown = () => {
  active.value = false
  emit('deactivated')
}

const getHorizontalStyle = function(left: number | null) {
  return {
    display: left === null ? 'none' : 'block',
    top: -state.top + 'px',
    left: left + 'px',
    height: state.parentHeight + 'px',
    width: props.lineSize + 'px',
  }
}

const getVerticalStyle = function(top: number | null) {
  return {
    display: top === null ? 'none' : 'block',
    top: top + 'px',
    left: -state.left + 'px',
    width: state.parentWidth + 'px',
    height: props.lineSize + 'px',
  }
}

useAddEvents(new Map([
  ['mousemove', move],
  ['mouseup', up],
  ['mouseleave', up],
  ['mousedown', handleMousedown],
]))

watch(
  () => props.isActive,
  val => (active.value = val)
)

const eventName = computed(() => hasNest ? 'dblclick' : 'click')
</script>

<style>
@import './Dragger.less'
</style>