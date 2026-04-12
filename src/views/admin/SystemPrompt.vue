<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button type="primary" @click="openAdd">添加提示词</el-button>
    </div>
    <el-row :gutter="12">
      <el-col :span="12" v-for="item in list" :key="item.id">
        <el-card shadow="hover" style="margin-bottom: 12px">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px">
            <div>
              <el-tag v-if="item.isActive" type="success">当前启用</el-tag>
              <span style="margin-left: 8px">{{ item.description || '无描述' }}</span>
            </div>
            <div>
              <el-button v-if="!item.isActive" type="success" size="small" @click="activate(item.id)">启用</el-button>
              <el-button type="primary" size="small" @click="openEdit(item)">编辑</el-button>
              <el-button type="danger" size="small" @click="remove(item.id)">删除</el-button>
            </div>
          </div>
          <pre style="white-space: pre-wrap">{{ item.promptContent }}</pre>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="visible" :title="isEdit ? '编辑提示词' : '添加提示词'" width="60%">
      <el-form :model="form" label-width="100px">
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="提示词内容"><el-input v-model="form.promptContent" type="textarea" :rows="12" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/api'

const list = ref<any[]>([])
const visible = ref(false)
const isEdit = ref(false)
const form = reactive<{ id: number | null; description: string; promptContent: string }>({ id: null, description: '', promptContent: '' })

function load() {
  getRequest('/system-prompt/list', { silent: true } as never).then((resp: any) => {
    list.value = resp?.obj || []
  })
}
function openAdd() {
  isEdit.value = false
  form.id = null; form.description = ''; form.promptContent = ''
  visible.value = true
}
function openEdit(item: any) {
  isEdit.value = true
  form.id = item.id; form.description = item.description || ''; form.promptContent = item.promptContent || ''
  visible.value = true
}
function submit() {
  if (!form.promptContent.trim()) {
    ElMessage.warning('请输入提示词内容')
    return
  }
  const req = isEdit.value ? putRequest('/system-prompt/update', form) : postRequest('/system-prompt/add', form)
  req.then(() => { visible.value = false; load() })
}
function activate(id: number) {
  ElMessageBox.confirm('启用此提示词将禁用其他所有提示词，是否继续？', '提示', { type: 'warning' })
    .then(() => putRequest(`/system-prompt/activate/${id}`).then(() => load()))
    .catch(() => {})
}
function remove(id: number) {
  ElMessageBox.confirm('确定要删除此提示词吗？', '提示', { type: 'warning' })
    .then(() => deleteRequest(`/system-prompt/delete/${id}`).then(() => load()))
    .catch(() => {})
}

onMounted(load)
</script>
