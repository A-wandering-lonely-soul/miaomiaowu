<template>
  <div class="ai-mermaid-block" :class="{ 'is-dark': dark }">
    <p v-if="error" class="ai-block-error">流程图渲染失败：{{ error }}</p>
    <div v-else class="mermaid-container" ref="containerEl" v-html="svg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import mermaid from 'mermaid'

let initialized = false

function ensureInit(dark: boolean) {
  if (initialized) return
  initialized = true
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'default',
    securityLevel: 'loose',
  })
}

const props = defineProps<{
  content: string
  dark?: boolean
}>()

const svg = ref('')
const error = ref('')
const containerEl = ref<HTMLElement | null>(null)

let idCounter = 0

async function renderDiagram() {
  const id = `mermaid-${Date.now()}-${idCounter++}`
  ensureInit(props.dark ?? false)
  try {
    const result = await mermaid.render(id, props.content)
    svg.value = result.svg
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '未知错误'
    svg.value = ''
  }
}

onMounted(() => renderDiagram())
watch(() => props.content, () => renderDiagram())
watch(() => props.dark, () => {
  initialized = false
  renderDiagram()
})
</script>

<style scoped lang="scss">
.ai-mermaid-block {
  margin: 8px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f9f9f9;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &.is-dark {
    background: #2a2a2a;
  }
  .mermaid-container {
    display: flex;
    justify-content: center;
    :deep(svg) {
      max-width: 100%;
      height: auto;
    }
  }
}
.ai-block-error {
  color: #cf1322;
  font-size: 12px;
  padding: 4px;
}
</style>
