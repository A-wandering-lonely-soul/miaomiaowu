<template>
  <div>
    <div class="toolbar">
      <div class="field">
        <span class="label">用户名</span>
        <el-input v-model="username" class="nameInput" placeholder="输入用户名" clearable />
      </div>
      <div class="field">
        <span class="label">角色</span>
        <el-select v-model="role" class="nameInput" placeholder="选择角色" clearable>
          <el-option label="user" value="user" />
          <el-option label="assistant" value="assistant" />
        </el-select>
      </div>
      <div class="field">
        <span class="label">时间范围</span>
        <el-date-picker
          v-model="dateScope"
          class="dateInput"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          clearable
        />
      </div>
      <div style="display:flex; gap:8px;">
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="reset">刷新</el-button>
      </div>
    </div>

    <el-table :data="rows" border stripe v-loading="loading" @selection-change="sels = $event">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="编号" width="90" />
      <el-table-column prop="userId" label="用户ID" width="90" />
      <el-table-column prop="username" label="用户名" width="130" />
      <el-table-column prop="chatId" label="chat_id" width="220" />
      <el-table-column prop="role" label="角色" width="100" >
         <template #default="{ row }">
          <div class="content-cell">{{ row.role=="user"?"用户":"回答者" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="createdTime" label="时间" width="180" />
      <el-table-column label="内容" min-width="320">
        <template #default="{ row }">
          <div class="content-cell">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="removeOne(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-button type="danger" :disabled="sels.length === 0" @click="removeBatch">批量删除</el-button>
      <el-pagination :current-page="page" :page-size="size" :page-sizes="[10,20,30,40]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="onSize" @current-change="onPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getRequest, deleteRequest } from '@/utils/api'

const rows = ref<any[]>([])
const sels = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const username = ref('')
const role = ref('')
const dateScope = ref<string[] | null>(null)

function url() {
  let u = `/admin/ai-context/page?page=${page.value}&size=${size.value}`
  if (username.value) u += `&username=${encodeURIComponent(username.value)}`
  if (role.value) u += `&role=${encodeURIComponent(role.value)}`
  if (dateScope.value) u += `&dateScope=${encodeURIComponent(String(dateScope.value))}`
  return u
}

function loadData() {
  loading.value = true
  getRequest(url(), { silent: true } as never)
    .then((resp: any) => {
      rows.value = resp?.data || []
      total.value = Number(resp?.total || 0)
      loading.value = false
    })
    .catch(() => (loading.value = false))
}

function reset() {
  username.value = ''
  role.value = ''
  dateScope.value = null
  page.value = 1
  loadData()
}

function onSize(v: number) {
  size.value = v
  loadData()
}

function onPage(v: number) {
  page.value = v
  loadData()
}

function removeOne(row: any) {
  ElMessageBox.confirm('此操作将永久删除该条上下文记录, 是否继续?', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => deleteRequest(`/admin/ai-context/${row.id}`).then(() => loadData()))
    .catch(() => {})
}

function removeBatch() {
  ElMessageBox.confirm(`此操作将永久删除【${sels.value.length}】条记录, 是否继续?`, '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => {
      const qs = sels.value.map((i: { id: number }) => `ids=${i.id}`).join('&')
      deleteRequest(`/admin/ai-context/?${qs}`).then(() => loadData())
    })
    .catch(() => {})
}

onMounted(loadData)
</script>

<style scoped>
.toolbar { display:flex; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:16px; background:#f8f9fa; padding:12px; border-radius:8px; }
.field { display:flex; flex-direction:column; gap:6px; }
.label { font-size:12px; color:#64748b; }
.nameInput { width: 180px; }
.dateInput { width: 340px; }
.pager { margin-top:10px; display:flex; justify-content:space-between; }
.content-cell { white-space: pre-wrap; max-height: 120px; overflow: auto; }
</style>
