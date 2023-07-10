import Vue, { defineComponent, getCurrentInstance, provide, h, inject, onMounted, DefineComponent, Component } from "vue"

export type DragInstance = Vue & {
  _uid: number
}

const injectKey = '__DragProviderContainers'

const isComponent = (component: Component | string): component is Component => typeof component !== 'string'

/**
 * 参与位置检测
 */
export const withDetection = function<T extends Component | string, R = T extends string ? DefineComponent : T>(
  component: T
): R {
  return defineComponent({
    props: isComponent(component) && 'props' in component ? component.props : undefined,
    setup() {
      const instance = getCurrentInstance()
      const containers = new Set([] as Element[])

      onMounted(() => {
        containers.add(instance!.proxy.$el)
      })
      provide(injectKey, containers)
    },
    render() {
      return h(
        component,
        {
          props: this.$props,
          attrs: this.$attrs,
          on: this.$listeners,
        },
        this.$slots.default
      )
    },
  }) as R
}

/**
 * 获取参与位置检测的子项
 */
export const useDetectionContainers = function() {
  return inject<Set<Element>>(injectKey, undefined as unknown as Set<Element>)
}
