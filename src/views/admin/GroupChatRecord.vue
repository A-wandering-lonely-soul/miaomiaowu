<template>
  <div>
    <div class="toolbar">
      <div class="field">
        <span class="label">发送者昵称</span>
        <el-input v-model="nameKeyword" class="nameInput" placeholder="输入发送者昵称" clearable />
      </div>
      <div class="field">
        <span class="label">发送时间</span>
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
      <div class="field">
        <span class="label">消息类型</span>
        <el-radio-group v-model="msgType">
        <el-radio :value="1">文本</el-radio>
        <el-radio :value="2">图片</el-radio>
      </el-radio-group>
      </div>
      <el-button type="primary" @click="loadData">搜索</el-button>
      <el-button @click="reset">刷新</el-button>
    </div>
    <el-table :data="rows" border stripe v-loading="loading" @selection-change="sels = $event">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="消息编号" width="90" />
      <el-table-column prop="fromId" label="发送者编号" width="110" />
      <el-table-column prop="fromName" label="发送者昵称" width="140" />
      <el-table-column prop="createTime" label="发送时间" width="180" />
      <el-table-column label="内容" min-width="320">
        <template #default="{ row }">
          <div v-if="row.messageTypeId === 1" v-html="row.content"></div>
          <el-image v-else :src="row.content" :preview-src-list="[row.content]" style="width:50px;height:50px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="removeOne(row)">删除</el-button>
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
const nameKeyword = ref('')
const dateScope = ref<string[] | null>(null)
const msgType = ref(-1)

function buildUrl() {
  let url = `/groupMsgContent/page?page=${page.value}&size=${size.value}`
  if (nameKeyword.value) url += `&nickname=${encodeURIComponent(nameKeyword.value)}`
  if (dateScope.value) url += `&dateScope=${encodeURIComponent(String(dateScope.value))}`
  if (msgType.value !== -1) url += `&type=${msgType.value}`
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
function reset() { nameKeyword.value = ''; dateScope.value = null; msgType.value = -1; page.value = 1; loadData() }
function onSize(v: number) { size.value = v; loadData() }
function onPage(v: number) { page.value = v; loadData() }
function removeOne(row: any) {
  ElMessageBox.confirm('此操作将永久删除该条消息记录, 是否继续?', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => deleteRequest(`/groupMsgContent/${row.id}`).then(() => loadData()))
    .catch(() => {})
}
function removeBatch() {
  ElMessageBox.confirm(`此操作将永久删除【${sels.value.length}】条记录, 是否继续?`, '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(() => {
      const qs = sels.value.map((i) => `ids=${i.id}`).join('&')
      deleteRequest(`/groupMsgContent/?${qs}`).then(() => loadData())
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
</style>
