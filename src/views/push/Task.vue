<template>
  <div class="list-container">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="推送是「尽力而为」语义：逐个学生写站内信 + 推送记录，某个学生失败不会回滚其他人。channel 选微信/企业微信时，因为没有对接真实渠道，会如实记为失败。"
      style="margin-bottom: 12px"
    />

    <el-form :inline="true">
      <el-form-item label="任务名称">
        <el-input v-model="queryForm.taskName" placeholder="支持模糊搜索" clearable style="width: 180px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="待执行" :value="0" />
          <el-option label="执行中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="失败" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="推送方式">
        <el-select v-model="queryForm.pushType" placeholder="全部" clearable style="width: 110px">
          <el-option label="立即" :value="1" />
          <el-option label="定时" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary">查询</el-button>
        <el-button @click="add()" type="primary">新建任务</el-button>
        <el-button @click="confirmDel()" type="danger">批量删除</el-button>
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column header-align="center" align="center" prop="id" label="ID" width="70" />
      <el-table-column header-align="center" align="center" prop="taskName" label="任务名称" show-overflow-tooltip min-width="170" />
      <el-table-column header-align="center" align="center" label="关联资讯" show-overflow-tooltip min-width="150">
        <template #default="scope">
          {{ newsTitle(scope.row.newsId) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="目标人群" width="150">
        <template #default="scope">
          {{ targetText(scope.row.targetType, scope.row.targetValue) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="渠道" width="90">
        <template #default="scope">
          {{ channelText(scope.row.channel) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="方式" width="80">
        <template #default="scope">
          <el-tag size="small" :type="scope.row.pushType === 1 ? 'primary' : 'warning'">
            {{ scope.row.pushType === 1 ? '立即' : '定时' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="计划时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.planTime) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="状态" width="95">
        <template #default="scope">
          <el-tag size="small" :type="statusTagType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="targetCount" label="目标人数" width="95" />
      <el-table-column header-align="center" align="center" label="操作" width="230" fixed="right">
        <template #default="scope">
          <el-button type="success" size="small" @click="run(scope.row)">执行</el-button>
          <el-button type="primary" size="small" @click="gotoRecords(scope.row)">记录</el-button>
          <el-button type="danger" size="small" @click="confirmDel(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="handleCurrentPageChange"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="queryForm.pagesize"
      style="justify-content: flex-end; margin-top: 12px"
    />

    <!-- ============ 新建任务弹窗 ============ -->
    <el-dialog v-model="dialogVisible" title="新建推送任务" width="700px" top="6vh">
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务名称" required>
          <el-input v-model="form.taskName" placeholder="例如：考研资讯推送" />
        </el-form-item>

        <el-form-item label="关联资讯" required>
          <el-select v-model="form.newsId" placeholder="请选择要推送的资讯" filterable style="width: 100%">
            <el-option v-for="n in newsOptions" :key="n.id" :label="n.title" :value="n.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标人群" required>
          <el-radio-group v-model="form.targetType" @change="onTargetTypeChange">
            <el-radio :value="1">全部学生</el-radio>
            <el-radio :value="2">按年级</el-radio>
            <el-radio :value="3">按专业</el-radio>
            <el-radio :value="4">按标签</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 年级 -->
        <el-form-item v-if="form.targetType === 2" label="年级">
          <el-select
            v-model="form.gradeValues"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入年级后回车，如 2023"
            style="width: 100%"
          >
            <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>

        <!-- 专业 -->
        <el-form-item v-if="form.targetType === 3" label="专业">
          <el-select
            v-model="form.majorValues"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入专业后回车，如 软件工程"
            style="width: 100%"
          >
            <el-option v-for="m in majorOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>

        <!-- 标签 -->
        <el-form-item v-if="form.targetType === 4" label="订阅标签">
          <el-select v-model="form.tagIds" multiple placeholder="选标签，会推给订阅了这些标签的学生" style="width: 100%">
            <el-option v-for="t in tagOptions" :key="t.id" :label="`${t.name}（${t.useCount || 0} 条资讯）`" :value="t.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="推送渠道">
          <el-radio-group v-model="form.channel">
            <el-radio :value="1">站内信</el-radio>
            <el-radio :value="2">微信</el-radio>
            <el-radio :value="3">企业微信</el-radio>
          </el-radio-group>
          <div v-if="form.channel !== 1" style="color: #e6a23c; font-size: 12px; line-height: 1.6">
            该渠道未对接真实服务，执行时会如实记为「渠道未接入」，不会假装发送成功。
          </div>
        </el-form-item>

        <el-form-item label="推送方式">
          <el-radio-group v-model="form.pushType">
            <el-radio :value="1">立即执行</el-radio>
            <el-radio :value="2">定时执行</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.pushType === 2" label="计划时间" required>
          <el-date-picker
            v-model="form.planTime"
            type="datetime"
            placeholder="选择推送时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="目标人数">
          <el-button @click="preview()" :loading="previewLoading" plain type="primary">预估人数</el-button>
          <span v-if="previewCount !== null" style="margin-left: 12px; font-size: 15px">
            预计推送给 <b style="color: #409eff; font-size: 18px">{{ previewCount }}</b> 人
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit()">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pushApi } from '@/api/push-api'
import { newsApi } from '@/api/news-api'
import { tagApi } from '@/api/tag-api'
import { studentApi } from '@/api/student-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const multipleSelection = ref<any[]>([])

const newsOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])
const gradeOptions = ref<string[]>([])
const majorOptions = ref<string[]>([])

const queryFormState = {
  taskName: '',
  status: null as any,
  pushType: null as any,
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive<any>({ ...queryFormState })

const dialogVisible = ref(false)
const submitLoading = ref(false)
const previewLoading = ref(false)
const previewCount = ref<number | null>(null)

const form = reactive<any>({
  taskName: '',
  newsId: null,
  targetType: 1,
  gradeValues: [],
  majorValues: [],
  tagIds: [],
  channel: 1,
  pushType: 1,
  planTime: null,
})

// ================= 显示转换 =================
function formatTime(v: any) {
  if (!v) return '—'
  return String(v).replace('T', ' ')
}

function newsTitle(id: any) {
  const hit = newsOptions.value.find((n) => n.id === id)
  return hit ? hit.title : `资讯 #${id}`
}

function channelText(v: any) {
  return { 1: '站内信', 2: '微信', 3: '企业微信' }[v as number] || '—'
}

function statusText(v: any) {
  return { 0: '待执行', 1: '执行中', 2: '已完成', 3: '失败' }[v as number] || '未知'
}
function statusTagType(v: any) {
  return ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' } as any)[v] || 'info'
}

/** 目标人群的文字描述，把 targetValue 翻成人能看懂的 */
function targetText(type: any, value: any) {
  if (type === 1) return '全部学生'
  if (type === 2) return `年级：${value || '—'}`
  if (type === 3) return `专业：${value || '—'}`
  if (type === 4) {
    if (!value) return '标签：—'
    const names = String(value)
      .split(',')
      .map((id) => {
        const hit = tagOptions.value.find((t) => String(t.id) === id.trim())
        return hit ? hit.name : id
      })
      .join('、')
    return `标签：${names}`
  }
  return '—'
}

/** 把表单里的多选值拼成后端要的逗号分隔字符串 */
function buildTargetValue() {
  if (form.targetType === 1) return null
  if (form.targetType === 2) return form.gradeValues.join(',')
  if (form.targetType === 3) return form.majorValues.join(',')
  if (form.targetType === 4) return form.tagIds.join(',')
  return null
}

// ================= 列表 =================
async function getList() {
  try {
    listLoading.value = true
    const params: any = {}
    if (queryForm.taskName) params.taskName = queryForm.taskName
    if (queryForm.status !== null && queryForm.status !== '') params.status = queryForm.status
    if (queryForm.pushType !== null && queryForm.pushType !== '') params.pushType = queryForm.pushType

    const res: any = await pushApi.queryPageList(params, queryForm.pagenum, queryForm.pagesize)
    datalist.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    listLoading.value = false
  }
}

/** 关联资讯下拉：取前 100 条，避免只显示第一页 */
async function loadNewsOptions() {
  try {
    const res: any = await newsApi.queryPageList({}, 1, 100)
    newsOptions.value = res.data.list || []
  } catch (e) {
    newsOptions.value = []
  }
}

async function loadTagOptions() {
  try {
    const res: any = await tagApi.queryPageList({}, 1, 100)
    tagOptions.value = res.data.list || []
  } catch (e) {
    tagOptions.value = []
  }
}

/** 年级/专业的候选值直接从学生表里提取，省得手打错字 */
async function loadStudentOptions() {
  try {
    const res: any = await studentApi.queryPageList({}, 1, 500)
    const list = res.data.list || []
    gradeOptions.value = [...new Set(list.map((s: any) => s.grade).filter(Boolean))] as string[]
    majorOptions.value = [...new Set(list.map((s: any) => s.major).filter(Boolean))] as string[]
  } catch (e) {
    gradeOptions.value = []
    majorOptions.value = []
  }
}

function onSearch() {
  queryForm.pagenum = 1
  getList()
}

function handleCurrentPageChange(val: number) {
  queryForm.pagenum = val
  getList()
}

function handleSelectionChange(val: any[]) {
  multipleSelection.value = val
}

// ================= 新建 =================
function resetForm() {
  form.taskName = ''
  form.newsId = null
  form.targetType = 1
  form.gradeValues = []
  form.majorValues = []
  form.tagIds = []
  form.channel = 1
  form.pushType = 1
  form.planTime = null
  previewCount.value = null
}

function add() {
  resetForm()
  dialogVisible.value = true
}

function onTargetTypeChange() {
  previewCount.value = null
}

async function preview() {
  const targetValue = buildTargetValue()
  if (form.targetType !== 1 && !targetValue) {
    ElMessage.warning('请先选择目标人群的具体取值')
    return
  }
  try {
    previewLoading.value = true
    const res: any = await pushApi.preview(form.targetType, targetValue || undefined)
    previewCount.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    previewLoading.value = false
  }
}

async function submit() {
  if (!form.taskName) {
    ElMessage.warning('请填写任务名称')
    return
  }
  if (!form.newsId) {
    ElMessage.warning('请选择关联资讯')
    return
  }
  const targetValue = buildTargetValue()
  if (form.targetType !== 1 && !targetValue) {
    ElMessage.warning('请选择目标人群的具体取值')
    return
  }
  if (form.pushType === 2 && !form.planTime) {
    ElMessage.warning('定时推送必须选择计划时间')
    return
  }

  const payload: any = {
    taskName: form.taskName,
    newsId: form.newsId,
    targetType: form.targetType,
    targetValue: targetValue,
    channel: form.channel,
    pushType: form.pushType,
  }
  if (form.pushType === 2) {
    payload.planTime = form.planTime
  }

  try {
    submitLoading.value = true
    await pushApi.add(payload)
    ElMessage.success(form.pushType === 1 ? '任务已创建并执行' : '定时任务已创建')
    dialogVisible.value = false
    getList()
  } catch (err) {
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

// ================= 执行 / 记录 / 删除 =================
async function run(row: any) {
  try {
    await ElMessageBox.confirm(`确认立即执行任务「${row.taskName}」?`, '执行确认', {
      confirmButtonText: '执行',
      cancelButtonText: '取消',
      type: 'warning',
    })
    listLoading.value = true
    await pushApi.run(row.id)
    ElMessage.success('执行完成')
    getList()
  } catch (err: any) {
    if (err !== 'cancel') console.error(err)
  } finally {
    listLoading.value = false
  }
}

function gotoRecords(row: any) {
  router.push({ name: 'PushRecord', query: { taskId: row.id } })
}

function confirmDel(id?: any) {
  ElMessageBox.confirm('删除任务会连带删除它的推送记录，是否继续?', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
    .then(() => {
      del(id)
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消删除' })
    })
}

async function del(id?: any) {
  try {
    listLoading.value = true
    const ids = id ? [id] : multipleSelection.value.map((item) => item.id)
    if (ids.length === 0) {
      ElMessage.warning('请选择要删除的数据')
      return
    }
    await pushApi.delete(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (err) {
  } finally {
    listLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadNewsOptions(), loadTagOptions(), loadStudentOptions()])
  await getList()
})
</script>
