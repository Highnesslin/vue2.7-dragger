# 基于 Vue2.7 的Vue拖拽组件

## Usage

```html
<template>
  <DetectionLayout id="parent">
    <Dragger
      v-for="card in state"
      :key="card.id"
      v-bind="card.data"
      contentClass="card"
      parentLimitation
      isResizable
      isDraggable
      :stickSize=16
      :lineSize=2
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
      x: 0,
      y: 0,
      w: 100,
      h: 100,
    }
  },
  {
    id: 2,
    data: {
      isActive: false,
      x: 220,
      y: 0,
      w: 100,
      h: 100,
    }
  },
  {
    id: 3,
    data: {
      isActive: false,
      x: 440,
      y: 0,
      w: 100,
      h: 100,
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
```

## Feat

### 对齐和吸附

只需要将父组件用`withDetection`包裹一下，父组件和内部组件即可享用对齐和吸附功能

```jsx
import { withDetection, Dragger } from 'vue2.7-dragger'
const DetectionLayout = withDetection('div')
const DetectionDragger = withDetection(Dragger)

const App = defineComponent({
    render() {
        return (
            <DetectionLayout>
                <Dragger ...>A</Dragger>
                <Dragger ...>B</Dragger>
                <DetectionDragger>
                    <Dragger ...>C</Dragger>
                    <Dragger ...>D</Dragger>
                </DetectionDragger>
            </DetectionLayout>
        )
    }
})
```

### 嵌套结构

当上级组件也存在`Dragger`时，只有上级被选中，子级才可以被选，而且子级只能双击选中
