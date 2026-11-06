<template>
  <div class="list-container">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="审核通过后资讯会自动发布；驳回会记录审核意见并保持未发布状态。"
      style="margin-bottom: 12px"
    />

    <!-- 搜索表单区域 -->
    <el-form :inline="true">
      <el-form-item label="标题">
        <el-input v-model="queryForm.title" placeholder="请输入标题关键字" clearable />
      </el-form-item>

      <el-form-item label="分类">
        <el-select v-model="queryForm.categoryId" placeholder="全部" clearable style="width: 150px">
          <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="审核状态">
        <el-select v-model="queryForm.auditStatus" placeholder="全部" clearable style="width: 130px">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearch()">查询</el-button>
        <el-button @click="resetQuery()">重置</el-button>
        <el-button type="success" plain @click="batchAudit(1)">批量通过</el-button>
        <el-button type="danger" plain @click="batchAudit(2)">批量驳回</el-button>
      </el-form-item>
    </el-form>

    <el-divider border-style="dashed" />

    <!-- 数据表格 -->
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
      <el-table-column header-align="center" align="center" prop="title" label="标题" show-overflow-tooltip min-width="180" />
      <el-table-column header-align="center" align="center" label="分类" width="120">
        <template #default="scope">
          {{ categoryName(scope.row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="重要程度" width="100">
        <template #default="scope">
          <el-tag :type="levelTagType(scope.row.level)" size="small">
            {{ levelText(scope.row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="审核状态" width="100">
        <template #default="scope">
          <el-tag :type="auditTagType(scope.row.auditStatus)" size="small">
            {{ auditText(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="发布状态" width="100">
        <template #default="scope">
          <el-tag :type="publishTagType(scope.row.publishStatus)" size="small">
            {{ publishText(scope.row.publishStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="auditOpinion" label="审核意见" show-overflow-tooltip min-width="140">
        <template #default="scope">
          <span :style="{ color: scope.row.auditOpinion ? '#303133' : '#c0c4cc' }">
            {{ scope.row.auditOpinion || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="提交时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column header-align="center" align="center" label="操作" width="210" fixed="right">
        <template #default="scope">
          <el-button type="success" size="small" @click="doPass(scope.row)">通过</el-button>
          <el-button type="danger" size="small" @click="doReject(scope.row)">驳回</el-button>
          <el-button type="primary" size="small" @click="openDetail(scope.row)">详情</el-button>
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

    <!-- ================= 详情弹窗 ================= -->
    <el-dialog v-model="detailVisible" title="资讯详情" width="680px" top="8vh">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="标题" :span="2">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryName(detail.categoryId) }}</el-descriptions-item>
        <el-descriptions-item label="重要程度">{{ levelText(detail.level) }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ auditText(detail.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ publishText(detail.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <el-tag v-for="t in detail.tagNames || []" :key="t" size="small" style="margin-right: 6px">
            {{ t }}
          </el-tag>
          <span v-if="!detail.tagNames || detail.tagNames.length === 0" style="color: #999">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ detail.auditOpinion || '无' }}</el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ detail.summary || '无' }}</el-descriptions-item>
        <el-descriptions-item label="正文" :span="2">
          <div style="white-space: pre-wrap">{{ detail.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { newsApi } from '@/api/news-api'
import { categoryApi } from '@/api/category-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const multipleSelection = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const detailVisible = ref(false)
const detail = ref<any>(null)

const queryFormState = {
  title: '',
  categoryId: null,
  auditStatus: 0, // 默认只看待审核，进来就能干活
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive<any>({ ...queryFormState })

// ================= 辅助显示 =================
function formatTime(v: any) {
  if (!v) return ''
  return String(v).replace('T', ' ')
}

function categoryName(id: any) {
  const hit = categoryOptions.value.find((c) => c.id === id)
  return hit ? hit.name : id ?? ''
}

function levelText(v: any) {
  return { 1: '普通', 2: '重要', 3: '紧急' }[v as number] || '普通'
}
function levelTagType(v: any) {
  return ({ 1: 'info', 2: 'warning', 3: 'danger' } as any)[v] || 'info'
}

function auditText(v: any) {
  return { 0: '待审核', 1: '已通过', 2: '已驳回' }[v as number] || '未知'
}
function auditTagType(v: any) {
  return ({ 0: 'warning', 1: 'success', 2: 'danger' } as any)[v] || 'info'
}

function publishText(v: any) {
  return { 0: '未发布', 1: '已发布', 2: '已下线' }[v as number] || '未知'
}
function publishTagType(v: any) {
  return ({ 0: 'info', 1: 'success', 2: 'danger' } as any)[v] || 'info'
}

// ================= 数据加载 =================
async function getList() {
  try {
    listLoading.value = true
    const params: any = {}
    if (queryForm.title) params.title = queryForm.title
    if (queryForm.categoryId !== null && queryForm.categoryId !== '') params.categoryId = queryForm.categoryId
    if (queryForm.auditStatus !== null && queryForm.auditStatus !== '') params.auditStatus = queryForm.auditStatus

    const res: any = await newsApi.queryPageList(params, queryForm.pagenum, queryForm.pagesize)
    datalist.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    listLoading.value = false
  }
}

async function loadCategories() {
  try {
    const res: any = await categoryApi.all()
    categoryOptions.value = res.data || []
  } catch (e) {
    categoryOptions.value = []
  }
}

function onSearch() {
  queryForm.pagenum = 1
  getList()
}

function resetQuery() {
  queryForm.title = ''
  queryForm.categoryId = null
  queryForm.auditStatus = 0
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

// ================= 审核 =================
function doPass(row: any) {
  ElMessageBox.confirm(`确认通过《${row.title}》？通过后会立即发布。`, '审核通过', {
    confirmButtonText: '确定通过',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
    .then(async () => {
      try {
        await newsApi.audit(row.id, 1, '审核通过')
        ElMessage.success('已通过并发布')
        getList()
      } catch (err) {
        console.error(err)
      }
    })
    .catch(() => {})
}

function doReject(row: any) {
  ElMessageBox.prompt('请输入驳回意见，会记录在资讯上供作者查看', '驳回资讯', {
    confirmButtonText: '确定驳回',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：内容不完整，请补充来源',
    inputValidator: (v: string) => (v && v.trim() ? true : '驳回意见不能为空'),
  })
    .then(async ({ value }) => {
      try {
        await newsApi.audit(row.id, 2, value)
        ElMessage.success('已驳回')
        getList()
      } catch (err) {
        console.error(err)
      }
    })
    .catch(() => {})
}

/** 批量审核：后端没有批量接口，这里逐条调用，把成功和失败分开计数 */
async function batchAudit(status: number) {
  const rows = multipleSelection.value
  if (rows.length === 0) {
    ElMessage.warning('请先勾选要审核的资讯')
    return
  }
  const action = status === 1 ? '通过并发布' : '驳回'
  try {
    await ElMessageBox.confirm(`确认批量${action}选中的 ${rows.length} 条资讯？`, '批量审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
    })
  } catch {
    return
  }

  listLoading.value = true
  let ok = 0
  let fail = 0
  for (const row of rows) {
    try {
      await newsApi.audit(row.id, status, status === 1 ? '批量审核通过' : '批量驳回')
      ok++
    } catch (e) {
      fail++
    }
  }
  listLoading.value = false
  if (fail === 0) {
    ElMessage.success(`已处理 ${ok} 条`)
  } else {
    ElMessage.warning(`成功 ${ok} 条，失败 ${fail} 条`)
  }
  getList()
}

// ================= 详情 =================
async function openDetail(row: any) {
  try {
    const res: any = await newsApi.detail(row.id)
    detail.value = res.data
    detailVisible.value = true
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await loadCategories()
  getList()
})
</script>
