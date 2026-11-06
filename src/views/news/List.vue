<template>
  <div class="list-container">
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

      <el-form-item label="发布状态">
        <el-select v-model="queryForm.publishStatus" placeholder="全部" clearable style="width: 130px">
          <el-option label="未发布" :value="0" />
          <el-option label="已发布" :value="1" />
          <el-option label="已下线" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary">查询</el-button>
        <el-button @click="add()" type="primary">新增</el-button>
        <el-button @click="openHot()" type="warning" plain>热点资讯</el-button>
        <el-button @click="confirmDel()" type="danger">批量删除</el-button>
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
      <el-table-column header-align="center" align="center" prop="viewCount" label="阅读量" width="90" />
      <el-table-column header-align="center" align="center" label="创建时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column header-align="center" align="center" label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="update(scope.row)">编辑</el-button>
          <el-button type="success" size="small" @click="openDetail(scope.row)">详情</el-button>
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

    <!-- ================= 新增 / 编辑弹窗 ================= -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑资讯' : '新增资讯'" width="720px" top="6vh">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入资讯标题" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="列表页展示的一句话简介" />
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
            placeholder="输入后回车可新建标签"
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit()">保存</el-button>
      </template>
    </el-dialog>

    <!-- ================= 详情弹窗 ================= -->
    <el-dialog v-model="detailVisible" title="资讯详情" width="680px" top="8vh">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="标题" :span="2">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ categoryName(detail.categoryId) }}</el-descriptions-item>
        <el-descriptions-item label="阅读量">{{ detail.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ auditText(detail.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ publishText(detail.publishStatus) }}</el-descriptions-item>
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

    <!-- ================= 热点资讯弹窗（Redis 缓存） ================= -->
    <el-dialog v-model="hotVisible" title="热点资讯 Top10（走 Redis 缓存）" width="700px">
      <el-alert
        type="success"
        :closable="false"
        show-icon
        title="本列表由后端从 Redis 读取，缓存键 news:hot:top10，有效期 5 分钟。"
        style="margin-bottom: 12px"
      />
      <el-table :data="hotList" border stripe v-loading="hotLoading" size="small">
        <el-table-column header-align="center" align="center" prop="id" label="ID" width="70" />
        <el-table-column header-align="center" align="center" prop="title" label="标题" show-overflow-tooltip />
        <el-table-column header-align="center" align="center" prop="viewCount" label="阅读量" width="100" />
        <el-table-column header-align="center" align="center" label="耗时" width="100">
          <template #default>
            <el-tag size="small" type="warning">{{ hotCost }} ms</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { newsApi } from '@/api/news-api'
import { categoryApi } from '@/api/category-api'
import { tagApi } from '@/api/tag-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const multipleSelection = ref<any[]>([])

const categoryOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

const queryFormState = {
  title: '',
  categoryId: null,
  auditStatus: null,
  publishStatus: null,
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive<any>({ ...queryFormState })

// ---------- 新增 / 编辑 ----------
const dialogVisible = ref(false)
const submitLoading = ref(false)
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

// ---------- 详情 ----------
const detailVisible = ref(false)
const detail = ref<any>(null)

// ---------- 热点 ----------
const hotVisible = ref(false)
const hotLoading = ref(false)
const hotList = ref<any[]>([])
const hotCost = ref(0)

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
    if (queryForm.publishStatus !== null && queryForm.publishStatus !== '')
      params.publishStatus = queryForm.publishStatus

    const res: any = await newsApi.queryPageList(params, queryForm.pagenum, queryForm.pagesize)
    datalist.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    listLoading.value = false
  }
}

/** 分类下拉（表格里把 categoryId 翻译成中文名要用） */
async function loadCategories() {
  try {
    const res: any = await categoryApi.all()
    categoryOptions.value = res.data || []
  } catch (e) {
    categoryOptions.value = []
  }
}

/** 标签下拉（新增时可选已有标签，也可以输入新的） */
async function loadTags() {
  try {
    const res: any = await tagApi.queryPageList({}, 1, 100)
    tagOptions.value = res.data.list || []
  } catch (e) {
    tagOptions.value = []
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

// ================= 新增 / 编辑 =================
function resetForm() {
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

/** 列表不返回正文和标签，所以编辑前要先查一次详情 */
async function update(row: any) {
  resetForm()
  try {
    const res: any = await newsApi.detail(row.id)
    const d = res.data
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
  }
}

async function submit() {
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
      await newsApi.update(form)
      ElMessage.success('修改成功')
    } else {
      await newsApi.add(form)
      ElMessage.success('新增成功')
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

// ================= 热点（Redis） =================
async function openHot() {
  hotVisible.value = true
  hotLoading.value = true
  const start = performance.now()
  try {
    const res: any = await newsApi.hot()
    hotList.value = res.data || []
  } catch (err) {
    hotList.value = []
  } finally {
    hotCost.value = Math.round(performance.now() - start)
    hotLoading.value = false
  }
}

// ================= 删除 =================
function confirmDel(id?: any) {
  ElMessageBox.confirm('是否确认删除?', '确认删除', {
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
    await newsApi.delete(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (err) {
  } finally {
    listLoading.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await getList()
  loadTags()
})
</script>
