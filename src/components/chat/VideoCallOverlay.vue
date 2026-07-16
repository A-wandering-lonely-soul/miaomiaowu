<template>
  <div v-if="webrtc.inCall" class="call-overlay" :class="{ connected: webrtc.phase === 'connected' }">
    <!-- 远端画面 -->
    <video
      ref="remoteRef"
      class="remote-video"
      autoplay
      playsinline
    />
    <!-- 本地小窗 -->
    <video
      ref="localRef"
      class="local-video"
      autoplay
      playsinline
      muted
    />

    <div class="call-status">
      <div class="peer-name">{{ webrtc.peerNickname || webrtc.peerUsername }}</div>
      <div class="phase-text">{{ phaseLabel }}</div>
    </div>

    <!-- 来电操作 -->
    <div v-if="webrtc.phase === 'incoming'" class="actions incoming">
      <button type="button" class="btn reject" @click="webrtc.rejectCall()">拒绝</button>
      <button type="button" class="btn accept" @click="webrtc.acceptCall()">接听</button>
    </div>

    <!-- 呼出等待 -->
    <div v-else-if="webrtc.phase === 'outgoing'" class="actions">
      <button type="button" class="btn reject" @click="webrtc.hangup()">取消</button>
    </div>

    <!-- 通话中 -->
    <div v-else class="actions">
      <button type="button" class="btn round" :class="{ off: webrtc.muted }" @click="webrtc.toggleMute()">
        {{ webrtc.muted ? '取消静音' : '静音' }}
      </button>
      <button type="button" class="btn round" :class="{ off: webrtc.cameraOff }" @click="webrtc.toggleCamera()">
        {{ webrtc.cameraOff ? '开摄像头' : '关摄像头' }}
      </button>
      <button type="button" class="btn reject" @click="webrtc.hangup()">挂断</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useWebRtcStore } from '@/stores/webrtc'

const webrtc = useWebRtcStore()
const localRef = ref<HTMLVideoElement | null>(null)
const remoteRef = ref<HTMLVideoElement | null>(null)

const phaseLabel = computed(() => {
  switch (webrtc.phase) {
    case 'outgoing':
      return '正在呼叫…'
    case 'incoming':
      return '邀请你进行视频通话'
    case 'connecting':
      return '连接中…'
    case 'connected':
      return '通话中'
    default:
      return ''
  }
})

watch(
  () => [webrtc.inCall, localRef.value, remoteRef.value] as const,
  async () => {
    await nextTick()
    webrtc.bindLocalVideo(localRef.value)
    webrtc.bindRemoteVideo(remoteRef.value)
  },
  { flush: 'post' }
)

watch(
  () => webrtc.localStream,
  async () => {
    await nextTick()
    webrtc.bindLocalVideo(localRef.value)
  }
)

watch(
  () => webrtc.remoteStream,
  async () => {
    await nextTick()
    webrtc.bindRemoteVideo(remoteRef.value)
  }
)
</script>

<style scoped lang="scss">
.call-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  background: #0f1115;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: max(28px, env(safe-area-inset-bottom));
}
.remote-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #1a1d22;
}
.local-video {
  position: absolute;
  top: max(16px, env(safe-area-inset-top));
  right: max(16px, env(safe-area-inset-right));
  width: min(28vw, 160px);
  height: min(36vw, 220px);
  object-fit: cover;
  border-radius: 12px;
  background: #333;
  border: 1px solid rgba(255, 255, 255, 0.25);
  z-index: 2;
}
.call-status {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 24px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.peer-name {
  font-size: 22px;
  font-weight: 700;
}
.phase-text {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.85;
}
.actions {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 16px;
}
.actions.incoming {
  gap: 28px;
}
.btn {
  min-width: 88px;
  height: 48px;
  border: none;
  border-radius: 999px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  color: #fff;
}
.btn.accept {
  background: #22c55e;
}
.btn.reject {
  background: #ef4444;
}
.btn.round {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}
.btn.round.off {
  background: rgba(239, 68, 68, 0.55);
}
</style>
