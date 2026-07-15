import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Login from '@/views/chat/Login.vue'
import ChatRoom from '@/views/chat/ChatRoom.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import Home from '@/views/admin/Home.vue'
import AdminWelcome from '@/views/admin/AdminWelcome.vue'
import UserInfo from '@/views/admin/UserInfo.vue'
import GroupChatRecord from '@/views/admin/GroupChatRecord.vue'
import PrivateChatRecord from '@/views/admin/PrivateChatRecord.vue'
import KnowledgeBase from '@/views/admin/KnowledgeBase.vue'
import ImageKnowledgeBase from '@/views/admin/ImageKnowledgeBase.vue'
import SystemPrompt from '@/views/admin/SystemPrompt.vue'
import FeedbackManage from '@/views/admin/FeedbackManage.vue'
import UserReportManage from '@/views/admin/UserReportManage.vue'
import AiContextManage from '@/views/admin/AiContextManage.vue'
import { isNarrowScreen } from '@/constants/breakpoints'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Login', component: Login },
    { path: '/chatroom', name: 'ChatRoom', component: ChatRoom },
    { path: '/adminlogin', name: 'AdminLogin', component: AdminLogin },
    {
      path: '/home',
      name: 'AdminHome',
      component: Home,
      redirect: '/home/welcome',
      children: [
        { path: 'welcome', name: 'AdminWelcome', component: AdminWelcome },
        { path: 'userinfo', name: 'UserInfo', component: UserInfo },
        { path: 'groupChatRecord', name: 'GroupChatRecord', component: GroupChatRecord },
        { path: 'privateChatRecord', name: 'PrivateChatRecord', component: PrivateChatRecord },
        { path: 'knowledgebase', name: 'KnowledgeBase', component: KnowledgeBase },
        { path: 'imageknowledgebase', name: 'ImageKnowledgeBase', component: ImageKnowledgeBase },
        { path: 'systemprompt', name: 'SystemPrompt', component: SystemPrompt },
        { path: 'aicontext', name: 'AiContextManage', component: AiContextManage },
        { path: 'admin/feedback-manage', name: 'FeedbackManage', component: FeedbackManage },
        { path: 'admin/user-report-manage', name: 'UserReportManage', component: UserReportManage },
      ],
    },
  ],
})

const originalPush = router.push
router.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.path === '/') {
    next()
    return
  }
  if (to.path === '/adminlogin') {
    next()
    return
  }
  if (to.path.startsWith('/home')) {
    if (isNarrowScreen()) {
      ElMessage.warning('管理端请使用 PC 浏览器登录')
      next('/adminlogin')
      return
    }
    if (!auth.admin) {
      ElMessage.warning('请先登录管理员账号')
      next('/adminlogin')
      return
    }
    next()
    return
  }
  if (to.path === '/chatroom') {
    if (!auth.user) {
      ElMessage.warning('请先登录后再进入聊天室')
      next('/?redirect=' + encodeURIComponent(to.path))
      return
    }
    next()
    return
  }
  if (auth.user) {
    next()
  } else {
    ElMessage.error('请登录后访问！')
    next('/?redirect=' + encodeURIComponent(to.path))
  }
})

export default router
