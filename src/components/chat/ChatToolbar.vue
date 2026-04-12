<template>
  <div v-if="user" id="chat-toolbar" :class="{ 'is-mobile': isMobile }">
    <el-image class="img-profile" :src="user.userProfile" fit="cover" @click="avatarPreview = true">
      <template #error><span class="fa fa-user"></span></template>
    </el-image>

    <!-- 头像预览 -->
    <el-drawer
      v-if="isMobile"
      v-model="avatarPreview"
      direction="btt"
      size="46%"
      :z-index="Z_FORM_SHEET"
      append-to-body
      destroy-on-close
      class="form-bottom-sheet"
      title="头像"
    >
      <div class="avatar-preview-body">
        <img :src="user.userProfile" alt="" />
      </div>
    </el-drawer>
    <el-dialog
      v-else
      v-model="avatarPreview"
      title="头像"
      width="min(520px, 92vw)"
      :z-index="Z_FORM_SHEET"
      append-to-body
    >
      <div style="text-align: center">
        <img :src="user.userProfile" alt="" style="max-width: 100%" />
      </div>
    </el-dialog>

    <div id="btn-bar">
      <div class="top-btn-bar">
        <el-tooltip content="进入群聊" placement="right" :disabled="isMobile">
          <el-button class="tool-btn" size="small" @click="chooseList(SESSION_GROUP)">
            <span class="fa fa-comments fa-2x"></span>
          </el-button>
        </el-tooltip>
        <el-tooltip content="家庭成员" placement="right" :disabled="isMobile">
          <el-button class="tool-btn" size="small" @click="chooseList(LIST_FAMILY)">
            <span class="fa fa-address-book-o fa-2x"></span>
          </el-button>
        </el-tooltip>
        <el-tooltip content="瓦力" placement="right" :disabled="isMobile">
          <el-button class="tool-btn" size="small" @click="chooseList(LIST_ROBOT)">
            <span class="fa fa-android fa-2x"></span>
          </el-button>
        </el-tooltip>
      </div>
      <div class="bottom-btn-bar">
        <el-tooltip content="个人中心" placement="right" :disabled="isMobile">
          <el-button class="tool-btn" size="small" @click="openProfile">
            <span class="fa fa-user fa-2x"></span>
          </el-button>
        </el-tooltip>
        <el-popover
          placement="right"
          :width="180"
          trigger="click"
          popper-class="chat-toolbar-more-popper"
        >
          <ul class="more-list">
            <li @click="openFeedback">意见反馈</li>
            <li @click="openReport">举报</li>
            <li @click="clearHistory">清空聊天记录</li>
          </ul>
          <template #reference>
            <el-button class="tool-btn" size="small"><span class="fa fa-bars fa-2x"></span></el-button>
          </template>
        </el-popover>
        <el-tooltip content="退出" placement="right" :disabled="isMobile">
          <el-button class="tool-btn" size="small" @click="exitSystem">
            <span class="fa fa-sign-out fa-2x"></span>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 意见反馈 -->
    <el-drawer
      v-if="isMobile"
      v-model="feedbackVisible"
      direction="btt"
      size="72%"
      :z-index="Z_FORM_SHEET"
      append-to-body
      destroy-on-close
      class="form-bottom-sheet"
      title="意见反馈"
    >
      <el-input v-model="feedbackContent" type="textarea" :rows="8" placeholder="请输入您的意见或建议" />
      <div class="sheet-footer">
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="sendFeedback">确定</el-button>
      </div>
    </el-drawer>
    <el-dialog
      v-else
      v-model="feedbackVisible"
      title="意见反馈"
      width="520px"
      :z-index="Z_FORM_SHEET"
      append-to-body
    >
      <el-input v-model="feedbackContent" type="textarea" :rows="8" placeholder="请输入您的意见或建议" />
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="sendFeedback">确定</el-button>
      </template>
    </el-dialog>

    <!-- 个人中心 -->
    <el-drawer
      v-if="isMobile"
      v-model="profileVisible"
      direction="btt"
      size="68%"
      :z-index="Z_FORM_SHEET"
      append-to-body
      destroy-on-close
      class="form-bottom-sheet"
      title="个人中心"
    >
      <el-form label-position="top" size="default">
        <el-form-item label="账号">
          <el-input :model-value="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-box" @click="triggerAvatar">
            <img v-if="profileForm.userProfile" :src="profileForm.userProfile" alt="" />
            <span v-else>+</span>
          </div>
          <input ref="avatarInput" type="file" accept="image/*" style="display: none" @change="onAvatar" />
        </el-form-item>
      </el-form>
      <div class="sheet-footer">
        <el-button @click="profileVisible = false">取消</el-button>
        <el-button type="primary" :loading="profileSaving" @click="saveProfile">保存</el-button>
      </div>
    </el-drawer>
    <el-dialog
      v-else
      v-model="profileVisible"
      title="个人中心"
      width="420px"
      :z-index="Z_FORM_SHEET"
      append-to-body
    >
      <el-form label-width="80px" size="small">
        <el-form-item label="账号">
          <el-input :model-value="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-box" @click="triggerAvatar">
            <img v-if="profileForm.userProfile" :src="profileForm.userProfile" alt="" />
            <span v-else>+</span>
          </div>
          <input ref="avatarInput" type="file" accept="image/*" style="display: none" @change="onAvatar" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileVisible = false">取消</el-button>
        <el-button type="primary" :loading="profileSaving" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 举报 -->
    <el-drawer
      v-if="isMobile"
      v-model="reportVisible"
      direction="btt"
      size="78%"
      :z-index="Z_FORM_SHEET"
      append-to-body
      destroy-on-close
      class="form-bottom-sheet"
      title="举报"
    >
      <el-form label-position="top" size="default">
        <el-form-item label="举报类型">
          <MobileBottomSelect
            v-model="reportForm.reportType"
            :options="reportTypeOptions"
            placeholder="请选择举报类型"
            title="选择举报类型"
          />
        </el-form-item>
        <el-form-item label="被举报用户">
          <el-input v-model="reportForm.targetName" placeholder="昵称（可选）" />
        </el-form-item>
        <el-form-item label="举报说明">
          <el-input v-model="reportForm.content" type="textarea" :rows="4" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <div class="sheet-footer">
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="danger" :loading="reportSubmitting" @click="submitReport">提交</el-button>
      </div>
    </el-drawer>
    <el-dialog
      v-else
      v-model="reportVisible"
      title="举报"
      width="420px"
      :z-index="Z_FORM_SHEET"
      append-to-body
    >
      <el-form label-width="90px" size="small">
        <el-form-item label="举报类型">
          <el-select v-model="reportForm.reportType" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="o in reportTypeOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="被举报用户">
          <el-input v-model="reportForm.targetName" placeholder="昵称（可选）" />
        </el-form-item>
        <el-form-item label="举报说明">
          <el-input v-model="reportForm.content" type="textarea" :rows="4" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="danger" :loading="reportSubmitting" @click="submitReport">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { getRequest, postRequest, putRequest } from '@/utils/api'
import { resolveApiPath } from '@/utils/apiUrl'
import { SESSION_GROUP, SESSION_ROBOT, LIST_FAMILY, LIST_ROBOT } from '@/constants/session'
import { Z_FORM_SHEET, Z_MESSAGE_BOX } from '@/constants/zIndex'
import { isNarrowScreen } from '@/constants/breakpoints'
import { REPORT_TYPE_OPTIONS } from '@/constants/reportOptions'
import MobileBottomSelect from '@/components/mobile/MobileBottomSelect.vue'

const reportTypeOptions = REPORT_TYPE_OPTIONS

withDefaults(defineProps<{ isMobile?: boolean }>(), { isMobile: false })

const router = useRouter()
const chat = useChatStore()
const auth = useAuthStore()

const user = computed(() => chat.currentUser)
const avatarPreview = ref(false)
const feedbackVisible = ref(false)
const feedbackContent = ref('')
const profileVisible = ref(false)
const profileSaving = ref(false)
const profileForm = reactive({
  id: 0,
  username: '',
  nickname: '',
  userProfile: '',
})
const avatarInput = ref<HTMLInputElement | null>(null)
const reportVisible = ref(false)
const reportSubmitting = ref(false)
const reportForm = reactive({
  reportType: '',
  targetName: '',
  content: '',
})

function msgBoxOpts() {
  return {
    zIndex: Z_MESSAGE_BOX,
    customClass: isNarrowScreen() ? 'chat-msgbox-mobile' : '',
  }
}

watch(profileVisible, (v) => {
  if (v && user.value) {
    profileForm.id = user.value.id
    profileForm.username = user.value.username
    profileForm.nickname = user.value.nickname
    profileForm.userProfile = user.value.userProfile || ''
  }
})

function chooseList(name: string) {
  chat.changeCurrentList(name)
  if (name === SESSION_GROUP) {
    chat.changeCurrentSession({ username: SESSION_GROUP, nickname: SESSION_GROUP })
  } else if (name === LIST_ROBOT) {
    chat.changeCurrentSession({
      username: SESSION_ROBOT,
      nickname: SESSION_ROBOT,
      userProfile: 'https://www.agnw.me:1220/avatar/rebot.png',
    })
  }
}

function openProfile() {
  profileVisible.value = true
}

function openFeedback() {
  feedbackVisible.value = true
}

function triggerAvatar() {
  avatarInput.value?.click()
}

async function onAvatar(e: Event) {
  const t = e.target as HTMLInputElement
  const file = t.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch(resolveApiPath('/api/ossFileUpload?module=group-chat'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) throw new Error(String(res.status))
    const url = (await res.text()).trim()
    if (/^https?:\/\//i.test(url)) profileForm.userProfile = url
  } catch {
    ElMessage.error('上传失败')
  }
  t.value = ''
}

function saveProfile() {
  if (!profileForm.nickname?.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  profileSaving.value = true
  putRequest('/user/updateuser', {
    id: profileForm.id,
    nickname: profileForm.nickname.trim(),
    userProfile: profileForm.userProfile,
  })
    .then((resp: unknown) => {
      profileSaving.value = false
      if (resp) {
        const updated = { ...auth.user, nickname: profileForm.nickname, userProfile: profileForm.userProfile }
        auth.setUser(updated as import('@/stores/auth').AuthChatUser)
        chat.setUser(updated as never)
        profileVisible.value = false
      }
    })
    .catch(() => {
      profileSaving.value = false
    })
}

function openReport() {
  reportForm.reportType = ''
  reportForm.targetName = ''
  reportForm.content = ''
  reportVisible.value = true
}

function submitReport() {
  if (!reportForm.reportType) {
    ElMessage.warning('请选择举报类型')
    return
  }
  if (!reportForm.content?.trim()) {
    ElMessage.warning('请填写举报说明')
    return
  }
  const u = user.value
  if (!u) return
  reportSubmitting.value = true
  postRequest('/user-report', {
    userId: u.id,
    nickname: u.nickname,
    reportType: reportForm.reportType,
    targetName: reportForm.targetName || '',
    content: reportForm.content.trim(),
  })
    .then(() => {
      reportSubmitting.value = false
      reportVisible.value = false
    })
    .catch(() => {
      reportSubmitting.value = false
    })
}

function sendFeedback() {
  if (!feedbackContent.value?.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  const u = user.value
  if (!u) return
  postRequest('/feedback', {
    userId: u.id,
    nickname: u.nickname,
    username: u.username,
    content: feedbackContent.value.trim(),
  }).then((resp: unknown) => {
    if (resp) {
      feedbackVisible.value = false
      feedbackContent.value = ''
    }
  })
}

function clearHistory() {
  ElMessageBox.confirm('将删除本地聊天记录（群聊记录下次登录会恢复），是否继续？', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => {
      localStorage.removeItem('chat-session')
      sessionStorage.removeItem('state')
      chat.$patch({ sessions: {} })
      ElMessage.success('已清空')
    })
    .catch(() => {})
}

function exitSystem() {
  ElMessageBox.confirm('确定退出？', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => {
      getRequest('/logout', { silent: true } as never)
      auth.clearUser()
      sessionStorage.removeItem('state')
      chat.clearUserState()
      chat.disconnect()
      router.replace('/')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
#chat-toolbar {
  height: 100%;
  box-sizing: border-box;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.img-profile {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
}
#btn-bar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-height: 0;
  width: 100%;
}
.top-btn-bar,
.bottom-btn-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tool-btn {
  width: 44px;
  height: 44px;
  margin: 0 !important;
  padding: 0 !important;
  color: #e0e0e0;
  background: transparent;
  border: none;
  touch-action: manipulation;
}
#chat-toolbar.is-mobile .tool-btn {
  min-width: 48px;
  min-height: 48px;
}
#chat-toolbar.is-mobile .img-profile {
  width: 48px;
  height: 48px;
}
.more-list {
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
      background: #f5f5f5;
    }
  }
}
.avatar-box {
  width: 80px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.avatar-preview-body {
  text-align: center;
  img {
    max-width: 100%;
    border-radius: 8px;
  }
}
</style>
