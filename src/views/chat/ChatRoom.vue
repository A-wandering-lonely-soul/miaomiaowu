<template>
  <div
    class="chat-room-wrapper"
    :class="{ 'dark-mode-bg': chat.isDarkMode, 'is-mobile': isMobile }"
  >
    <div
      v-if="isMobile"
      class="mobile-drawer-mask"
      :class="{ visible: mobileDrawerOpen }"
      @click="mobileDrawerOpen = false"
      @touchmove.prevent
    />
    <div
      id="chat-container"
      :class="{
        'full-screen': chat.isFullScreen,
        'dark-mode': chat.isDarkMode,
        'chat-mobile': isMobile,
        'drawer-open': mobileDrawerOpen && isMobile,
      }"
    >
      <div class="sidebar-drawer">
        <aside class="toolbar-strip">
          <ChatToolbar :is-mobile="isMobile" />
        </aside>
        <div class="sidebar-panel">
          <ChatCard />
          <ChatList :is-mobile="isMobile" @session-picked="mobileDrawerOpen = false" />
        </div>
      </div>
      <div class="main">
        <ChatTitle :is-mobile="isMobile" @open-drawer="mobileDrawerOpen = true" />
        <ChatMessage :is-mobile="isMobile" />
        <ChatUserText :is-mobile="isMobile" />
      </div>
    </div>
    <VideoCallOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useIsMobile } from '@/composables/useIsMobile'
import ChatToolbar from '@/components/chat/ChatToolbar.vue'
import ChatList from '@/components/chat/ChatList.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatUserText from '@/components/chat/ChatUserText.vue'
import ChatCard from '@/components/chat/ChatCard.vue'
import ChatTitle from '@/components/chat/ChatTitle.vue'
import VideoCallOverlay from '@/components/chat/VideoCallOverlay.vue'

const chat = useChatStore()
const auth = useAuthStore()
const { isMobile } = useIsMobile()
const mobileDrawerOpen = ref(false)

watch(isMobile, (m) => {
  if (!m) mobileDrawerOpen.value = false
})

onMounted(() => {
  if (auth.user && !chat.currentUser) {
    chat.setUser(auth.user)
  }
  window.addEventListener('beforeunload', persistState)
  chat.initData()
  chat.connect()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', persistState)
})

function persistState() {
  sessionStorage.setItem('state', JSON.stringify({ currentList: chat.currentList }))
}
</script>

<style scoped lang="scss">
.chat-room-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #eef2f6 0%, #d7dee8 100%);
}
.chat-room-wrapper.is-mobile {
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  box-sizing: border-box;
  overscroll-behavior: none;
}
#chat-container {
  display: flex;
  flex-direction: row;
  width: min(1080px, 100%);
  height: min(88vh, 900px);
  min-height: 520px;
  max-height: min(92vh, 960px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
}
.sidebar-drawer {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
}
.toolbar-strip {
  width: 58px;
  flex-shrink: 0;
  height: 100%;
  background: #2e3238;
}
.sidebar-panel {
  width: 268px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: #f7f7f7;
  border-right: 1px solid #e8e8e8;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: #fafafa;
}
.mobile-drawer-mask {
  display: none;
}
.chat-room-wrapper.is-mobile .mobile-drawer-mask {
  display: block;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2998;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
.chat-room-wrapper.is-mobile .mobile-drawer-mask.visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
#chat-container.chat-mobile {
  width: 100% !important;
  max-width: 100vw;
  flex: 1;
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  position: relative;
  touch-action: manipulation;
  display: flex;
  flex-direction: row;
}
#chat-container.chat-mobile .sidebar-drawer {
  position: fixed;
  left: 0;
  top: env(safe-area-inset-top, 0px);
  bottom: env(safe-area-inset-bottom, 0px);
  height: auto;
  z-index: 3000;
  width: min(88vw, 300px);
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.12);
  padding-left: env(safe-area-inset-left, 0px);
}
#chat-container.chat-mobile.drawer-open .sidebar-drawer {
  transform: translateX(0);
}
#chat-container.chat-mobile .toolbar-strip {
  width: 52px;
}
#chat-container.chat-mobile .sidebar-panel {
  flex: 1;
  width: auto;
  border-right: none;
}
#chat-container.chat-mobile .main {
  min-height: 0;
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
#chat-container.full-screen {
  width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;
  max-height: none;
  border-radius: 0;
  margin: 0;
}
.dark-mode-bg {
  background: linear-gradient(145deg, #1a1d22 0%, #0f1114 100%) !important;
}
#chat-container.dark-mode {
  background: #2b2b2b;
  .sidebar-panel {
    background: #262626;
    border-right-color: #333;
  }
  .main {
    background: #1e1e1e;
  }
}
#chat-container.dark-mode .toolbar-strip {
  background: #1f2329;
}
.chat-mobile#chat-container.dark-mode .sidebar-drawer {
  background: #262626;
}
</style>
