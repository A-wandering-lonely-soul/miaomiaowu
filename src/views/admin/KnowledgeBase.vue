<template>
  <div class="kb">
    <h2>知识库管理</h2>
    <el-card class="upload">
      <el-upload drag :auto-upload="false" :file-list="fileList" :on-change="onFile" :on-remove="onRemove" accept=".md,.docx,.txt">
        <div>将文件拖到此处，或点击选择</div>
      </el-upload>
      <el-input v-model="category" placeholder="分类标签（可选）" style="margin-top: 12px; max-width: 400px" />
      <div style="margin-top: 12px">
        <el-button type="primary" :disabled="!selectedFile" :loading="uploading" @click="upload">提交上传</el-button>
      </div>
    </el-card>
    <el-card style="margin-top: 16px">
      <div style="display:flex; gap:8px">
        <el-input v-model="query" placeholder="输入问题测试知识库搜索" @keydown.enter="search" />
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
      <el-table :data="results" border stripe style="margin-top: 12px">
        <el-table-column prop="filename" label="文件名" width="240" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="score" label="相似度" width="100" />
        <el-table-column prop="content" label="内容" min-width="320" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { postRequest, getRequest } from '@/utils/api'

const selectedFile = ref<File | null>(null)
const fileList = ref<any[]>([])
const category = ref('')
const uploading = ref(false)
const query = ref('')
const results = ref<any[]>([])

function onFile(file: any) {
  const raw = file.raw as File
  selectedFile.value = raw
  fileList.value = [file]
}
function onRemove() {
  selectedFile.value = null
  fileList.value = []
}
function upload() {
  if (!selectedFile.value) return
  const fd = new FormData()
  fd.append('file', selectedFile.value)
  fd.append('category', category.value || 'default')
  uploading.value = true
  postRequest('/knowledge/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(() => { uploading.value = false; onRemove(); category.value = '' })
    .catch(() => { uploading.value = false })
}
function search() {
  if (!query.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  getRequest(`/knowledge/search?query=${encodeURIComponent(query.value)}&topK=5`, { silent: true } as never)
    .then((resp: any) => { results.value = resp?.obj || [] })
}
</script>

<style scoped>
.kb { max-width: 1400px; margin: 0 auto; }
.upload { margin-top: 12px; }
</style>
