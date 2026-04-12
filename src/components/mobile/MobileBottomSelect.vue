<template>
  <div class="mbs">
    <button type="button" class="mbs-trigger" @click="open = true">
      <span :class="{ 'mbs-placeholder': !displayText }">{{ displayText || placeholder }}</span>
      <span class="fa fa-angle-down mbs-caret" aria-hidden="true" />
    </button>
    <el-drawer
      v-model="open"
      direction="btt"
      :size="size"
      :z-index="Z_MOBILE_PICKER"
      append-to-body
      :close-on-click-modal="true"
      :title="drawerTitle"
      class="form-bottom-sheet mobile-bottom-select-drawer"
    >
      <ul class="mbs-list" role="listbox">
        <li
          v-for="opt in options"
          :key="opt.value"
          role="option"
          :aria-selected="model === opt.value"
          :class="{ 'is-selected': model === opt.value }"
          @click="pick(opt.value)"
        >
          <span class="mbs-label">{{ opt.label }}</span>
          <span v-if="model === opt.value" class="fa fa-check mbs-check" aria-hidden="true" />
        </li>
      </ul>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Z_MOBILE_PICKER } from '@/constants/zIndex'

export interface MbsOption {
  label: string
  value: string
}

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    options: MbsOption[]
    placeholder?: string
    title?: string
    size?: string
  }>(),
  {
    placeholder: '请选择',
    title: '',
    size: '50%',
  }
)

const open = ref(false)

const displayText = computed(() => {
  const o = props.options.find((x) => x.value === model.value)
  return o?.label ?? ''
})

const drawerTitle = computed(() => props.title || props.placeholder)

function pick(v: string) {
  model.value = v
  open.value = false
}
</script>

<style scoped lang="scss">
.mbs {
  width: 100%;
}
.mbs-trigger {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 8px 12px;
  margin: 0;
  text-align: left;
  font-size: 15px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.mbs-placeholder {
  color: var(--el-text-color-placeholder);
}
.mbs-caret {
  flex-shrink: 0;
  opacity: 0.55;
  font-size: 14px;
}
.mbs-list {
  list-style: none;
  margin: 0;
  padding: 0 0 env(safe-area-inset-bottom, 0px);
}
.mbs-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 4px;
  font-size: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.mbs-list li:last-child {
  border-bottom: none;
}
.mbs-list li:active {
  background: var(--el-fill-color-light);
}
.mbs-list li.is-selected {
  color: var(--el-color-primary);
  font-weight: 500;
}
.mbs-label {
  flex: 1;
  min-width: 0;
  text-align: left;
}
.mbs-check {
  flex-shrink: 0;
  font-size: 16px;
}
</style>
