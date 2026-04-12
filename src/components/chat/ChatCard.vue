<template>
  <div id="chat-card" :class="{ 'is-dark': chat.isDarkMode }">
    <el-input
      v-model="filterKey"
      class="search"
      size="small"
      placeholder="搜索家庭成员"
      clearable
    >
      <template #prefix>
        <span class="fa fa-search" style="opacity: 0.5"></span>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chat = useChatStore()
const filterKey = computed({
  get: () => chat.filterKey,
  set: (v: string) => {
    chat.$patch({ filterKey: v })
  },
})
</script>

<style scoped lang="scss">
#chat-card {
  padding: 12px 12px 8px;
  flex-shrink: 0;
}
.search :deep(.el-input__wrapper) {
  background: #e9e9e9;
  border-radius: 4px;
  box-shadow: none;
}
#chat-card.is-dark .search :deep(.el-input__wrapper) {
  background: #333;
}
</style>
