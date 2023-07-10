# 基于 Vue2.7 的Vue拖拽组件

## Usage

```html
<template>
  <DetectionLayout id="parent">
    <Card :active="active === '1'" @clicked="setActive('1')">1</Card>
    <Card :active="active === '2'" @clicked="setActive('2')">2</Card>
    <Card :active="active === '3'" @clicked="setActive('3')">3</Card>
  </DetectionLayout>
</template>

<script setup lang="ts">
import OriginCard from './Card.vue'
import { withDetection } from '../lib/Detection'
import { ref } from 'vue'
const Card = OriginCard
const DetectionLayout = withDetection(Card)

const active = ref('1')
const setActive = (id: string) => active.value = id 
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
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
