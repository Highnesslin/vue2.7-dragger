import { getCurrentInstance, provide, inject } from "vue"

const hasNestKey = '__hasNestKey'

const useParentIsDrag = function() {
  const instance = getCurrentInstance()

  provide(hasNestKey, !!instance)

  return !!inject(hasNestKey, false)
}

export default useParentIsDrag
