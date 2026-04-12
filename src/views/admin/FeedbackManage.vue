<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="primary" @click="loadData">刷新</el-button>
      <el-button type="danger" @click="clearAll">一键删除全部</el-button>
    </div>
    <el-table :data="rows" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="220" show-overflow-tooltip />
      <el-table-column prop="username" label="账号" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="content" label="反馈内容" min-width="260" show-overflow-tooltip />
      <el-table-column prop="createTime" label="提交时间" width="180" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="removeOne(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        :current-page="page"
        :page-size="size"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="onSize"
        @current-change="onPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getRequest, deleteRequest } from '@/utils/api'

const rows = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)

function loadData() {
  loading.value = true
  getRequest(`/admin/feedback/page?page=${page.value}&size=${size.value}`, { silent: true } as never)
    .then((resp: any) => {
      rows.value = resp?.data || []
      total.value = Number(resp?.total || 0)
      loading.value = false
    })
    .catch(() => (loading.value = false))
}

function onSize(v: number) {
  size.value = v
  page.value = 1
  loadData()
}
function onPage(v: number) {
  page.value = v
  loadData()
}
function removeOne(row: any) {
  ElMessageBox.confirm('确定删除该条意见反馈？', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => deleteRequest(`/admin/feedback/${encodeURIComponent(row.id)}`).then(() => loadData()))
    .catch(() => {})
}
function clearAll() {
  ElMessageBox.confirm('将删除全部意见反馈记录，是否继续？', '警告', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => deleteRequest('/admin/feedback/clear').then(() => { page.value = 1; loadData() }))
    .catch(() => {})
}

onMounted(loadData)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; display: flex; gap: 10px; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>
