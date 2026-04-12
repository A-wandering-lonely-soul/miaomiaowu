<template>
  <div class="min-h-[100dvh] flex flex-col bg-slate-900 text-slate-100 transition-colors duration-300 relative overflow-hidden" :class="{ 'px-4': isMobile }">
    <!-- Interactive Background Decoration: Tech Style -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div 
        class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px] opacity-80 animate-[pulse_8s_infinite] transition-transform duration-1000 ease-out"
        :style="{ transform: `translate(${-mouseX}px, ${-mouseY}px)` }"
      ></div>
      <div 
        class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[100px] opacity-80 animate-[pulse_6s_infinite] transition-transform duration-700 ease-out" 
        :style="{ transform: `translate(${mouseX * 1.5}px, ${mouseY * 1.5}px)` }"
      ></div>
      <div 
        class="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] opacity-60 animate-[pulse_10s_infinite] transition-transform duration-1000 ease-out" 
        :style="{ transform: `translate(${mouseX * -0.5}px, ${mouseY * -0.5}px)` }"
      ></div>
    </div>

    <header class="flex justify-between items-center p-6 z-50 w-full relative">
      <div class="flex items-center gap-2 text-slate-200 font-semibold tracking-wide text-lg drop-shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Admin Workspace
      </div>
      <el-button text round class="!text-slate-300 !border !border-slate-600 !bg-slate-800/60 hover:!bg-slate-700 hover:!text-slate-100 hover:!border-slate-500 backdrop-blur-md transition-all duration-200" @click="router.replace('/')">
        <i class="el-icon-back mr-1"></i> 返回客户端
      </el-button>
    </header>
    
    <main class="flex-1 flex items-center justify-center p-4 z-10 relative">
      <div class="w-full max-w-[420px] bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-blue-900/20 p-8 transition-all animate-slide-up duration-500">
        <div class="mb-8 text-center group">
          <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3 transition-transform group-hover:rotate-0 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17V7h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9"/></svg>
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight drop-shadow-sm">后台管理系统</h3>
          <p class="text-sm text-slate-400 mt-3">请登录以管理妙妙屋运营数据</p>
        </div>
        
        <el-alert
          v-if="isMobile"
          type="warning"
          :closable="false"
          show-icon
          title="请使用电脑端登录"
          description="管理端未做手机适配，请在 PC 浏览器访问。"
          class="mb-6 rounded-xl border border-warning/20 bg-warning/5"
        />
        
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-position="top"
          size="large"
          class="space-y-5"
        > 
          <el-form-item label="管理员账号" prop="username" class="!text-slate-200">
            <el-input 
              v-model="form.username" 
              :disabled="isMobile" 
              class="h-12 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 !bg-slate-900/50"
              placeholder="请输入管理员账号"
              @keydown.enter="submit" 
            >
              <template #prefix><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="安全密码" prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              :disabled="isMobile" 
              class="h-12 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 !bg-slate-900/50"
              placeholder="请输入安全密码"
              show-password
              @keydown.enter="submit" 
            >
              <template #prefix><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></template>
            </el-input>
          </el-form-item>
          
          <div class="flex items-center pt-2 pb-4">
            <el-checkbox v-model="remember" :disabled="isMobile" class="!text-slate-400 font-normal">保持登录状态一周</el-checkbox>
          </div>
          
          <el-button 
            type="primary" 
            class="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white" 
            :loading="loading" 
            :disabled="isMobile" 
            @click="submit"
          >
            进入控制台<i class="el-icon-right ml-2 opacity-80"></i>
          </el-button>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { postKeyValueRequest } from '@/utils/api'
import { useIsMobile } from '@/composables/useIsMobile'
import { useAuthStore } from '@/stores/auth'
import type { AdminUser } from '@/stores/auth'

const router = useRouter()
const { isMobile } = useIsMobile()
const auth = useAuthStore()

// Interactive background state
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = (e.clientX / window.innerWidth - 0.5) * 60
  mouseY.value = (e.clientY / window.innerHeight - 0.5) * 60
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const remember = ref(true)
const form = reactive({ username: '', password: '' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

function submit() {
  if (isMobile.value) {
    ElMessage.warning('管理端请使用 PC 浏览器登录')
    return
  }
  formRef.value?.validate((valid) => {
    if (!valid) return
    loading.value = true
    postKeyValueRequest('/admin/doLogin', form as Record<string, string>)
      .then((resp: unknown) => {
        loading.value = false
        const r = resp as { obj?: unknown } | null
        if (!r?.obj) return
        auth.setAdmin(r.obj as AdminUser, remember.value)
        router.replace('/home')
      })
      .catch(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  color: rgb(148 163 184) !important; /* slate-400 */
  font-weight: 400;
}
:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.5) !important; /* semi-transparent dark */
  box-shadow: 0 0 0 1px rgba(71, 85, 105, 0.5) !important; /* slate-600/50 */
}
:deep(.el-input__inner) {
  color: #e2e8f0 !important; /* slate-200 */
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.5) !important; /* blue-400/50 */
}
:deep(.el-checkbox__label) {
  color: rgb(148 163 184) !important;
}
</style>
