<template>
  <div class="p-6 bg-background min-h-screen text-foreground transition-colors duration-300">
    <div class="toolbar-card">
      <div class="toolbar">
        <div class="field">
          <span class="label">账号状态</span>
          <el-select v-model="stateValue" class="w-40" placeholder="选择状态">
            <el-option label="全部" :value="-1" />
            <el-option label="未锁定" :value="0" />
            <el-option label="已锁定" :value="1" />
          </el-select>
        </div>
        <div class="field">
          <span class="label">用户昵称</span>
          <el-input 
            v-model="keyword" 
            placeholder="输入用户昵称搜索" 
            class="w-56"
            clearable 
            @keyup.enter="loadData"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>
        <div style="display:flex; gap:8px; align-self:flex-end;">
          <el-button type="primary" @click="loadData">查询数据</el-button>
          <el-button @click="reset">重置条件</el-button>
        </div>
      </div>
    </div>

    <div class="bg-card border border-border/60 shadow-sm rounded-xl overflow-hidden relative">
      <el-table 
        :data="rows" 
        v-loading="loading" 
        row-class-name="group hover:bg-muted/50 transition-colors"
        header-cell-class-name="bg-muted text-muted-foreground font-semibold border-b border-border"
        style="width: 100%" 
        @selection-change="sels = $event"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="username" label="用户名" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="font-medium text-foreground">{{ row.username }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称">
          <template #default="{ row }">
            <el-tag size="small" type="info" class="bg-accent text-accent-foreground border-accent font-medium" round>{{ row.nickname }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="100" align="center">
          <template #default="{ row }">
            <el-image 
              :src="row.userProfile" 
              :preview-src-list="[row.userProfile]" 
              class="w-10 h-10 rounded-full shadow-sm border border-border/50 transition-transform hover:scale-105" 
              fit="cover" 
            />
          </template>
        </el-table-column>
        <el-table-column label="账户状态" width="140" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.accountNonLocked" active-text="正常" inactive-text="锁定" inline-prompt active-color="var(--primary)" @change="changeLocked(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="right">
          <template #default="{ row }">
            <!-- 悬浮才会完全显现实体的按键，实现微交互 -->
            <div class="opacity-50 group-hover:opacity-100 transition-opacity flex justify-end">
              <el-button type="danger" text bg size="small" @click="removeOne(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="p-4 flex items-center justify-between border-t border-border bg-card/80 backdrop-blur-sm">
        <div class="text-sm text-muted-foreground pl-2">
          共 <span class="font-bold text-foreground mx-1">{{ total }}</span> 项记录
        </div>
        <el-pagination 
          background 
          :current-page="page" 
          :page-size="size" 
          :page-sizes="[10,20,30,40]" 
          layout="sizes, prev, pager, next, jumper" 
          :total="total" 
          @size-change="onSize" 
          @current-change="onPage" 
        />
      </div>

      <!-- 批量操作悬浮通知栏 (Floating action bar for batch selection) -->
      <transition name="slide-up" enter-active-class="animate-slide-up" leave-active-class="animate-accordion-down">
        <div v-if="sels.length > 0" class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center justify-between gap-6 z-10 w-max border border-border/20 backdrop-blur-md">
          <span class="text-sm font-medium">已选择 {{ sels.length }} 项数据</span>
          <el-button type="danger" round size="small" class="shadow-sm font-semibold" @click="removeBatch">批量删除</el-button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getRequest, putRequest, deleteRequest } from '@/utils/api'

const rows = ref<any[]>([])
const sels = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const keyword = ref('')
const stateValue = ref(-1)

function buildUrl() {
  let url = `/user/?page=${page.value}&size=${size.value}`
  if (keyword.value) url += `&keyword=${encodeURIComponent(keyword.value)}`
  if (stateValue.value !== -1) url += `&isLocked=${stateValue.value}`
  return url
}
function loadData() {
  loading.value = true
  getRequest(buildUrl(), { silent: true } as never).then((resp: any) => {
    rows.value = resp?.data || []
    total.value = Number(resp?.total || 0)
    loading.value = false
  }).catch(() => (loading.value = false))
}
function reset() { keyword.value = ''; stateValue.value = -1; page.value = 1; loadData() }
function onSize(v: number) { size.value = v; loadData() }
function onPage(v: number) { page.value = v; loadData() }
function changeLocked(row: any) {
  putRequest(`/user/?id=${row.id}&isLocked=${!row.accountNonLocked}`).then(() => loadData())
}
function removeOne(row: any) {
  ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => deleteRequest(`/user/${row.id}`).then(() => loadData()))
    .catch(() => {})
}
function removeBatch() {
  ElMessageBox.confirm(`此操作将永久删除【${sels.value.length}】条记录, 是否继续?`, '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => {
      const qs = sels.value.map((i) => `ids=${i.id}`).join('&')
      deleteRequest(`/user/?${qs}`).then(() => loadData())
    })
    .catch(() => {})
}
onMounted(loadData)
</script>

<style scoped>
.toolbar-card { margin-bottom: 24px; }
.toolbar { display:flex; align-items:flex-end; flex-wrap:wrap; gap:12px; background:#f8f9fa; padding:12px; border-radius:8px; }
.field { display:flex; flex-direction:column; gap:6px; }
.label { font-size:12px; color:#64748b; font-weight:500; }
.w-40 { width: 160px; }
:deep(.el-table) {
  --el-table-border-color: transparent !important;
  --el-table-header-bg-color: hsl(var(--muted)) !important;
  --el-table-bg-color: transparent !important;
  --el-table-tr-bg-color: transparent !important;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
