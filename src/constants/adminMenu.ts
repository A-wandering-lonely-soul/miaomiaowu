export interface AdminMenuItem {
  title: string
  icon: string
  children: Array<{ path: string; title: string }>
}

export const ADMIN_MENUS: AdminMenuItem[] = [
  {
    title: '用户管理',
    icon: 'fa fa-user',
    children: [{ path: '/home/userinfo', title: '用户信息管理' }],
  },
  {
    title: '聊天记录管理',
    icon: 'fa fa-book',
    children: [
      { path: '/home/groupChatRecord', title: '群聊记录管理' },
      { path: '/home/privateChatRecord', title: '私聊记录管理' },
    ],
  },
  {
    title: 'AI知识库',
    icon: 'fa fa-database',
    children: [
      { path: '/home/knowledgebase', title: '知识库管理' },
      { path: '/home/imageknowledgebase', title: '图片知识库' },
      { path: '/home/systemprompt', title: '系统提示词' },
      { path: '/home/aicontext', title: 'AI上下文管理' },
    ],
  },
  {
    title: '意见与举报',
    icon: 'fa fa-envelope-open',
    children: [
      { path: '/home/admin/feedback-manage', title: '意见反馈记录' },
      { path: '/home/admin/user-report-manage', title: '举报记录' },
    ],
  },
]
