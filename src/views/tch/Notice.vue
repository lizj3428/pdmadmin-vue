<template>
  <div class="list-container" v-loading="loading">
    <header class="submission-heading">
      <div>
        <h1>我的通知</h1>
        <p>投稿的审核结果会发到这里；点「标为已读」可清掉未读标记。</p>
      </div>
      <el-tag v-if="unread > 0" type="danger" effect="light">{{ unread }} 条未读</el-tag>
    </header>

    <el-table :data="datalist" border stripe size="small">
      <el-table-column header-align="center" align="center" label="状态" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.readFlag === 0" type="danger" size="small">未读</el-tag>
          <el-tag v-else type="info" size="small">已读</el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="title" label="标题" width="140" show-overflow-tooltip />
      <el-table-column header-align="center" align="center" prop="content" label="内容" min-width="320" show-overflow-tooltip />
      <el-table-column header-align="center" align="center" label="时间" width="170">
        <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="操作" width="120">
        <template #default="scope">
          <el-button
            v-if="scope.row.readFlag === 0"
            type="primary"
            size="small"
            :loading="readingId === scope.row.id"
            @click="markRead(scope.row)"
          >标为已读</el-button>
          <span v-else style="color: #c0c4cc">—</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px"
      @current-change="onPageChange"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="query.pagesize"
      :current-page="query.pagenum"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { tchApi } from '@/api/tch-api'
import Constants from '@/utils/constants'

const datalist = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const unread = ref(0)
const readingId = ref<any>(null)

const query = reactive({ pagenum: 1, pagesize: Constants.PAGE_SIZE })

function formatTime(v: any) {
  if (!v) return '—'
  return String(v).replace('T', ' ')
}

async function getList() {
  loading.value = true
  try {
    const res: any = await tchApi.noticeList({}, query.pagenum, query.pagesize)
    datalist.value = res?.data?.list ?? []
    total.value = res?.data?.total ?? 0
  } finally {
    loading.value = false
  }
}

async function loadUnread() {
  try {
    const res: any = await tchApi.noticeUnread()
    unread.value = Number(res?.data ?? 0)
  } catch (e) {
    unread.value = 0
  }
}

async function markRead(row: any) {
  readingId.value = row.id
  try {
    await tchApi.noticeRead(row.id)
    row.readFlag = 1
    ElMessage.success('已标为已读')
    loadUnread()
  } finally {
    readingId.value = null
  }
}

function onPageChange(p: number) {
  query.pagenum = p
  getList()
}

onMounted(() => {
  getList()
  loadUnread()
})
</script>

<style scoped>
.submission-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.submission-heading h1 {
  margin: 0 0 4px;
  font-size: 20px;
}

.submission-heading p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}
</style>
