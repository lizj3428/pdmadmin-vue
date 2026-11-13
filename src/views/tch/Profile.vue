<template>
  <div class="list-container" v-loading="loading">
    <header class="submission-heading">
      <div>
        <h1>个人资料</h1>
        <p>教工号、所属院系与职称由管理员维护，姓名与联系电话可自行修改。</p>
      </div>
    </header>

    <el-card shadow="never" class="profile-card">
      <el-form :model="form" label-width="100px" style="max-width: 560px">
        <el-form-item label="教工号">
          <el-input :model-value="info.teacherNo" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" maxlength="20" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-input :model-value="info.gender" disabled />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-input :model-value="info.deptName" disabled />
        </el-form-item>
        <el-form-item label="职称">
          <el-input :model-value="info.title" disabled />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" maxlength="11" placeholder="请输入 11 位手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { tchApi } from '@/api/tch-api'

const loading = ref(false)
const saving = ref(false)
const info = reactive<any>({})
const form = reactive({ realName: '', phone: '' })

async function load() {
  loading.value = true
  try {
    const res: any = await tchApi.profile()
    Object.assign(info, res?.data ?? {})
    form.realName = info.realName ?? ''
    form.phone = info.phone ?? ''
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!form.realName.trim()) {
    ElMessage.warning('姓名不能为空')
    return
  }
  if (!/^\d{11}$/.test(form.phone.trim())) {
    ElMessage.warning('联系电话必须是 11 位数字')
    return
  }
  saving.value = true
  try {
    await tchApi.updateProfile(form.realName.trim(), form.phone.trim())
    ElMessage.success('资料已保存')
    await load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.profile-card {
  border: 1px solid #eef1f5;
}
</style>
