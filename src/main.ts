import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zh from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import '@/styles/tailwind.scss'
import '@/styles/overlay.scss'
import App from './App.vue'
import router from './router'
import { setApiRouter } from './utils/api'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zh })
setApiRouter(router)
app.mount('#app')