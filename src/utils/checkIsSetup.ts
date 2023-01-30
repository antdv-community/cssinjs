import { getCurrentInstance } from 'vue'

export const checkIsSetup = (fn: () => void) => {
  const instance = getCurrentInstance()
  if (instance)
    fn()
}
