import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface AdminUser {
  id: number
  username: string
  nickname: string
  userProfile: string
  enabled?: boolean
}

export interface AuthChatUser {
  id: number
  username: string
  nickname: string
  userProfile: string
  userStateId?: number
}

const ADMIN_KEY = 'admin'
const USER_KEY = 'user'

function loadAdmin(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_KEY) || localStorage.getItem(ADMIN_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  } catch {
    return null
  }
}

function loadUser(): AuthChatUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthChatUser) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const admin = ref<AdminUser | null>(loadAdmin())
  const user = ref<AuthChatUser | null>(loadUser())

  // Persist admin to sessionStorage (or localStorage if rememberAdmin)
  watch(admin, (val) => {
    if (val) {
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify(val))
    } else {
      sessionStorage.removeItem(ADMIN_KEY)
      localStorage.removeItem(ADMIN_KEY)
    }
  })

  // Persist user to sessionStorage (or localStorage if rememberUser)
  watch(user, (val) => {
    if (val) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(val))
    } else {
      sessionStorage.removeItem(USER_KEY)
      localStorage.removeItem(USER_KEY)
    }
  })

  function setAdmin(a: AdminUser | null, remember = false) {
    admin.value = a
    if (a && remember) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(a))
    }
  }

  function setUser(u: AuthChatUser | null, remember = false) {
    user.value = u
    if (u && remember) {
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    }
  }

  function clearAdmin() {
    admin.value = null
  }

  function clearUser() {
    user.value = null
  }

  return { admin, user, setAdmin, setUser, clearAdmin, clearUser }
})
