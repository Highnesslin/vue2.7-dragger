import { onMounted, onUnmounted } from "vue"

type Event = Map<string, (e: any) => void>

function addEvents(events: Event) {
  events.forEach((cb, eventName) => {
    document.documentElement.addEventListener(eventName, cb)
  })
}

function removeEvents(events: Event) {
  events.forEach((cb, eventName) => {
    document.documentElement.removeEventListener(eventName, cb)
  })
}


const useAddEvents = function (domEvents: Event) {
  onMounted(() => addEvents(domEvents))
  onUnmounted(() => removeEvents(domEvents))
}
 
export default useAddEvents;