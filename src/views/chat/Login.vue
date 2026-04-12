<template>
  <div class="min-h-[100dvh] flex flex-col transition-colors duration-300 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400 via-blue-500 to-indigo-700 text-white" :class="{ 'p-4': isMobile }">
    <!-- Interactive Background Decoration -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div 
        class="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[100px] opacity-60 animate-[pulse_8s_infinite] transition-transform duration-1000 ease-out"
        :style="{ transform: `translate(${-mouseX}px, ${-mouseY}px)` }"
      ></div>
      <div 
        class="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-200/20 blur-[100px] opacity-60 animate-[pulse_6s_infinite] transition-transform duration-700 ease-out" 
        :style="{ transform: `translate(${mouseX * 1.5}px, ${mouseY * 1.5}px)` }"
      ></div>
      <div 
        class="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] opacity-50 animate-[pulse_10s_infinite] transition-transform duration-1000 ease-out" 
        :style="{ transform: `translate(${mouseX * -2}px, ${mouseY * -2}px)` }"
      ></div>
    </div>

    <header class="flex justify-end p-6 z-50 relative w-full">
      <el-button round class="!bg-white/20 !backdrop-blur-sm !border-white/40 !text-white hover:!bg-white hover:!text-blue-600 transition-all duration-200 font-medium shadow-sm" @click="router.replace('/adminlogin')">管理端登入</el-button>
    </header>

    <main class="flex-1 flex items-center justify-center p-4 z-10 relative" style="margin-top: -60px;">      
      <div class="w-full max-w-[420px] bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl shadow-blue-900/30 p-8 transition-all hover:bg-white animate-slide-up duration-500 text-slate-800">
        <div class="text-center mb-10">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3 transition-transform hover:rotate-0 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
          </div>
          <h3 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">妙妙屋 Chat V2</h3>
          <p class="text-sm text-slate-500 mt-2">欢迎回来，继续您的畅聊之旅</p>
        </div>
        
        <el-form
          ref="formRef"
          :rules="rules"
          :model="loginForm"
          label-position="top"
          size="large"
          class="space-y-4"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              autocomplete="username" 
              placeholder="请输入用户名" 
              class="h-12 !text-foreground shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
              clearable
            >
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              class="h-12 !text-foreground shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
              show-password
              @keydown.enter="submitLogin"
            >
            </el-input>
          </el-form-item>
          
          <el-form-item prop="code" class="mb-2">        
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <el-input
                v-model="loginForm.code"
                placeholder="验证码"
                class="flex-1 h-12 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                @keydown.enter="submitLogin"
              >
              </el-input>
              <img 
                class="h-12 w-full sm:w-[130px] rounded-lg cursor-pointer border border-border/50 object-contain bg-white px-1 shadow-sm hover:opacity-90 active:scale-95 transition-all" 
                :src="verifyCode" 
                title="点击切换" 
                alt="验证码" 
                @click="changeVerifyCode" 
              />
            </div>
          </el-form-item>
          
          <div class="flex items-center justify-between pb-4">
            <el-checkbox v-model="checked" class="!text-muted-foreground font-normal">记住我一周</el-checkbox>
            <el-button text class="!p-0 font-medium text-primary hover:text-primary/80 transition-colors" @click="registerVisible = true">注册新账号</el-button>
          </div>
          
          <el-button 
            type="primary" 
            class="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]" 
            :loading="loading" 
            @click="submitLogin"
          >
            登 录
          </el-button>
        </el-form>
      </div>
    </main>

    <el-dialog
      v-model="registerVisible"
      title="新用户注册"
      :width="registerDialogWidth"
      class="rounded-3xl overflow-hidden"
      align-center
      :before-close="closeRegister"
    >
      <div class="px-2">
        <p class="text-sm text-muted-foreground mb-6">创建一个新用户以加入我们的聊天室。</p>
        <el-form
          ref="regRef"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          size="large"
        >
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="registerForm.nickname" placeholder="您希望大家怎么称呼您" />
          </el-form-item>
          <el-form-item label="登录用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="仅用于登录" />
          </el-form-item>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" show-password placeholder="设置安全的密码" />
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input v-model="registerForm.checkPass" type="password" show-password placeholder="再次输入密码" />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <el-button round @click="registerVisible = false">取消</el-button>
          <el-button type="primary" round class="px-8 shadow-md" @click="submitRegister">注册</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIsMobile } from '@/composables/useIsMobile'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { postKeyValueRequest, postRequest } from '@/utils/api'
import { useChatStore } from '@/stores/chat'
import type { ChatUser } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const chat = useChatStore()
const auth = useAuthStore()
const { isMobile } = useIsMobile()

// Interactive background state
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = (e.clientX / window.innerWidth - 0.5) * 40
  mouseY.value = (e.clientY / window.innerHeight - 0.5) * 40
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const registerDialogWidth = computed(() => (isMobile.value ? '92vw' : '480px'))

const baseApi = '/api'
const verifyCode = ref(`${baseApi}/verifyCode`)
const loading = ref(false)
const checked = ref(true)
const registerVisible = ref(false)
const formRef = ref<FormInstance>()
const regRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
})

const registerForm = reactive({
  nickname: '',
  username: '',
  password: '',
  checkPass: '',
  userProfile: 'default_head.jpg',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const validatePass2 = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
    return
  }
  callback()
}

const registerRules: FormRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
}

function changeVerifyCode() {
  verifyCode.value = `${baseApi}/verifyCode?time=${Date.now()}`
}

function submitLogin() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error('用户名、密码和验证码都不能为空')
      return
    }
    loading.value = true
    postKeyValueRequest('/doLogin', loginForm as Record<string, string>)
      .then((resp: unknown) => {
        loading.value = false
        const r = resp as { obj?: ChatUser } | null | undefined
        if (r && r.obj) {
          chat.setUser(r.obj)
          auth.setUser(r.obj, checked.value)
          const redir = route.query.redirect as string | undefined
          router.replace(redir && redir !== '/' ? redir : '/chatroom')
        } else {
          changeVerifyCode()
        }
      })
      .catch(() => {
        loading.value = false
      })
  })
}

function closeRegister(done: () => void) {
  Object.assign(registerForm, {
    nickname: '',
    username: '',
    password: '',
    checkPass: '',
    userProfile: 'default_head.jpg',
  })
  done()
}

function submitRegister() {
  regRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error('请正确填写信息')
      return
    }
    postRequest('/user/register', registerForm).then((resp: unknown) => {
      if (resp) {
        registerVisible.value = false
        location.reload()
      }
    })
  })
}

</script>

<style scoped>
/* 原有的样式已被 Tailwind classes 替代 */
</style>
