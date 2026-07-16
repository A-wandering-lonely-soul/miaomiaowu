<template>
  <div class="chat-title" :class="{ 'is-dark': chat.isDarkMode, 'is-mobile': isMobile }">
    <div class="title-left">
      <el-button v-if="isMobile" class="menu-btn" text @click="$emit('openDrawer')">
        <span class="fa fa-bars"></span>
      </el-button>
      <span class="title-name">{{ chat.currentSession?.nickname || '' }}</span>
    </div>
    <div class="title-right">
      <el-tooltip v-if="canVideoCall" content="视频通话" placement="bottom" :disabled="isMobile">
        <el-button class="call-btn" size="small" circle :disabled="webrtc.inCall" @click="startVideoCall">
          <span class="fa fa-video-camera"></span>
        </el-button>
      </el-tooltip>
    <!-- 移动端：下拉改为底部抽屉，避免被遮挡或层级异常 -->
    <template v-if="isMobile">
      <el-button class="more-btn" size="small" circle @click="moreMenuOpen = true">
        <span class="fa fa-ellipsis-h"></span>
      </el-button>
      <el-drawer
        v-model="moreMenuOpen"
        direction="btt"
        size="38%"
        :z-index="Z_FORM_SHEET"
        append-to-body
        class="form-bottom-sheet chat-title-more-drawer"
        title="更多"
      >
        <ul class="title-more-list">
          <li @click="runCmd('fullscreen')">切换全屏</li>
          <li @click="runCmd('darkmode')">
            {{ chat.isDarkMode ? '白天模式' : '黑夜模式' }}
          </li>
        </ul>
      </el-drawer>
    </template>
    <el-dropdown v-else trigger="click" @command="onCmd">
      <el-button class="more-btn" size="small" circle>
        <span class="fa fa-ellipsis-h"></span>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="fullscreen">切换全屏</el-dropdown-item>
          <el-dropdown-item command="darkmode">
            {{ chat.isDarkMode ? '白天模式' : '黑夜模式' }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useWebRtcStore } from '@/stores/webrtc'
import { SESSION_GROUP, SESSION_ROBOT } from '@/constants/session'
import { Z_FORM_SHEET } from '@/constants/zIndex'

withDefaults(defineProps<{ isMobile?: boolean }>(), { isMobile: false })
defineEmits<{ openDrawer: [] }>()

const chat = useChatStore()
const webrtc = useWebRtcStore()
const moreMenuOpen = ref(false)

const canVideoCall = computed(() => {
  const u = chat.currentSession?.username
  return !!u && u !== SESSION_GROUP && u !== SESSION_ROBOT
})

function startVideoCall() {
  const sess = chat.currentSession
  if (!sess?.username) return
  webrtc.startCall(sess.username, sess.nickname || sess.username)
}

function onCmd(cmd: string) {
  if (cmd === 'fullscreen') {
    chat.isFullScreen = !chat.isFullScreen
  } else if (cmd === 'darkmode') {
    chat.isDarkMode = !chat.isDarkMode
  }
}

function runCmd(cmd: string) {
  moreMenuOpen.value = false
  onCmd(cmd)
}
</script>

<style scoped lang="scss">
.chat-title {
  height: 50px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}
.title-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.menu-btn {
  font-size: 18px;
}
.title-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.call-btn,
.more-btn {
  border: none;
  background: transparent;
}
.call-btn {
  color: #2563eb;
}
.chat-title.is-dark {
  background: #2a2a2a;
  border-bottom-color: #3a3a3a;
  .title-name {
    color: #e8e8e8;
  }
  .menu-btn,
  .more-btn {
    color: #ccc;
  }
  .call-btn {
    color: #60a5fa;
  }
}
.chat-title.is-mobile {
  padding-top: max(6px, env(safe-area-inset-top, 0px));
  padding-left: max(8px, env(safe-area-inset-left, 0px));
  padding-right: max(8px, env(safe-area-inset-right, 0px));
  min-height: 48px;
  height: auto;
  .menu-btn {
    min-width: 44px;
    min-height: 44px;
    margin: -4px 0 -4px -4px;
    touch-action: manipulation;
  }
  .more-btn,
  .call-btn {
    min-width: 44px;
    min-height: 44px;
    touch-action: manipulation;
  }
}
.title-more-list {
  list-style: none;
  margin: 0;
  padding: 0 0 env(safe-area-inset-bottom, 0px);
  li {
    padding: 16px 8px;
    font-size: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    touch-action: manipulation;
    text-align: center;
  }
  li:last-child {
    border-bottom: none;
  }
  li:active {
    background: var(--el-fill-color-light);
  }
}
</style>
