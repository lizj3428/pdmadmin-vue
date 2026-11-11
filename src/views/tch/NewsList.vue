<template>
  <div class="list-container">
    <header class="submission-heading">
      <div>
        <h1>我的投稿</h1>
        <p>投稿通过审核后才会发布。被驳回的稿件可根据审核意见修改后重提。</p>
      </div>
      <el-button type="primary" :disabled="editLoadingId !== null" @click="add">写新投稿</el-button>
    </header>

    <el-form :inline="true">
      <el-form-item label="标题">
        <el-input v-model="queryForm.title" placeholder="请输入标题关键字" clearable style="width: 200px" />
      </el-form-item>

      <el-form-item label="审核状态">
        <el-select v-model="queryForm.auditStatus" placeholder="全部" clearable style="width: 130px">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
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
    >
      <el-table-column header-align="center" align="center" prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="220">
        <template #default="scope">
          <span class="submission-title">{{ scope.row.title }}</span>
          <p v-if="scope.row.auditStatus === 2" class="submission-reason">
            驳回原因：{{ scope.row.auditOpinion || '未填写审核意见' }}
          </p>
        </template>
      </el-table-column>
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
      <el-table-column header-align="center" align="center" label="审核状态" width="110">
        <template #default="scope">
          <el-tag :type="auditTagType(scope.row.auditStatus)" size="small">
            {{ auditText(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="提交时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column header-align="center" align="center" label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.auditStatus !== 1"
            type="primary"
            link
            size="small"
            :loading="editLoadingId === scope.row.id"
            :disabled="editLoadingId !== null && editLoadingId !== scope.row.id"
            @click="edit(scope.row)"
          >
            {{ scope.row.auditStatus === 2 ? '修改后重提' : '编辑' }}
          </el-button>
          <el-button link size="small" :disabled="editLoadingId !== null" @click="openDetail(scope.row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="handleCurrentPageChange"
      background
      layout="total, prev, pager, next"
      :total="total"
      :current-page="queryForm.pagenum"
      :page-size="queryForm.pagesize"
      style="justify-content: flex-end; margin-top: 12px"
    />

    <!-- ================= 新增 / 编辑弹窗 ================= -->
    <el-dialog
      v-model="dialogVisible"
      :title="editorTitle"
      width="min(720px, 94vw)"
      top="6vh"
      :close-on-click-modal="!submitLoading"
      :close-on-press-escape="!submitLoading"
      :show-close="!submitLoading"
    >
      <el-alert
        v-if="isResubmitting"
        type="warning"
        :closable="false"
        show-icon
        :title="'原驳回原因：' + (previousAuditOpinion || '未填写审核意见')"
        description="修改后重新提交，稿件会回到待审核状态。"
        style="margin-bottom: 12px"
      />

      <el-form :model="form" label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入资讯标题" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="列表页展示的一句话简介，也会作为推送给学生的消息内容" />
        </el-form-item>

        <el-form-item label="正文">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入正文内容" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="所属分类" required>
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要程度">
              <el-select v-model="form.level" style="width: 100%">
                <el-option label="普通" :value="1" />
                <el-option label="重要" :value="2" />
                <el-option label="紧急" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签">
          <el-select
            v-model="form.tagNames"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入后回车可新建标签。标签决定这条资讯推送给哪些订阅了它的学生"
            style="width: 100%"
          >
            <el-option v-for="t in tagOptions" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="封面图">
          <el-input v-model="form.coverUrl" placeholder="图片地址，选填" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="submitLoading" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit">
          {{ isResubmitting ? '重新提交' : '提交审核' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ================= 详情弹窗 ================= -->
    <el-dialog v-model="detailVisible" title="投稿详情" width="680px" top="8vh">
      <el-alert
        v-if="detail && detail.auditStatus === 2 && detail.auditOpinion"
        type="error"
        :closable="false"
        show-icon
        :title="'审核意见：' + detail.auditOpinion"
        style="margin-bottom: 12px"
      />

      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="标题" :span="2">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryName(detail.categoryId) }}</el-descriptions-item>
        <el-descriptions-item label="重要程度">{{ levelText(detail.level) }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="auditTagType(detail.auditStatus)" size="small">
            {{ auditText(detail.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatTime(detail.publishTime) || '未发布' }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <el-tag v-for="t in detail.tagNames || []" :key="t" size="small" style="margin-right: 6px">
            {{ t }}
          </el-tag>
          <span v-if="!detail.tagNames || detail.tagNames.length === 0" style="color: #999">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ detail.summary || '无' }}</el-descriptions-item>
        <el-descriptions-item label="正文" :span="2">
          <div style="white-space: pre-wrap">{{ detail.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { tchApi } from '@/api/tch-api'
import Constants from '@/utils/constants'
import { ElMessage } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)

const categoryOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

const queryFormState = {
  title: '',
  auditStatus: null as any,
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive<any>({ ...queryFormState })

const dialogVisible = ref(false)
const submitLoading = ref(false)
const editLoadingId = ref<number | string | null>(null)
const previousAuditStatus = ref<number | null>(null)
const previousAuditOpinion = ref('')
const isResubmitting = computed(() => previousAuditStatus.value === 2)
const editorTitle = computed(() => {
  if (isResubmitting.value) return '修改后重提'
  return form.id ? '编辑投稿' : '写新投稿'
})
const form = reactive<any>({
  id: null,
  title: '',
  summary: '',
  content: '',
  categoryId: null,
  level: 1,
  coverUrl: '',
  tagNames: [],
})

const detailVisible = ref(false)
const detail = ref<any>(null)

// ================= 辅助显示 =================
function formatTime(v: any) {
  if (!v) return ''
  return String(v).replace('T', ' ')
}

function categoryName(id: any) {
  const hit = categoryOptions.value.find((c) => c.id === id)
  return hit ? hit.name : (id ?? '')
}

function levelText(v: any) {
  return ({ 1: '普通', 2: '重要', 3: '紧急' } as any)[v] || '普通'
}
function levelTagType(v: any) {
  return ({ 1: 'info', 2: 'warning', 3: 'danger' } as any)[v] || 'info'
}

function auditText(v: any) {
  return ({ 0: '待审核', 1: '已通过', 2: '已驳回' } as any)[v] || '未知'
}
function auditTagType(v: any) {
  return ({ 0: 'warning', 1: 'success', 2: 'danger' } as any)[v] || 'info'
}

// ================= 数据加载 =================
async function getList() {
  try {
    listLoading.value = true
    const params: any = {}
    if (queryForm.title) params.title = queryForm.title
    if (queryForm.auditStatus !== null && queryForm.auditStatus !== '') params.auditStatus = queryForm.auditStatus

    const res: any = await tchApi.myList(params, queryForm.pagenum, queryForm.pagesize)
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
    const res: any = await tchApi.categories()
    categoryOptions.value = res.data || []
  } catch (e) {
    categoryOptions.value = []
  }
}

async function loadTags() {
  try {
    const res: any = await tchApi.tags()
    tagOptions.value = res.data || []
  } catch (e) {
    tagOptions.value = []
  }
}

function onSearch() {
  queryForm.pagenum = 1
  getList()
}

function resetQuery() {
  Object.assign(queryForm, queryFormState)
  getList()
}

function handleCurrentPageChange(val: number) {
  if (queryForm.pagenum === val) return
  queryForm.pagenum = val
  getList()
}

// ================= 新增 / 编辑 =================
function resetForm() {
  previousAuditStatus.value = null
  previousAuditOpinion.value = ''
  form.id = null
  form.title = ''
  form.summary = ''
  form.content = ''
  form.categoryId = categoryOptions.value.length > 0 ? categoryOptions.value[0].id : null
  form.level = 1
  form.coverUrl = ''
  form.tagNames = []
}

function add() {
  resetForm()
  dialogVisible.value = true
}

/** 列表不返回正文和标签，编辑前必须先查详情，否则保存会把正文清空 */
async function edit(row: any) {
  if (editLoadingId.value !== null) return
  editLoadingId.value = row.id
  resetForm()
  try {
    const res: any = await tchApi.detail(row.id)
    const d = res.data
    if (d.auditStatus === 1) {
      ElMessage.warning('该稿件已通过审核，不能修改')
      getList()
      return
    }
    previousAuditStatus.value = d.auditStatus
    previousAuditOpinion.value = d.auditOpinion || ''
    form.id = d.id
    form.title = d.title
    form.summary = d.summary
    form.content = d.content
    form.categoryId = d.categoryId
    form.level = d.level
    form.coverUrl = d.coverUrl
    form.tagNames = d.tagNames || []
    dialogVisible.value = true
  } catch (err) {
    console.error(err)
  } finally {
    editLoadingId.value = null
  }
}

async function submit() {
  if (submitLoading.value) return
  if (!form.title) {
    ElMessage.warning('请填写标题')
    return
  }
  if (!form.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  try {
    submitLoading.value = true
    if (form.id) {
      await tchApi.update(form)
      ElMessage.success('已提交，等待管理员重新审核')
    } else {
      await tchApi.add(form)
      ElMessage.success('投稿成功，等待管理员审核')
    }
    dialogVisible.value = false
    getList()
    loadTags()
  } catch (err) {
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

async function openDetail(row: any) {
  try {
    const res: any = await tchApi.detail(row.id)
    detail.value = res.data
    detailVisible.value = true
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await loadCategories()
  await getList()
  loadTags()
})
</script>

<style scoped lang="less">
.submission-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;

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

.submission-title {
  color: #1e293b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.submission-reason {
  margin-top: 4px;
  color: #991b1b;
  font-size: 13px;
  overflow-wrap: anywhere;
}
</style>
