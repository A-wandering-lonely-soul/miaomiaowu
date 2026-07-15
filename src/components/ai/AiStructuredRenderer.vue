<template>
  <div class="ai-structured-renderer">
    <template v-for="(seg, idx) in segments" :key="idx">
      <!-- 普通 Markdown -->
      <div
        v-if="seg.type === 'markdown'"
        class="md"
        v-html="renderMd(seg.content)"
      ></div>

      <!-- ECharts 图表 -->
      <AiChartBlock
        v-else-if="seg.type === 'chart'"
        :rawJson="seg.rawJson"
        :dark="dark"
      />

      <!-- 数据表格 -->
      <AiTableBlock
        v-else-if="seg.type === 'datatable'"
        :rawJson="seg.rawJson"
        :dark="dark"
      />

      <!-- Mermaid 流程图 -->
      <AiMermaidBlock
        v-else-if="seg.type === 'mermaid'"
        :content="seg.content"
        :dark="dark"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import { parseStructuredContent } from '@/utils/structuredParser'
import AiChartBlock from './AiChartBlock.vue'
import AiTableBlock from './AiTableBlock.vue'
import AiMermaidBlock from './AiMermaidBlock.vue'

const props = defineProps<{
  content: string
  dark?: boolean
}>()

const segments = computed(() => parseStructuredContent(props.content))

function renderMd(text: string): string {
  if (!text) return ''
  try {
    return marked.parse(text, { breaks: true, gfm: true }) as string
  } catch {
    return text
  }
}
</script>

<style scoped lang="scss">
.ai-structured-renderer {
  width: 100%;
  .md {
    :deep(p) { margin: 4px 0; line-height: 1.6; }
    :deep(ul), :deep(ol) { padding-left: 20px; margin: 4px 0; }
    :deep(pre) { white-space: pre-wrap; word-break: break-word; }
    :deep(code) {
      background: rgba(0, 0, 0, 0.06);
      border-radius: 3px;
      padding: 0 4px;
      font-size: 13px;
    }
    :deep(pre code) {
      background: transparent;
      padding: 0;
    }
    :deep(blockquote) {
      margin: 6px 0;
      padding-left: 10px;
      border-left: 3px solid #ccc;
      color: #888;
    }
    :deep(table) {
      border-collapse: collapse;
      font-size: 13px;
      th, td { border: 1px solid #e0e0e0; padding: 4px 10px; }
      thead { background: #f5f5f5; }
    }
    :deep(h1), :deep(h2), :deep(h3) {
      margin: 8px 0 4px;
      font-size: 1em;
      font-weight: 700;
    }
    :deep(a) { color: #1677ff; }
    :deep(img) {
      max-width: 100%;
      max-height: 320px;
      border-radius: 8px;
      margin-top: 6px;
      display: block;
      object-fit: contain;
    }
  }
}
</style>
