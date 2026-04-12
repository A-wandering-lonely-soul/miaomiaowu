<template>
  <div
    id="user-text"
    :class="{ 'is-dark': chat.isDarkMode, 'is-mobile': isMobile }"
  >
    <!-- 移动端：输入区全宽，工具+发送同一行，避免发送按钮掉到图标下方 -->
    <div v-if="isMobile" class="mobile-compose">
      <div v-if="pendingImagePreviewUrl" class="img-preview-wrap">
        <div class="img-preview">
          <img :src="pendingImagePreviewUrl" alt="" />
          <span class="img-remove" @click="removePendingImage">×</span>
        </div>
      </div>
      <textarea
        id="textarea"
        v-model="content"
        class="mobile-textarea"
        :placeholder="inputPlaceholder"
        rows="2"
        @keyup.ctrl.enter="addMessageByClick"
        @paste="handlePaste"
      />
      <div class="mobile-actions">
        <div class="tools">
          <el-popover placement="top-start" :width="emojiWidth" trigger="click">
            <div class="emotion-list">
              <a
                v-for="(ch, index) in faceList"
                :key="index"
                href="javascript:void(0)"
                class="emotion-item"
                @click.prevent="insertEmoji(ch)"
              >{{ ch }}</a>
            </div>
            <template #reference>
              <el-button id="emojiBtn" class="emotion-select" circle>
                <span class="fa fa-smile-o" aria-hidden="true"></span>
              </el-button>
            </template>
          </el-popover>
          <el-upload
            class="upload-btn"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png,.gif"
            :on-change="handleFileChange"
          >
            <el-button id="uploadImgBtn" circle><span class="fa fa-image"></span></el-button>
          </el-upload>
        </div>
        <el-button id="sendBtn" type="primary" @click="addMessageByClick">发送</el-button>
      </div>
    </div>
    <template v-else>
      <div class="tools">
        <el-popover placement="top-start" :width="emojiWidth" trigger="click">
          <div class="emotion-list">
            <a
              v-for="(ch, index) in faceList"
              :key="index"
              href="javascript:void(0)"
              class="emotion-item"
              @click.prevent="insertEmoji(ch)"
            >{{ ch }}</a>
          </div>
          <template #reference>
            <el-button id="emojiBtn" class="emotion-select" circle>
              <span class="fa fa-smile-o" aria-hidden="true"></span>
            </el-button>
          </template>
        </el-popover>
        <el-upload
          class="upload-btn"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept=".jpg,.jpeg,.png,.gif"
          :on-change="handleFileChange"
        >
          <el-button id="uploadImgBtn" circle><span class="fa fa-image"></span></el-button>
        </el-upload>
      </div>
      <div class="input-area">
        <div v-if="pendingImagePreviewUrl" class="img-preview-wrap">
          <div class="img-preview">
            <img :src="pendingImagePreviewUrl" alt="" />
            <span class="img-remove" @click="removePendingImage">×</span>
          </div>
        </div>
        <textarea
          id="textarea"
          v-model="content"
          :placeholder="inputPlaceholder"
          @keyup.ctrl.enter="addMessageByClick"
          @paste="handlePaste"
        />
      </div>
      <el-button id="sendBtn" type="primary" size="small" @click="addMessageByClick">
        发送(Ctrl+Enter)
      </el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { resolveApiPath } from '@/utils/apiUrl'
import { SESSION_GROUP, SESSION_ROBOT, toWireUsername } from '@/constants/session'
import rawEmoji from '@/utils/emoji.json'
import type { UploadFile } from 'element-plus'
import { ActivationState } from '@stomp/stompjs'

const props = withDefaults(defineProps<{ isMobile?: boolean }>(), { isMobile: false })
const chat = useChatStore()
const content = ref('')
const faceList = ref<string[]>([])
const pendingImage = ref<File | null>(null)
const pendingImagePreviewUrl = ref('')

onMounted(() => {
  const arr = rawEmoji as { char: string }[]
  faceList.value = arr.slice(0, 120).map((x) => x.char)
})

function getOrCreateRobotChatId(): string {
  const u = chat.currentUser
  const uid = u?.id ?? 'anon'
  const key = `robot-chat-id:${uid}`
  const existing = localStorage.getItem(key)
  if (existing && existing.trim()) {
    return existing
  }
  const id = `chat_${uid}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem(key, id)
  return id
}

const inputPlaceholder = computed(() =>
  props.isMobile ? '输入消息，点击发送（可粘贴图片）' : '按 Ctrl + Enter 发送，可粘贴图片'
)

const emojiWidth = computed(() => {
  if (props.isMobile) return Math.min(340, Math.max(260, typeof window !== 'undefined' ? window.innerWidth - 32 : 300))
  return 400
})

function insertEmoji(ch: string) {
  content.value += ch
}

async function addMessageByClick() {
  const hasImage = !!pendingImage.value
  const hasText = !!(content.value && !content.value.match(/^[ ]*$/))
  if (!hasImage && !hasText) {
    ElMessage.warning('不能发送空白信息')
    return
  }
  const c = chat.stompClient
  if (!c || c.state !== ActivationState.ACTIVE) {
    ElMessage.error('WebSocket 未连接，请刷新页面')
    return
  }
  const cs = chat.currentSession
  const u = chat.currentUser
  if (!cs || !u) return

  if (hasImage && cs.username === SESSION_ROBOT) {
    const userText = hasText ? content.value : null
    await uploadAndSendImage(pendingImage.value!, userText)
    if (hasText) content.value = ''
    return
  }
  if (hasImage) {
    await uploadAndSendImage(pendingImage.value!, null)
  }
  if (hasText) {
    const msgObj: Record<string, unknown> = {
      content: content.value,
      messageTypeId: 1,
    }
    if (cs.username === SESSION_GROUP) {
      chat.publish('/ws/groupChat', JSON.stringify(msgObj))
    } else if (cs.username === SESSION_ROBOT) {
      msgObj.fromNickname = u.nickname
      msgObj.to = toWireUsername(SESSION_ROBOT)
      msgObj.chatId = getOrCreateRobotChatId()
      chat.publish('/ws/robotChat', JSON.stringify(msgObj))
      chat.addMessage(msgObj as never)
    } else {
      msgObj.from = u.username
      msgObj.fromNickname = u.nickname
      msgObj.to = cs.username
      chat.publish('/ws/chat', JSON.stringify(msgObj))
      chat.addMessage(msgObj as never)
    }
    content.value = ''
  }
}

function handleFileChange(file: UploadFile) {
  const rawFile = file.raw
  if (!rawFile) return
  if (rawFile.size / 1024 / 1024 >= 1) {
    ElMessage.error('图片大小不能超过 1MB')
    return
  }
  const ext = rawFile.name.substring(rawFile.name.lastIndexOf('.') + 1).toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
    ElMessage.error('图片格式不符合要求')
    return
  }
  if (pendingImagePreviewUrl.value) URL.revokeObjectURL(pendingImagePreviewUrl.value)
  pendingImage.value = rawFile
  pendingImagePreviewUrl.value = URL.createObjectURL(rawFile)
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
      e.preventDefault()
      const file = items[i].getAsFile()
      if (!file) return
      if (file.size / 1024 / 1024 > 5) {
        ElMessage.error('粘贴图片不能超过 5MB')
        return
      }
      if (pendingImagePreviewUrl.value) URL.revokeObjectURL(pendingImagePreviewUrl.value)
      pendingImage.value = file
      pendingImagePreviewUrl.value = URL.createObjectURL(file)
      return
    }
  }
}

function removePendingImage() {
  if (pendingImagePreviewUrl.value) URL.revokeObjectURL(pendingImagePreviewUrl.value)
  pendingImage.value = null
  pendingImagePreviewUrl.value = ''
}

async function uploadAndSendImage(file: File, userText: string | null) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('module', 'group-chat')
  const cs = chat.currentSession
  const u = chat.currentUser
  if (!cs || !u) return
  try {
    const res = await fetch(resolveApiPath('/api/ossFileUpload'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const imageUrl = await res.text()

    const msgObj: Record<string, unknown> = {
      content: imageUrl.trim(),
      messageTypeId: 2,
    }
    if (cs.username === SESSION_GROUP) {
      chat.publish('/ws/groupChat', JSON.stringify(msgObj))
    } else if (cs.username === SESSION_ROBOT) {
      msgObj.fromNickname = u.nickname
      msgObj.to = toWireUsername(SESSION_ROBOT)
      msgObj.chatId = getOrCreateRobotChatId()
      if (userText) msgObj.textContent = userText
      chat.publish('/ws/robotChat', JSON.stringify(msgObj))
      chat.addMessage({ ...msgObj } as never)
      if (userText) {
        chat.addMessage({
          content: userText,
          messageTypeId: 1,
          fromNickname: u.nickname,
          to: toWireUsername(SESSION_ROBOT),
        } as never)
      }
    } else {
      msgObj.from = u.username
      msgObj.fromNickname = u.nickname
      msgObj.to = cs.username
      chat.publish('/ws/chat', JSON.stringify(msgObj))
      chat.addMessage(msgObj as never)
    }
    removePendingImage()
  } catch (e) {
    console.error(e)
    ElMessage.error('图片上传失败')
  }
}
</script>

<style scoped lang="scss">
#user-text {
  display: flex;
  align-items: flex-end;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
}
.tools {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.emotion-list {
  max-height: 220px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.emotion-item {
  cursor: pointer;
  padding: 2px;
  font-size: 18px;
}
.input-area {
  flex: 1;
  min-width: 0;
}
#textarea {
  width: 100%;
  min-height: 64px;
  resize: vertical;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.img-preview-wrap {
  margin-bottom: 6px;
}
.img-preview {
  position: relative;
  display: inline-block;
}
.img-preview img {
  max-height: 80px;
  border-radius: 6px;
}
.img-remove {
  position: absolute;
  right: 2px;
  top: 2px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 18px;
  border-radius: 50%;
}
#user-text.is-dark {
  background: #2a2a2a;
  border-top-color: #3a3a3a;
  #textarea {
    background: #333;
    border-color: #444;
    color: #e8e8e8;
  }
}
#user-text.is-mobile {
  display: block;
  padding: 10px max(10px, env(safe-area-inset-left, 0px)) max(10px, env(safe-area-inset-bottom, 0px))
    max(10px, env(safe-area-inset-right, 0px));
  flex-shrink: 0;
  .mobile-compose {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mobile-textarea,
  #textarea.mobile-textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 72px;
    max-height: 32vh;
    resize: none;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 16px;
    line-height: 1.45;
    -webkit-overflow-scrolling: touch;
  }
  .mobile-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .mobile-actions .tools {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .emotion-select,
  .upload-btn :deep(.el-button) {
    min-width: 44px;
    min-height: 44px;
    touch-action: manipulation;
  }
  #sendBtn {
    min-height: 44px;
    padding: 0 22px;
    flex-shrink: 0;
    touch-action: manipulation;
  }
}
#user-text.is-mobile.is-dark .mobile-textarea {
  background: #333;
  border-color: #444;
  color: #e8e8e8;
}
</style>
