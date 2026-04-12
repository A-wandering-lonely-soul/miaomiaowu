<template>
  <div v-if="user" id="chat-list" :class="{ 'is-dark': chat.isDarkMode }">
    <ul v-if="chat.currentList === SESSION_GROUP">
      <p class="list-header">群聊列表</p>
      <li
        :class="{ active: chat.currentSession?.username === SESSION_GROUP }"
        @click="pick(chatObj)"
      >
        <img class="avatar" src="@/assets/chat.png" alt="" />
        <el-badge :is-dot="isDotGroup">
          <span class="name">群聊</span>
        </el-badge>
      </li>
    </ul>
    <ul v-if="chat.currentList === LIST_ROBOT">
      <p class="list-header">快来和瓦力聊天吧！</p>
      <li
        :class="{ active: chat.currentSession?.username === SESSION_ROBOT }"
        @click="pick(robotObj)"
      >
        <img class="avatar" src="@/assets/rebot.png" alt="" />
        <span class="name">瓦力 (智能回复)</span>
      </li>
    </ul>
    <div v-if="chat.currentList === LIST_FAMILY" class="list-scroll">
      <ul>
        <p class="list-header">家庭成员</p>
        <li
          v-for="item in filteredUsers"
          :key="item.username"
          :class="{ active: chat.currentSession?.username === item.username }"
          @click="pick(item)"
        >
          <div class="row">
            <div>
              <el-badge :is-dot="isDotFor(item.username)">
                <el-image class="avatar" :src="item.userProfile" :preview-src-list="[item.userProfile]">
                  <template #error>
                    <div class="image-slot"><span>图</span></div>
                  </template>
                </el-image>
              </el-badge>
              <span class="name">{{ item.nickname }}</span>
            </div>
            <el-badge :value="item.userStateId === 1 ? '在线' : '离线'" :type="item.userStateId === 1 ? 'danger' : 'info'" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { ChatUser } from '@/stores/chat'
import { SESSION_GROUP, SESSION_ROBOT, LIST_ROBOT, LIST_FAMILY } from '@/constants/session'

const props = defineProps<{ isMobile?: boolean }>()
const emit = defineEmits<{ sessionPicked: [] }>()

const chat = useChatStore()
const user = computed(() => chat.currentUser)

const chatObj = { username: SESSION_GROUP, nickname: SESSION_GROUP }
const robotObj: ChatUser & { userProfile: string } = {
  id: 0,
  username: SESSION_ROBOT,
  nickname: SESSION_ROBOT,
  userProfile: 'https://www.agnw.me:1220/avatar/rebot.png',
}

const filteredUsers = computed(() => {
  const key = (chat.filterKey || '').trim().toLowerCase()
  if (!key) return chat.users
  return chat.users.filter((u) => u.nickname?.toLowerCase().includes(key))
})

const isDotGroup = computed(() => {
  if (!user.value) return false
  return chat.isDot[user.value.username + '#' + SESSION_GROUP]
})

function isDotFor(username: string) {
  if (!user.value) return false
  return chat.isDot[user.value.username + '#' + username]
}

function pick(sess: { username: string; nickname: string; userProfile?: string }) {
  chat.changeCurrentSession(sess)
  emit('sessionPicked')
}
</script>

<style scoped lang="scss">
#chat-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  color: #303133;
  .list-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  ul {
    margin: 0;
    padding: 0;
  }
  .list-header {
    color: #909399;
    font-size: 12px;
    padding: 8px 12px;
    margin: 0;
  }
  li {
    padding: 10px 12px;
    margin: 4px 8px;
    list-style: none;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    &.active {
      background: rgba(64, 158, 255, 0.12);
    }
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    margin-right: 10px;
    object-fit: cover;
  }
  .name {
    font-size: 14px;
    color: #303133;
  }
  &.is-dark {
    color: #e0e0e0;
    .list-header {
      color: #909399;
    }
    li:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    li.active {
      background: rgba(64, 158, 255, 0.2);
    }
    .name {
      color: #e8e8e8;
    }
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    > div:first-child {
      display: flex;
      align-items: center;
      min-width: 0;
    }
  }
}
.image-slot {
  width: 36px;
  height: 36px;
  background: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}
</style>
