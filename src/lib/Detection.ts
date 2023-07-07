import Vue, { defineComponent, getCurrentInstance, provide, h, inject, onMounted, Component, AsyncComponent, DefineComponent } from "vue"

export type DragInstance = Vue & {
  _uid: number
}

const injectKey = '__DragProviderContainers'

/**
 * 参与位置检测
 */
export const withDetection = function(component: string | Component | AsyncComponent | (() => Component)) {
  return defineComponent({
    props: typeof component === 'string' ?  {} : (component as DefineComponent).props,
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
  })
}

/**
 * 获取参与位置检测的子项
 */
export const useDetectionContainers = function() {
  return inject<Set<Element>>(injectKey, undefined as unknown as Set<Element>)
}
