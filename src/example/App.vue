<template>
  <DetectionLayout id="parent">
    <Dragger
      v-for="card in state"
      :key="card.id"
      v-bind="card.data"
      contentClass="card"
      isResizable
      isDraggable
      :stickSize=16
      :lineSize=2
      unit="%"
      @resizestop="style => handleChange(card.data, style)"
      @dragstop="style => handleChange(card.data, style)"
      @clicked="toggleActive(card.id)"
    />
  </DetectionLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dragger, withDetection } from '../lib'

const DetectionLayout = withDetection('div')

const state = ref([
  {
    id: 1,
    data: {
      isActive: false,
      x: 10,
      y: 10,
      w: 12,
      h: 12,
    }
  },
  {
    id: 2,
    data: {
      isActive: false,
      x: 20,
      y: 20,
      w: 12,
      h: 12,
    }
  }
])

const handleChange = (data: (typeof state.value[0])['data'], newRect: Record<'width' | 'height' | 'top' | 'left', number>) => {
  data.w = newRect.width
  data.h = newRect.height
  data.y = newRect.top
  data.x = newRect.left

  console.log('handleChange', state.value)
}

const toggleActive = (id: number) => {
  for (const card of state.value) {
    card.data.isActive = card.id === id
  }
}

document.addEventListener('click', e => {
  if((e.target as HTMLElement).id === 'parent') {
    for (const card of state.value) {
      card.data.isActive = false
    }
  }
})

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

#parent {
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