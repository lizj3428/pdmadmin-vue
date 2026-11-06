<template>
  <div class="list-container">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="每条记录对应「一个学生 × 一次推送」。同一个任务里，某个学生失败不影响其他人 —— 这是推送的「尽力而为」语义。"
      style="margin-bottom: 12px"
    />

    <el-form :inline="true">
      <el-form-item label="推送任务">
        <el-select
          v-model="taskId"
          placeholder="请选择任务"
          filterable
          clearable
          style="width: 320px"
          @change="onTaskChange"
        >
          <el-option v-for="t in taskOptions" :key="t.id" :label="`#${t.id} ${t.taskName}`" :value="t.id" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="getList()" type="primary" :disabled="!taskId">刷新</el-button>
      </el-form-item>

      <el-form-item v-if="currentTask">
        <span style="color: #606266">
          状态：<el-tag size="small" :type="statusTagType(currentTask.status)">
            {{ statusText(currentTask.status) }}
          </el-tag>
          <span style="margin-left: 16px">目标人数：<b>{{ currentTask.targetCount }}</b></span>
        </span>
      </el-form-item>
    </el-form>

    <el-divider border-style="dashed" />

    <el-table
      border
      :data="datalist"
      v-loading="listLoading"
      stripe
      style="width: 100%"
      :header-cell-style="{ backgroundColor: '#f5f5f5' }"
      empty-text="请先选择一个推送任务"
    >
      <el-table-column header-align="center" align="center" prop="id" label="记录ID" width="90" />
      <el-table-column header-align="center" align="center" label="接收学生" width="200">
        <template #default="scope">
          {{ studentText(scope.row.studentId) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="渠道" width="110">
        <template #default="scope">
          {{ channelText(scope.row.channel) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="发送状态" width="120">
        <template #default="scope">
          <el-tag size="small" :type="sendTagType(scope.row.sendStatus)">
            {{ sendText(scope.row.sendStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="failReason" label="失败原因" show-overflow-tooltip min-width="150" />
      <el-table-column header-align="center" align="center" prop="retryCount" label="重试次数" width="100" />
      <el-table-column header-align="center" align="center" label="耗时" width="100">
        <template #default="scope">
          {{ scope.row.costMs != null ? scope.row.costMs + ' ms' : '—' }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="发送时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.sendTime) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="handleCurrentPageChange"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="pagesize"
      style="justify-content: flex-end; margin-top: 12px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { pushApi } from '@/api/push-api'
import { studentApi } from '@/api/student-api'
import Constants from '@/utils/constants'

const route = useRoute()

const taskOptions = ref<any[]>([])
const studentMap = ref<Record<string, any>>({})

const taskId = ref<any>(null)
const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const pagenum = ref(1)
const pagesize = ref(Constants.PAGE_SIZE)

const currentTask = computed(() => taskOptions.value.find((t) => t.id === taskId.value) || null)

// ================= 显示转换 =================
function formatTime(v: any) {
  if (!v) return '—'
  return String(v).replace('T', ' ')
}

function studentText(id: any) {
  const s = studentMap.value[String(id)]
  if (!s) return `学生 #${id}`
  return `${s.realName}（${s.studentNo}）`
}

function channelText(v: any) {
  return { 1: '站内信', 2: '微信', 3: '企业微信' }[v as number] || '—'
}

function sendText(v: any) {
  return { 0: '待发送', 1: '已提交', 2: '已送达', 3: '发送失败' }[v as number] || '未知'
}
function sendTagType(v: any) {
  return ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' } as any)[v] || 'info'
}

function statusText(v: any) {
  return { 0: '待执行', 1: '执行中', 2: '已完成', 3: '失败' }[v as number] || '未知'
}
function statusTagType(v: any) {
  return ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' } as any)[v] || 'info'
}

// ================= 数据加载 =================
async function loadTaskOptions() {
  try {
    const res: any = await pushApi.queryPageList({}, 1, 200)
    taskOptions.value = res.data.list || []
  } catch (e) {
    taskOptions.value = []
  }
}

/** 记录里只有 studentId，拉一份学生表做 id → 姓名 的映射 */
async function loadStudentMap() {
  try {
    const res: any = await studentApi.queryPageList({}, 1, 500)
    const map: Record<string, any> = {}
    ;(res.data.list || []).forEach((s: any) => {
      map[String(s.id)] = s
    })
    studentMap.value = map
  } catch (e) {
    studentMap.value = {}
  }
}

async function getList() {
  if (!taskId.value) {
    datalist.value = []
    total.value = 0
    return
  }
  try {
    listLoading.value = true
    const res: any = await pushApi.records(taskId.value, pagenum.value, pagesize.value)
    datalist.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    listLoading.value = false
  }
}

function onTaskChange() {
  pagenum.value = 1
  getList()
}

function handleCurrentPageChange(val: number) {
  pagenum.value = val
  getList()
}

/** 从任务页点「记录」跳过来时，地址上带着 ?taskId=，这里接住 */
function syncFromQuery() {
  const q = route.query.taskId
  if (q) {
    taskId.value = Number(q)
    pagenum.value = 1
    getList()
  }
}

watch(
  () => route.query.taskId,
  () => syncFromQuery(),
)

onMounted(async () => {
  await Promise.all([loadTaskOptions(), loadStudentMap()])
  syncFromQuery()
})
</script>
