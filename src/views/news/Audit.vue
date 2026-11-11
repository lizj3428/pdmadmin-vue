<template>
  <div class="list-container">
    <header class="audit-heading">
      <h1>资讯审核</h1>
      <p>默认显示待审核资讯。打开详情，核对正文、分类和标签后再处理。</p>
    </header>
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="通过后会发布资讯并触发自动推送；驳回意见会保留给投稿人查看。"
      style="margin-bottom: 12px"
    />

    <!-- 教师身份专用提示：本人投稿在下面列表里已被过滤掉 -->
    <el-alert
      v-if="adminStore.identity === 'teacher'"
      type="warning"
      :closable="false"
      show-icon
      title="当前是教师账号，审批列表已自动隐藏您本人提交的资讯，避免自己审自己的稿。"
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
      </el-form-item>
    </el-form>

    <div class="audit-batch">
      <span>已选 {{ multipleSelection.length }} 条</span>
      <div class="audit-batch__actions">
        <el-button
          type="success"
          plain
          :disabled="!multipleSelection.length || listLoading || auditSubmitting"
          @click="batchAudit(1)"
        >批量通过</el-button>
        <el-button
          type="danger"
          plain
          :disabled="!multipleSelection.length || listLoading || auditSubmitting"
          @click="batchAudit(2)"
        >批量驳回</el-button>
      </div>
    </div>

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

      <el-table-column header-align="center" align="center" label="操作" width="126" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            plain
            size="small"
            :loading="detailLoadingId === scope.row.id"
            :disabled="auditSubmitting || (detailLoadingId !== null && detailLoadingId !== scope.row.id)"
            @click="openDetail(scope.row)"
          >查看详情</el-button>
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
    <el-dialog
      v-model="detailVisible"
      title="资讯审核详情"
      width="min(720px, 94vw)"
      top="8vh"
      :close-on-click-modal="!auditSubmitting"
      :close-on-press-escape="!auditSubmitting"
      :show-close="!auditSubmitting"
    >
      <div v-if="detail" class="audit-preview" tabindex="0" role="region" aria-label="资讯内容">
        <el-descriptions :column="2" border>
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
        </el-descriptions>
        <section class="audit-body" aria-label="资讯正文">
          <h2>正文</h2>
          <div class="audit-body__content">{{ detail.content || '暂无正文' }}</div>
        </section>
      </div>
      <template #footer>
        <el-button :disabled="auditSubmitting" @click="detailVisible = false">关闭</el-button>
        <el-button type="danger" plain :disabled="!detail || auditSubmitting" @click="doReject(detail)">
          驳回
        </el-button>
        <el-button type="primary" :disabled="!detail || auditSubmitting" @click="doPass(detail)">
          通过并发布
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { newsApi } from '@/api/news-api'
import { categoryApi } from '@/api/category-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

/** 这条稿子是不是「教师本人」投的？管理员账号不参与过滤 */
function isOwnDraft(row: any) {
  return (
    adminStore.identity === 'teacher' &&
    row.authorType === 2 &&
    String(row.authorId) === String(adminStore.admin.id)
  )
}

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const multipleSelection = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const detailVisible = ref(false)
const detail = ref<any>(null)
const detailLoadingId = ref<number | string | null>(null)
const auditSubmitting = ref(false)

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
    const pageList: any[] = res.data.list || []
    // 教师身份下剔除本人投稿，剩下的才是可审批的
    const visible = pageList.filter((r) => !isOwnDraft(r))
    datalist.value = visible
    // 后端 total 含本人投稿，这里按本页被剔除的条数扣减，让分页数字和看到的列表对得上
    total.value = Math.max(0, res.data.total - (pageList.length - visible.length))
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
  if (auditSubmitting.value || !row) return
  ElMessageBox.confirm(`确认通过《${row.title}》？通过后将立即发布，并触发自动推送。`, '审核通过', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
    .then(async () => {
      auditSubmitting.value = true
      try {
        await newsApi.audit(row.id, 1, '审核通过')
        ElMessage.success('资讯已发布')
        detailVisible.value = false
        getList()
      } catch (err) {
        console.error(err)
      } finally {
        auditSubmitting.value = false
      }
    })
    .catch(() => {})
}

function doReject(row: any) {
  if (auditSubmitting.value || !row) return
  ElMessageBox.prompt('请输入驳回意见，会记录在资讯上供作者查看', '驳回资讯', {
    confirmButtonText: '确定驳回',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：内容不完整，请补充来源',
    inputValidator: (v: string) => (v && v.trim() ? true : '驳回意见不能为空'),
  })
    .then(async ({ value }) => {
      auditSubmitting.value = true
      try {
        await newsApi.audit(row.id, 2, value)
        ElMessage.success('已驳回')
        detailVisible.value = false
        getList()
      } catch (err) {
        console.error(err)
      } finally {
        auditSubmitting.value = false
      }
    })
    .catch(() => {})
}

/** 批量审核：后端没有批量接口，这里逐条调用，把成功和失败分开计数 */
async function batchAudit(status: number) {
  if (listLoading.value || auditSubmitting.value) return
  const rows = multipleSelection.value
  if (rows.length === 0) {
    ElMessage.warning('请先勾选要审核的资讯')
    return
  }
  const action = status === 1 ? '通过并发布' : '驳回'
  const note = status === 1 ? '发布后将触发自动推送。' : ''
  try {
    await ElMessageBox.confirm(`确认批量${action}选中的 ${rows.length} 条资讯？${note}`, '批量审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
    })
  } catch {
    return
  }

  auditSubmitting.value = true
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
  auditSubmitting.value = false
  if (fail === 0) {
    ElMessage.success(`已处理 ${ok} 条`)
  } else {
    ElMessage.warning(`成功 ${ok} 条，失败 ${fail} 条`)
  }
  getList()
}

// ================= 详情 =================
async function openDetail(row: any) {
  if (detailLoadingId.value !== null || auditSubmitting.value) return
  detailLoadingId.value = row.id
  try {
    const res: any = await newsApi.detail(row.id)
    detail.value = res.data
    detailVisible.value = true
  } catch (err) {
    console.error(err)
  } finally {
    detailLoadingId.value = null
  }
}

onMounted(async () => {
  await loadCategories()
  getList()
})
</script>

<style scoped lang="less">
.audit-heading {
  margin-bottom: 16px;

  h1 {
    margin-bottom: 4px;
    color: #1e293b;
    font-size: 20px;
  }

  p {
    color: #64748b;
    font-size: 14px;
  }
}

.audit-batch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  color: #475569;
  font-size: 14px;
}

.audit-preview {
  max-height: min(56vh, 520px);
  overflow: auto;
  overflow-wrap: anywhere;
}

.audit-body {
  margin-top: 16px;

  h2 {
    margin-bottom: 8px;
    color: #334155;
    font-size: 15px;
  }

  &__content {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    color: #334155;
    line-height: 1.75;
    white-space: pre-wrap;
  }
}
</style>
