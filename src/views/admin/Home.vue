<template>
  <el-container class="min-h-screen text-slate-800 transition-colors duration-300 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f5fb_100%)]">
    <el-header class="h-16 flex items-center justify-between px-6 border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-md bg-white/85">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="flex flex-col leading-none">
          <span class="text-base font-bold text-slate-800 tracking-tight">妙妙屋管理端</span>
          <span class="text-[11px] text-slate-400 font-normal tracking-widest uppercase">Admin Console</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <img 
            v-if="auth.admin?.userProfile" 
            :src="auth.admin.userProfile" 
            class="w-6 h-6 rounded-full object-cover ring-1 ring-blue-200" 
            :alt="auth.admin.nickname"
          />
          <div v-else class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="el-icon-user-solid text-blue-600 text-xs"></i>
          </div>
          <span class="text-sm font-medium text-slate-700">{{ auth.admin?.nickname || '管理员' }}</span>
        </div>
        <el-button type="danger" plain round size="small" class="hover:shadow-md transition-shadow group" @click="logout">
          退出登录 <i class="el-icon-switch-button ml-1 group-hover:translate-x-0.5 transition-transform"></i>
        </el-button>
      </div>
    </el-header>
    
    <el-container>
      <el-aside width="240px" class="bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 min-h-[calc(100vh-4rem)] shadow-[4px_0_24px_-12px_rgba(15,23,42,0.18)] z-40">
        <el-menu 
          :default-active="route.path" 
          router 
          unique-opened
          class="border-none bg-transparent pt-4 px-3 admin-side-menu"
          active-text-color="#2563eb"
          active-background-color="#eff6ff"
        >
          <el-sub-menu v-for="(m, idx) in menus" :key="m.title" :index="String(idx)" class="mb-1 rounded-xl overflow-hidden">
            <template #title>
              <div class="flex items-center text-slate-600 group-hover:text-blue-600 transition-colors">
                <i :class="[m.icon, 'text-lg opacity-70']"></i>
                <span class="ml-3 font-medium">{{ m.title }}</span>
              </div>
            </template>
            <el-menu-item 
              v-for="c in m.children" 
              :key="c.path" 
              :index="c.path"
              class="rounded-lg mx-2 mb-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {{ c.title }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      
      <el-main class="bg-transparent min-h-[calc(100vh-4rem)] p-6 relative overflow-x-hidden">
        <router-view v-slot="{ Component }">
          <transition 
            name="fade-slide" 
            mode="out-in"
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getRequest } from '@/utils/api'
import { ADMIN_MENUS } from '@/constants/adminMenu'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const menus = ADMIN_MENUS
const auth = useAuthStore()

function logout() {
  ElMessageBox.confirm('此操作将注销登录, 是否继续?', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => {
      getRequest('/admin/logout', { silent: true } as never)
      auth.clearAdmin()
      router.replace('/adminlogin')
    })
    .catch(() => {})
}
</script>

<style scoped>
:deep(.el-menu-item.is-active) {
  background-color: #eff6ff !important;
  color: #2563eb !important;
  font-weight: 600;
  box-shadow: none;
}
:deep(.admin-side-menu .el-sub-menu__title) {
  border-radius: 10px;
  margin: 0 8px 4px 8px;
}
:deep(.admin-side-menu .el-sub-menu__title:hover) {
  background-color: #f1f5f9 !important;
}
:deep(.admin-side-menu .el-menu-item) {
  border-radius: 10px;
  margin: 0 8px 6px 8px;
  min-height: 40px;
  line-height: 40px;
}
:deep(.admin-side-menu .el-menu-item:hover) {
  background-color: #f8fafc !important;
  color: #1d4ed8 !important;
}
:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background-color: #2563eb;
}
:deep(.el-menu-item) {
  position: relative;
}
</style>
