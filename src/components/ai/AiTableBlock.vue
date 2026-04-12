<template>
  <div class="ai-table-block" :class="{ 'is-dark': dark }">
    <p v-if="error" class="ai-block-error">表格解析失败：{{ error }}</p>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="(h, i) in data!.headers" :key="i">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in data!.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { safeParseJson } from '@/utils/structuredParser'
import type { TableData } from '@/utils/structuredParser'

const props = defineProps<{
  rawJson: string
  dark?: boolean
}>()

const data = computed(() => safeParseJson<TableData>(props.rawJson))
const error = computed(() => {
  if (!data.value || !Array.isArray(data.value.headers) || !Array.isArray(data.value.rows)) {
    return '无效的 datatable JSON'
  }
  return ''
})
</script>

<style scoped lang="scss">
.ai-table-block {
  margin: 8px 0;
  overflow: hidden;
  border-radius: 8px;
  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 13px;
    th, td {
      border: 1px solid #e0e0e0;
      padding: 6px 12px;
      text-align: left;
      white-space: nowrap;
    }
    thead tr {
      background: #f5f5f5;
      font-weight: 600;
    }
    tbody tr:nth-child(even) {
      background: #fafafa;
    }
  }
  &.is-dark {
    table {
      th, td { border-color: #444; }
      thead tr { background: #333; color: #e8e8e8; }
      tbody tr { color: #ddd; }
      tbody tr:nth-child(even) { background: #2a2a2a; }
    }
  }
}
.ai-block-error {
  color: #cf1322;
  font-size: 12px;
  padding: 8px;
}
</style>
