import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { getRequest } from '@/utils/api'
import { useChatStore } from '@/stores/chat'
import { SESSION_GROUP, SESSION_ROBOT } from '@/constants/session'

export type CallPhase = 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'connected'

export interface WebRtcSignal {
  type: string
  callId: string
  from: string
  fromNickname?: string
  to: string
  sdp?: string
  candidate?: string
  media?: string
}

function newCallId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export const useWebRtcStore = defineStore('webrtc', () => {
  const phase = ref<CallPhase>('idle')
  const callId = ref('')
  const peerUsername = ref('')
  const peerNickname = ref('')
  const muted = ref(false)
  const cameraOff = ref(false)
  const errorText = ref('')

  const pc = shallowRef<RTCPeerConnection | null>(null)
  const localStream = shallowRef<MediaStream | null>(null)
  const remoteStream = shallowRef<MediaStream | null>(null)
  const localVideoEl = shallowRef<HTMLVideoElement | null>(null)
  const remoteVideoEl = shallowRef<HTMLVideoElement | null>(null)

  /** 是否为本次通话的呼叫方（负责 createOffer） */
  const isCaller = ref(false)
  const makingOffer = ref(false)
  const ignoreOffer = ref(false)
  /** remoteDescription 未就绪时暂存 ICE */
  let pendingIce: RTCIceCandidateInit[] = []

  const inCall = computed(() => phase.value !== 'idle')

  function canCallPeer(username: string | undefined | null) {
    if (!username) return false
    return username !== SESSION_GROUP && username !== SESSION_ROBOT
  }

  function bindLocalVideo(el: HTMLVideoElement | null) {
    localVideoEl.value = el
    if (el && localStream.value) {
      el.srcObject = localStream.value
    }
  }

  function bindRemoteVideo(el: HTMLVideoElement | null) {
    remoteVideoEl.value = el
    if (el && remoteStream.value) {
      el.srcObject = remoteStream.value
    }
  }

  function sendSignal(partial: Partial<WebRtcSignal> & { type: string; to: string }) {
    const chat = useChatStore()
    const me = chat.currentUser
    if (!me) return false
    const body: WebRtcSignal = {
      type: partial.type,
      callId: partial.callId || callId.value,
      from: me.username,
      fromNickname: me.nickname,
      to: partial.to,
      sdp: partial.sdp,
      candidate: partial.candidate,
      media: partial.media || 'video',
    }
    return chat.publish('/ws/webrtc', JSON.stringify(body))
  }

  async function fetchIceServers(): Promise<RTCIceServer[]> {
    const resp = (await getRequest('/webrtc/ice-servers', { silent: true } as never)) as {
      obj?: { iceServers?: RTCIceServer[]; turnReady?: boolean }
    }
    const servers = resp?.obj?.iceServers
    if (!servers?.length) {
      return [{ urls: 'stun:stun.l.google.com:19302' }]
    }
    if (resp.obj?.turnReady === false) {
      ElMessage.warning('TURN 未配置，跨网通话可能失败（同 WiFi 或可试）')
    }
    return servers
  }

  async function ensureMedia() {
    if (localStream.value) return localStream.value
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
    })
    localStream.value = stream
    if (localVideoEl.value) {
      localVideoEl.value.srcObject = stream
    }
    return stream
  }

  async function createPeerConnection() {
    if (pc.value) return pc.value
    const iceServers = await fetchIceServers()
    const conn = new RTCPeerConnection({ iceServers })
    pc.value = conn

    const stream = await ensureMedia()
    stream.getTracks().forEach((track) => conn.addTrack(track, stream))

    const remote = new MediaStream()
    remoteStream.value = remote
    if (remoteVideoEl.value) {
      remoteVideoEl.value.srcObject = remote
    }

    conn.ontrack = (ev) => {
      ev.streams[0]?.getTracks().forEach((t) => remote.addTrack(t))
      if (remoteVideoEl.value) {
        remoteVideoEl.value.srcObject = remote
      }
    }

    conn.onicecandidate = (ev) => {
      if (!ev.candidate || !peerUsername.value) return
      sendSignal({
        type: 'ice',
        to: peerUsername.value,
        candidate: JSON.stringify(ev.candidate.toJSON()),
      })
    }

    conn.onconnectionstatechange = () => {
      const state = conn.connectionState
      if (state === 'connected') {
        phase.value = 'connected'
      } else if (state === 'failed') {
        errorText.value = '连接失败，请检查网络或 TURN 服务'
        ElMessage.error(errorText.value)
      }
    }

    return conn
  }

  async function flushPendingIce() {
    const conn = pc.value
    if (!conn?.remoteDescription) return
    const list = pendingIce
    pendingIce = []
    for (const c of list) {
      try {
        await conn.addIceCandidate(c)
      } catch (e) {
        console.warn('flushIce', e)
      }
    }
  }

  async function startCall(toUsername: string, toNickname: string) {
    if (!canCallPeer(toUsername)) {
      ElMessage.warning('仅支持与私聊好友进行音视频通话')
      return
    }
    if (phase.value !== 'idle') {
      ElMessage.warning('当前已在通话中')
      return
    }
    try {
      errorText.value = ''
      isCaller.value = true
      callId.value = newCallId()
      peerUsername.value = toUsername
      peerNickname.value = toNickname
      phase.value = 'outgoing'
      await ensureMedia()
      const ok = sendSignal({
        type: 'invite',
        callId: callId.value,
        to: toUsername,
        media: 'video',
      })
      if (!ok) {
        cleanupLocal(false)
        ElMessage.error('信令未连接，请刷新后重试')
      }
    } catch (e: unknown) {
      cleanupLocal(false)
      const msg = e instanceof Error ? e.message : String(e)
      if (/Permission|NotAllowed|denied/i.test(msg)) {
        ElMessage.error('请允许浏览器使用摄像头和麦克风')
      } else {
        ElMessage.error('无法打开摄像头/麦克风：' + msg)
      }
    }
  }

  async function acceptCall() {
    if (phase.value !== 'incoming' || !peerUsername.value) return
    try {
      phase.value = 'connecting'
      await createPeerConnection()
      sendSignal({ type: 'accept', to: peerUsername.value, callId: callId.value })
    } catch (e: unknown) {
      sendSignal({ type: 'reject', to: peerUsername.value, callId: callId.value })
      cleanupLocal(false)
      const msg = e instanceof Error ? e.message : String(e)
      ElMessage.error('接听失败：' + msg)
    }
  }

  function rejectCall() {
    if (peerUsername.value && callId.value) {
      sendSignal({ type: 'reject', to: peerUsername.value, callId: callId.value })
    }
    cleanupLocal(false)
  }

  function hangup() {
    if (peerUsername.value && callId.value && phase.value !== 'idle') {
      sendSignal({ type: 'hangup', to: peerUsername.value, callId: callId.value })
    }
    cleanupLocal(false)
  }

  function toggleMute() {
    muted.value = !muted.value
    localStream.value?.getAudioTracks().forEach((t) => {
      t.enabled = !muted.value
    })
  }

  function toggleCamera() {
    cameraOff.value = !cameraOff.value
    localStream.value?.getVideoTracks().forEach((t) => {
      t.enabled = !cameraOff.value
    })
  }

  function cleanupLocal(_notifyPeer: boolean) {
    try {
      pc.value?.getSenders().forEach((s) => {
        try {
          s.track?.stop()
        } catch {
          /* ignore */
        }
      })
      pc.value?.close()
    } catch {
      /* ignore */
    }
    pc.value = null

    localStream.value?.getTracks().forEach((t) => t.stop())
    localStream.value = null
    remoteStream.value = null
    if (localVideoEl.value) localVideoEl.value.srcObject = null
    if (remoteVideoEl.value) remoteVideoEl.value.srcObject = null

    phase.value = 'idle'
    callId.value = ''
    peerUsername.value = ''
    peerNickname.value = ''
    isCaller.value = false
    makingOffer.value = false
    ignoreOffer.value = false
    muted.value = false
    cameraOff.value = false
    pendingIce = []
  }

  async function onSignal(msg: WebRtcSignal) {
    if (!msg?.type) return
    const type = msg.type.toLowerCase()
    const chat = useChatStore()
    const me = chat.currentUser
    if (!me) return

    // 通话中又来新邀请 → 回 busy
    if (type === 'invite' && phase.value !== 'idle') {
      sendSignal({ type: 'busy', to: msg.from, callId: msg.callId })
      return
    }
    // 进行中的通话：忽略无关 callId
    if (phase.value !== 'idle' && msg.callId && callId.value && msg.callId !== callId.value) {
      return
    }

    switch (type) {
      case 'invite': {
        if (phase.value !== 'idle') {
          return
        }
        isCaller.value = false
        callId.value = msg.callId
        peerUsername.value = msg.from
        peerNickname.value = msg.fromNickname || msg.from
        phase.value = 'incoming'
        break
      }
      case 'accept': {
        if (phase.value !== 'outgoing' || msg.callId !== callId.value) return
        try {
          phase.value = 'connecting'
          const conn = await createPeerConnection()
          makingOffer.value = true
          const offer = await conn.createOffer()
          await conn.setLocalDescription(offer)
          makingOffer.value = false
          sendSignal({
            type: 'offer',
            to: peerUsername.value,
            callId: callId.value,
            sdp: offer.sdp || '',
          })
        } catch (e: unknown) {
          makingOffer.value = false
          ElMessage.error('建立通话失败')
          hangup()
        }
        break
      }
      case 'reject': {
        if (msg.callId !== callId.value) return
        ElMessage.info('对方已拒绝')
        cleanupLocal(false)
        break
      }
      case 'busy': {
        if (msg.callId !== callId.value) return
        ElMessage.info('对方忙线中')
        cleanupLocal(false)
        break
      }
      case 'hangup': {
        if (callId.value && msg.callId !== callId.value) return
        ElMessage.info('对方已挂断')
        cleanupLocal(false)
        break
      }
      case 'offer': {
        if (msg.callId !== callId.value || !msg.sdp) return
        try {
          const conn = pc.value || (await createPeerConnection())
          const offerCollision = makingOffer.value || conn.signalingState !== 'stable'
          ignoreOffer.value = !isCaller.value && offerCollision
          if (ignoreOffer.value) return
          await conn.setRemoteDescription({ type: 'offer', sdp: msg.sdp })
          await flushPendingIce()
          const answer = await conn.createAnswer()
          await conn.setLocalDescription(answer)
          sendSignal({
            type: 'answer',
            to: peerUsername.value,
            callId: callId.value,
            sdp: answer.sdp || '',
          })
          phase.value = 'connecting'
        } catch (e) {
          console.error('handle offer', e)
          hangup()
        }
        break
      }
      case 'answer': {
        if (msg.callId !== callId.value || !msg.sdp || !pc.value) return
        try {
          await pc.value.setRemoteDescription({ type: 'answer', sdp: msg.sdp })
          await flushPendingIce()
        } catch (e) {
          console.error('handle answer', e)
        }
        break
      }
      case 'ice': {
        if (msg.callId !== callId.value || !msg.candidate) return
        try {
          const c = JSON.parse(msg.candidate) as RTCIceCandidateInit
          if (!pc.value || !pc.value.remoteDescription) {
            pendingIce.push(c)
          } else {
            await pc.value.addIceCandidate(c)
          }
        } catch (e) {
          console.warn('addIceCandidate', e)
        }
        break
      }
      default:
        break
    }
  }

  return {
    phase,
    callId,
    peerUsername,
    peerNickname,
    muted,
    cameraOff,
    errorText,
    localStream,
    remoteStream,
    inCall,
    canCallPeer,
    bindLocalVideo,
    bindRemoteVideo,
    startCall,
    acceptCall,
    rejectCall,
    hangup,
    toggleMute,
    toggleCamera,
    onSignal,
    cleanupLocal,
  }
})
