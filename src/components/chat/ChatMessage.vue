<template>
  <div
    v-if="user"
    id="chat-message"
    ref="messageRoot"
    :class="{ 'is-dark': chat.isDarkMode, 'is-mobile': isMobile }"
  >
    <template v-if="chat.currentSession?.username !== SESSION_GROUP">
      <TransitionGroup name="msg-list" tag="ul" class="space-y-4">
        <li v-for="(entry, idx) in privateEntries" :key="idx" class="animate-slide-up group">
          <p class="time"><span>{{ formatTime(entry.date) }}</span></p>
          <div class="main relative flex items-start" :class="{ 'flex-row-reverse self': entry.self }">
            <img class="avatar shrink-0 select-none shadow-sm" :src="entry.self ? user.userProfile : peerAvatar" alt="" />
            <div class="flex flex-col mx-3" :class="entry.self ? 'items-end' : 'items-start'">
              <p class="username text-xs text-muted-foreground mb-1 select-none">{{ entry.fromNickname }}</p>
              <div v-if="entry.messageTypeId === 1" class="text relative group/bubble shadow-sm transition-shadow hover:shadow-md" :class="[entry.self ? 'rounded-l-2xl rounded-br-2xl' : 'rounded-r-2xl rounded-bl-2xl border border-border/50', { 'ai-msg': isRobotMsg(entry) }]">
                <p v-if="!isRobotMsg(entry)">{{ entry.content }}</p>
                <AiStructuredRenderer v-else :content="entry.content" :dark="chat.isDarkMode" />
                
                <!-- Hover action buttons for bubble -->
                <div class="absolute opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1 -bottom-5" :class="entry.self ? 'right-0' : 'left-0'">
                  <button class="text-[10px] bg-background border border-border shadow-sm px-2 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors whitespace-nowrap">复制</button>
                </div>
              </div>
              <img v-else :src="entry.content" class="img" alt="" />
            </div>
          </div>
        </li>
      </TransitionGroup>
    </template>
    <template v-else>
      <TransitionGroup name="msg-list" tag="ul" class="space-y-4">
        <li v-for="entry in groupEntries" :key="String(entry.id ?? entry.createTime)" class="animate-slide-up group">
          <p class="time"><span>{{ formatTime(entry.createTime) }}</span></p>   
          <div class="main relative flex items-start" :class="{ 'flex-row-reverse self': entry.fromId === user.id }">
            <img
              class="avatar shrink-0 select-none shadow-sm"
              :src="entry.fromId === user.id ? user.userProfile : entry.fromProfile"
              alt=""
            />
            <div class="flex flex-col mx-3" :class="entry.fromId === user.id ? 'items-end' : 'items-start'">
              <p class="username text-xs text-muted-foreground mb-1 select-none">{{ entry.fromName }}</p>
              <div v-if="entry.messageTypeId === 1" class="text relative group/bubble shadow-sm transition-shadow hover:shadow-md" :class="entry.fromId === user.id ? 'rounded-l-2xl rounded-br-2xl' : 'rounded-r-2xl rounded-bl-2xl border border-border/50'" v-html="entry.content"></div>
              <el-image v-else :src="entry.content" :preview-src-list="[entry.content]" class="img" />
            </div>
          </div>
        </li>
      </TransitionGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { PrivateMsg, GroupMsg } from '@/stores/chat'
import { SESSION_GROUP, SESSION_ROBOT } from '@/constants/session'
import AiStructuredRenderer from '@/components/ai/AiStructuredRenderer.vue'

withDefaults(defineProps<{ isMobile?: boolean }>(), { isMobile: false })

const chat = useChatStore()
const messageRoot = ref<HTMLElement | null>(null)
const user = computed(() => chat.currentUser)

const privateEntries = computed(() => {
  const u = user.value
  const cs = chat.currentSession
  if (!u || !cs) return []
  const key = `${u.username}#${cs.username}`
  const arr = chat.sessions[key]
  return Array.isArray(arr) ? (arr as PrivateMsg[]) : []
})

const groupEntries = computed(() => {
  const arr = chat.sessions[SESSION_GROUP]
  return Array.isArray(arr) ? (arr as GroupMsg[]) : []
})

function scrollToBottom() {
  nextTick(() => {
    const el = messageRoot.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(
  [
    () => chat.currentSession?.username,
    () => privateEntries.value.length,
    () => groupEntries.value.length,
  ],
  () => {
    scrollToBottom()
  },
  { flush: 'post' }
)

onMounted(() => scrollToBottom())

const peerAvatar = computed(() => chat.currentSession?.userProfile || '')

function isRobotMsg(entry: PrivateMsg) {
  return chat.currentSession?.username === SESSION_ROBOT && !entry.self
}

function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (!d || isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  const range = d.getHours() > 12 ? '下午' : '上午'
  const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  if (sameDay) return `${range} ${hm}`
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${range} ${hm}`
}
</script>

<style scoped lang="scss">
#chat-message {
  padding: 12px 16px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  &.is-dark {
    .time span {
      background: #404040;
      color: #ccc;
    }
    .main .username {
      color: #999;
    }
    .main .text {
      background: #333;
      color: #e8e8e8;
    }
    .main.self .text {
      background: #237804;
      color: #fff;
    }
    .md :deep(a) {
      color: #69b1ff;
    }
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    margin-bottom: 15px;
  }
  .time {
    text-align: center;
    margin: 7px 0;
    span {
      display: inline-block;
      padding: 0 18px;
      font-size: 12px;
      color: #fff;
      background: #dcdcdc;
      border-radius: 2px;
    }
  }
  .main {
    overflow: hidden;
    .avatar {
      float: left;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .username {
      margin: 0 0 4px 50px;
      font-size: 12px;
      color: #888;
    }
    .text {
      display: inline-block;
      padding: 8px 15px;
      max-width: 80%;
      background: #fff;
      border-radius: 0 16px 16px 16px;
      line-height: 1.5;
      font-size: 14px;
      margin-left: 50px;
    }
    &.self .text {
      float: right;
      background: #95ec69;
      border-radius: 16px 0 16px 16px;
    }
    &.self .avatar {
      float: right;
      margin-left: 10px;
      margin-right: 0;
    }
    &.self .username {
      margin: 0 50px 4px 0;
      text-align: right;
    }
  }
  .img {
    max-width: 200px;
    border-radius: 8px;
  }
  .md :deep(pre) {
    white-space: pre-wrap;
    word-break: break-word;
  }
  .main .text.ai-msg {
    max-width: min(82%, 600px);
    background: #f7f7f7;
  }
  &.is-dark .main .text.ai-msg {
    background: #2d2d2d;
  }
  &.is-mobile {
    padding: 8px 10px 10px;
    li {
      margin-bottom: 12px;
    }
    .main .text {
      max-width: min(86vw, 520px);
      font-size: 15px;
    }
    .main .avatar {
      width: 40px;
      height: 40px;
    }
    .img {
      max-width: min(72vw, 260px);
    }
  }
}
</style>
