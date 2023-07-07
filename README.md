# 基于 Vue2.7 的Vue拖拽组件

## Usage

`src/example/App.vue`

## Feat

### 对齐和吸附

只需要将父组件用`withDetection`包裹一下，父组件和内部组件即可享用对齐和吸附功能

```jsx
import { withDetection, Dragger } from 'vue2.7-dragger'
const DetectionLayout = withDetection('div')
// const DetectionLayout = withDetection(Wrapper)

const App = defineComponent({
    render() {
        return (
            <DetectionLayout>
                <Dragger ...>A</Dragger>
                <Dragger ...>B</Dragger>
                <Dragger ...>C</Dragger>
                <Dragger ...>D</Dragger>
            </DetectionLayout>
        )
    }
})
```

### 嵌套结构

当上级组件也存在`Dragger`时，只有上级被选中，子级才可以被选，而且子级只能双击选中
