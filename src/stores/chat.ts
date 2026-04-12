import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { chatNotify } from '@/utils/chatNotify'
import { Client, ActivationState, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getRequest } from '@/utils/api'
import {
  SESSION_GROUP,
  SESSION_ROBOT,
  ROBOT_WIRE_USERNAME,
  normalizeWirePeer,
} from '@/constants/session'

export interface ChatUser {
  id: number
  username: string
  nickname: string
  userProfile: string
  userStateId?: number
}

export interface PrivateMsg {
  content: string
  date: Date
  fromNickname: string
  messageTypeId: number
  self: boolean
  notSelf?: boolean
  to?: string
}

export interface GroupMsg {
  id?: number
  fromId: number
  fromName: string
  fromProfile: string
  content: string
  messageTypeId: number
  createTime: string
}

function sessionPeerKey(username: string, peer: string) {
  return `${username}#${peer}`
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Record<string, PrivateMsg[] | GroupMsg[]>>({})
  const users = ref<ChatUser[]>([])
  const currentUser = ref<ChatUser | null>(null)
  const currentSession = ref<{ username: string; nickname: string; userProfile?: string }>({
    username: SESSION_GROUP,
    nickname: SESSION_GROUP,
  })
  const currentList = ref(SESSION_GROUP)
  const filterKey = ref('')
  const stompClient = shallowRef<Client | null>(null)
  const isDot = ref<Record<string, boolean>>({})
  const isFullScreen = ref(false)
  const isDarkMode = ref(localStorage.getItem('isDarkMode') === 'true')
  const shotHistory = ref<Record<string, unknown>>({})

  watch(isDarkMode, (v) => localStorage.setItem('isDarkMode', String(v)))

  watch(
    sessions,
    (val) => {
      try {
        localStorage.setItem('chat-session', JSON.stringify(val))
      } catch {
        /* ignore */
      }
    },
    { deep: true }
  )

  function changeCurrentSession(sess: { username: string; nickname: string; userProfile?: string }) {
    if (currentUser.value) {
      isDot.value[sessionPeerKey(currentUser.value.username, sess.username)] = false
    }
    currentSession.value = sess
    if (
      currentUser.value &&
      sess.username !== SESSION_GROUP &&
      sess.username !== SESSION_ROBOT
    ) {
      getRequest('/privateMsgContent/history?targetNickname=' + encodeURIComponent(sess.nickname), {
        silent: true,
      } as never).then((resp: unknown) => {
        if (resp && Array.isArray(resp) && currentUser.value) {
          const history = (resp as { content: string; createTime: string; fromName: string; messageTypeId: number }[]).map(
            (item) => ({
              content: item.content,
              date: new Date(item.createTime),
              fromNickname: item.fromName,
              messageTypeId: item.messageTypeId,
              self: item.fromName === currentUser.value!.nickname,
            })
          )
          const key = sessionPeerKey(currentUser.value.username, sess.username)
          sessions.value[key] = history
        }
      })
    }
  }

  function changeCurrentList(list: string) {
    currentList.value = list
  }

  function clearUserState() {
    sessions.value = {}
    users.value = []
    currentUser.value = null
    currentSession.value = { username: SESSION_GROUP, nickname: SESSION_GROUP }
    currentList.value = SESSION_GROUP
    isDot.value = {}
    shotHistory.value = {}
    localStorage.removeItem('chat-session')
  }

  function addGroupMessage(msg: GroupMsg) {
    if (!sessions.value[SESSION_GROUP]) {
      sessions.value[SESSION_GROUP] = []
    }
    ;(sessions.value[SESSION_GROUP] as GroupMsg[]).push(msg)
  }

  function addMessage(msg: {
    content: string
    messageTypeId: number
    fromNickname?: string
    to?: string
    notSelf?: boolean
    from?: string
  }) {
    const u = currentUser.value
    if (!u) return
    const rawTo = msg.to ?? msg.from ?? SESSION_ROBOT
    const peer = normalizeWirePeer(rawTo)
    const key = sessionPeerKey(u.username, peer)
    if (!sessions.value[key]) {
      sessions.value[key] = []
    }
    const list = sessions.value[key] as PrivateMsg[]
    list.push({
      content: msg.content,
      date: new Date(),
      fromNickname: msg.fromNickname || u.nickname,
      messageTypeId: msg.messageTypeId,
      self: !msg.notSelf,
    })
  }

  function initData() {
    getRequest('/groupMsgContent/', { silent: true } as never).then((resp: unknown) => {
      if (resp && Array.isArray(resp)) {
        sessions.value[SESSION_GROUP] = resp as GroupMsg[]
      }
    })
    getRequest('/chat/users', { silent: true } as never).then((resp: unknown) => {
      if (resp && Array.isArray(resp)) users.value = resp as ChatUser[]
    })
  }

  function connect() {
    if (stompClient.value?.state === ActivationState.ACTIVE) {
      stompClient.value.deactivate()
    }
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/ep') as never,
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: () => {},
      onConnect: () => {
        client.subscribe('/topic/notification', (message: IMessage) => {
          chatNotify({
            type: 'info',
            title: '系统消息',
            message: message.body.substring(5),
          })
          getRequest('/chat/users', { silent: true } as never).then((resp: unknown) => {
            if (resp && Array.isArray(resp)) users.value = resp as ChatUser[]
          })
        })
        client.subscribe('/topic/greetings', (message: IMessage) => {
          const receiveMsg = JSON.parse(message.body) as GroupMsg
          const cs = currentSession.value
          const cu = currentUser.value
          if (cu && cs.username !== SESSION_GROUP) {
            isDot.value[sessionPeerKey(cu.username, SESSION_GROUP)] = true
          }
          addGroupMessage(receiveMsg)
        })
        client.subscribe('/user/queue/robot', (message: IMessage) => {
          const receiveMsg = JSON.parse(message.body) as Record<string, unknown>
          receiveMsg.notSelf = true
          receiveMsg.to = ROBOT_WIRE_USERNAME
          receiveMsg.messageTypeId = 1
          addMessage(receiveMsg as never)
        })
        client.subscribe('/user/queue/chat', (message: IMessage) => {
          const receiveMsg = JSON.parse(message.body) as {
            from: string
            fromNickname: string
            content: string
          }
          const cs = currentSession.value
          const cu = currentUser.value
          if (
            !cs ||
            receiveMsg.from !== cs.username
          ) {
            chatNotify({
              type: 'info',
              title: `【${receiveMsg.fromNickname}】发来一条消息`,
              message:
                receiveMsg.content.length < 8
                  ? receiveMsg.content
                  : receiveMsg.content.substring(0, 8) + '...',
            })
            if (cu) {
              isDot.value[sessionPeerKey(cu.username, receiveMsg.from)] = true
            }
          }
          addMessage({
            content: receiveMsg.content,
            messageTypeId: 1,
            fromNickname: receiveMsg.fromNickname,
            to: receiveMsg.from,
            notSelf: true,
          })
        })
      },
      onStompError: (frame) => {
        console.warn('WebSocket STOMP error', frame)
      },
    })
    stompClient.value = client
    try {
      client.activate()
    } catch (e) {
      console.warn('STOMP activate', e)
    }
  }

  function disconnect() {
    stompClient.value?.deactivate()
    stompClient.value = null
  }

  function publish(destination: string, body: string) {
    const c = stompClient.value
    if (!c || c.state !== ActivationState.ACTIVE) return false
    try {
      c.publish({ destination, body })
      return true
    } catch {
      return false
    }
  }

  function restoreSessionsFromStorage() {
    try {
      const raw = localStorage.getItem('chat-session')
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, PrivateMsg[] | GroupMsg[]>
        sessions.value = parsed
      }
    } catch {
      /* ignore */
    }
  }

  restoreSessionsFromStorage()

  function setUser(u: ChatUser | null) {
    currentUser.value = u
  }

  return {
    sessions,
    users,
    currentUser,
    currentSession,
    currentList,
    filterKey,
    stompClient,
    isDot,
    isFullScreen,
    isDarkMode,
    shotHistory,
    changeCurrentSession,
    changeCurrentList,
    clearUserState,
    addGroupMessage,
    addMessage,
    initData,
    connect,
    disconnect,
    publish,
    setUser,
  }
})
