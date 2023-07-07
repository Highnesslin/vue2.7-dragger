<template>
  <Dragger
    v-bind="state"
    contentClass="card"
    parentLimitation
    isResizable
    isDraggable
    :stickSize=16
    :lineSize=2
    :isActive="props.active"
    @resizing="handleChange"
    @resizestop="handleChange"
    @dragging="handleChange"
    @dragstop="handleChange"
    v-on="listeners"
  >
  <slot />
  </Dragger>
</template>
  
<script setup lang="ts">
import { reactive, useListeners } from 'vue';
import Dragger from '../lib/Dragger.vue'

const props = defineProps({
    active: Boolean
})
const listeners = useListeners()

const state = reactive({
  y: 0,
  x: 0,
  w: 200,
  h: 200,
})

const handleChange = (newRect: any) => {
  state.w = newRect.width
  state.h = newRect.height
  state.y = newRect.top
  state.x = newRect.left
}
</script>
  
<style>
  html,
  body {
    width: 100%;
    height: 100%;
  }
  
  body {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    padding: 0;
    margin: 0;
  }

  .card {
    background-color: rgba(0, 170, 255, 0.107);
  }
</style>