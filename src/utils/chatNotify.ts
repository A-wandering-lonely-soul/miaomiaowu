import { ElNotification } from 'element-plus'
import type { NotificationOptions } from 'element-plus'
import { Z_NOTIFICATION } from '@/constants/zIndex'
import { isNarrowScreen } from '@/constants/breakpoints'

/** 聊天内通知：层级高于侧栏抽屉，移动端收窄宽度 */
export function chatNotify(options: Partial<NotificationOptions>) {
  const mobile = isNarrowScreen()
  const baseClass = mobile ? 'chat-notify--mobile' : ''
  const mergedClass = [baseClass, options.customClass].filter(Boolean).join(' ')
  ElNotification({
    ...options,
    zIndex: Z_NOTIFICATION,
    position: mobile ? 'top-right' : (options.position ?? 'bottom-right'),
    customClass: mergedClass || undefined,
  })
}
