export const SESSION_GROUP = '群聊'
export const LIST_FAMILY = '私聊'
export const SESSION_ROBOT = '瓦力'
export const LIST_ROBOT = '瓦力'
export const ROBOT_WIRE_USERNAME = '机器人'

export function toWireUsername(sessionUsername: string): string {
  if (sessionUsername === SESSION_ROBOT) return ROBOT_WIRE_USERNAME
  return sessionUsername
}

export function normalizeWirePeer(name: string): string {
  if (name === ROBOT_WIRE_USERNAME) return SESSION_ROBOT
  return name
}
