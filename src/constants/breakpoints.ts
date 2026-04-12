/** 与 ChatRoom / useIsMobile 一致 */
export const MOBILE_MQ = '(max-width: 768px)'

export function isNarrowScreen() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
}
