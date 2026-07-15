<template>
  <div class="ikb">
    <h2>图片知识库</h2>
    <p class="tip-text">
      图片经多模态向量（DashScope）编码入库，支持「文字搜图」与「以图搜图」，命中的图片也会在 AI 聊天中被召回展示。
      与文本知识库为独立向量库、额度分开。
    </p>

    <el-card class="upload">
      <el-upload
        drag
        :auto-upload="false"
        :file-list="fileList"
        :on-change="onFile"
        :on-remove="onRemove"
        accept=".jpg,.jpeg,.png,.bmp"
      >
        <div>将图片拖到此处，或点击选择</div>
        <template #tip>
          <div class="el-upload__tip">支持 JPG / PNG / BMP（多模态模型限制，暂不支持 webp/gif），单张建议 &lt; 3MB</div>
        </template>
      </el-upload>
      <el-input v-model="category" placeholder="分类标签（可选）" style="margin-top: 12px; max-width: 400px" />
      <div style="margin-top: 12px; display: flex; gap: 8px">
        <el-button type="primary" :disabled="!selectedFile" :loading="uploading" @click="upload">提交入库</el-button>
        <el-button type="danger" plain :loading="clearing" @click="clearAll">清空图片库</el-button>
      </div>
    </el-card>

    <el-card style="margin-top: 16px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="文字搜图" name="text">
          <div style="display:flex; gap:8px">
            <el-input v-model="query" placeholder="输入描述搜索图片，例如：产品说明书截图" @keydown.enter="searchByText" />
            <el-button type="primary" :loading="searching" @click="searchByText">搜索</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="以图搜图" name="image">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap: wrap">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="onQueryImage"
              accept=".jpg,.jpeg,.png,.bmp"
            >
              <el-button>选择查询图片</el-button>
            </el-upload>
            <span v-if="queryImageName" class="query-image-name">{{ queryImageName }}</span>
            <el-button type="primary" :disabled="!queryImageFile" :loading="searching" @click="searchByImage">开始搜索</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div v-if="results.length" class="grid">
        <div v-for="(item, idx) in results" :key="idx" class="grid-item">
          <el-image
            :src="item.image_url"
            :preview-src-list="previewList"
            :initial-index="idx"
            fit="cover"
            class="thumb"
          >
            <template #error>
              <div class="thumb-error">加载失败</div>
            </template>
          </el-image>
          <div class="meta">
            <div class="filename" :title="item.filename">{{ item.filename || '未命名' }}</div>
            <div class="sub">
              <span>{{ item.category || 'default' }}</span>
              <span class="score">相似度 {{ formatScore(item.score) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无结果，先上传图片或调整搜索词" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { postRequest, getRequest, deleteRequest } from '@/utils/api'

const selectedFile = ref<File | null>(null)
const fileList = ref<any[]>([])
const category = ref('')
const uploading = ref(false)
const clearing = ref(false)

const activeTab = ref('text')
const query = ref('')
const searching = ref(false)
const results = ref<any[]>([])

const queryImageFile = ref<File | null>(null)
const queryImageName = ref('')

const previewList = computed(() => results.value.map((r: any) => r.image_url))

function onFile(file: any) {
  selectedFile.value = file.raw as File
  fileList.value = [file]
}
function onRemove() {
  selectedFile.value = null
  fileList.value = []
}
function formatScore(score: number) {
  if (typeof score !== 'number') return '-'
  return score.toFixed(3)
}

function upload() {
  if (!selectedFile.value) return
  const fd = new FormData()
  fd.append('file', selectedFile.value)
  fd.append('category', category.value || 'default')
  uploading.value = true
  postRequest('/image-knowledge/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(() => {
      uploading.value = false
      onRemove()
      category.value = ''
    })
    .catch(() => {
      uploading.value = false
    })
}

function searchByText() {
  if (!query.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  searching.value = true
  getRequest(`/image-knowledge/search?query=${encodeURIComponent(query.value)}&topK=12`, { silent: true } as never)
    .then((resp: any) => {
      results.value = resp?.obj || []
      searching.value = false
      if (!results.value.length) ElMessage.info('没有找到相关图片')
    })
    .catch(() => {
      searching.value = false
    })
}

function onQueryImage(file: any) {
  queryImageFile.value = file.raw as File
  queryImageName.value = file.name
}

function searchByImage() {
  if (!queryImageFile.value) {
    ElMessage.warning('请选择查询图片')
    return
  }
  const fd = new FormData()
  fd.append('file', queryImageFile.value)
  fd.append('topK', '12')
  searching.value = true
  postRequest('/image-knowledge/search-by-image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    silent: true,
  })
    .then((resp: any) => {
      results.value = resp?.obj || []
      searching.value = false
      if (!results.value.length) ElMessage.info('没有找到相似图片')
    })
    .catch(() => {
      searching.value = false
    })
}

function clearAll() {
  ElMessageBox.confirm('确定要清空整个图片知识库吗？此操作会删除所有已入库图片向量，且不可恢复。', '清空图片库', {
    type: 'warning',
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
  })
    .then(() => {
      clearing.value = true
      return deleteRequest('/image-knowledge/clear')
    })
    .then(() => {
      clearing.value = false
      results.value = []
    })
    .catch(() => {
      clearing.value = false
    })
}
</script>

<style scoped>
.ikb {
  max-width: 1400px;
  margin: 0 auto;
}
.tip-text {
  color: #64748b;
  font-size: 13px;
  margin: 4px 0 12px;
  line-height: 1.6;
}
.upload {
  margin-top: 12px;
}
.grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.grid-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
}
.grid-item:hover {
  box-shadow: 0 6px 20px -8px rgba(15, 23, 42, 0.25);
}
.thumb {
  width: 100%;
  height: 160px;
  display: block;
  background: #f1f5f9;
}
.thumb-error {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 13px;
  background: #f1f5f9;
}
.meta {
  padding: 8px 10px;
}
.filename {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
}
.score {
  color: #2563eb;
}
.query-image-name {
  font-size: 13px;
  color: #475569;
}
</style>
