import { ref, onMounted, onUnmounted } from 'vue'
import { MOBILE_MQ } from '@/constants/breakpoints'

/** @deprecated 使用 MOBILE_MQ */
export const MOBILE_MEDIA_QUERY = MOBILE_MQ

export function useIsMobile() {
  const isMobile = ref(false)
  let mq: MediaQueryList | null = null

  function update() {
    isMobile.value = typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
  }

  onMounted(() => {
    update()
    mq = window.matchMedia(MOBILE_MQ)
    mq.addEventListener?.('change', update)
    window.addEventListener('resize', update, { passive: true })
  })

  onUnmounted(() => {
    mq?.removeEventListener?.('change', update)
    window.removeEventListener('resize', update)
  })

  return { isMobile }
}
