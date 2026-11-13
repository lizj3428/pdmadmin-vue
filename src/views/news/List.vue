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
      <el-table-column header-align="center" align="center" prop="title" label="标题" show-overflow-tooltip min-width="180">
        <template #default="scope">
          <el-tag v-if="scope.row.topFlag === 1" size="small" class="news-top-tag">置顶</el-tag>
          {{ scope.row.title }}
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
      <el-table-column header-align="center" align="center" label="有效期至" width="170">
        <template #default="scope">
          <template v-if="scope.row.expireTime">
            {{ formatTime(scope.row.expireTime) }}
            <div v-if="isExpired(scope.row.expireTime)" style="color: #f56c6c; font-size: 12px">已过期</div>
          </template>
          <span v-else style="color: #999">长期有效</span>
        </template>
      </el-table-column>

      <el-table-column header-align="center" align="center" label="操作" width="360" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.auditStatus === 1 && scope.row.publishStatus !== 1"
            type="warning"
            size="small"
            @click="openPublish(scope.row)"
          >发布</el-button>
          <el-button
            v-if="scope.row.auditStatus === 1 && scope.row.publishStatus === 1"
            size="small"
            :loading="topLoadingId === scope.row.id"
            :disabled="topLoadingId !== null && topLoadingId !== scope.row.id"
            @click="toggleTop(scope.row)"
          >{{ scope.row.topFlag === 1 ? '取消置顶' : '置顶' }}</el-button>
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

        <el-form-item label="有效期至">
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            placeholder="留空表示长期有效"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit()">保存</el-button>
      </template>
    </el-dialog>

    <!-- ================= 发布配置弹窗 ================= -->
    <el-dialog v-model="publishVisible" title="发布配置" width="560px" top="8vh">
      <el-form label-width="90px">
        <el-form-item label="资讯">
          <span>{{ publishForm.title }}</span>
        </el-form-item>

        <el-form-item label="发布时间">
          <el-date-picker
            v-model="publishForm.publishTime"
            type="datetime"
            placeholder="留空表示立即发布"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable
            style="width: 100%"
          />
          <div style="color: #909399; font-size: 12px; line-height: 1.6">
            留空表示立即发布；填未来时间则同时创建一个定时推送任务。
          </div>
        </el-form-item>

        <el-form-item label="目标人群">
          <el-radio-group v-model="publishForm.targetType">
            <el-radio :value="1">全部学生</el-radio>
            <el-radio :value="2">按年级</el-radio>
            <el-radio :value="3">按专业</el-radio>
            <el-radio :value="4">按标签</el-radio>
            <el-radio :value="5">按班级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="publishForm.targetType === 2" label="年级">
          <el-select v-model="publishForm.gradeValues" multiple filterable allow-create default-first-option
                     placeholder="输入年级后回车，如 2023" style="width: 100%">
            <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="publishForm.targetType === 3" label="专业">
          <el-select v-model="publishForm.majorValues" multiple filterable allow-create default-first-option
                     placeholder="输入专业后回车，如 软件工程" style="width: 100%">
            <el-option v-for="m in majorOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="publishForm.targetType === 5" label="班级">
          <el-select v-model="publishForm.classValues" multiple filterable allow-create default-first-option
                     placeholder="输入班级后回车，如 23计算机1班" style="width: 100%">
            <el-option v-for="c in classOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="publishForm.targetType === 4" label="订阅标签">
          <el-select v-model="publishForm.tagIds" multiple placeholder="推给订阅了这些标签的学生" style="width: 100%">
            <el-option v-for="t in tagOptions" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="推送渠道">
          <el-radio-group v-model="publishForm.channel">
            <el-radio :value="1">站内信</el-radio>
            <el-radio :value="2">微信</el-radio>
            <el-radio :value="3">企业微信</el-radio>
          </el-radio-group>
          <div v-if="publishForm.channel !== 1" style="color: #e6a23c; font-size: 12px; line-height: 1.6">
            该渠道未对接真实服务，执行时会如实记为「渠道未接入」。
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishLoading" @click="submitPublish()">确定发布</el-button>
      </template>
    </el-dialog>

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
import { studentApi } from '@/api/student-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const topLoadingId = ref<number | string | null>(null)
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
  expireTime: null,
})

// ---------- 发布配置 ----------
const publishVisible = ref(false)
const publishLoading = ref(false)
const gradeOptions = ref<string[]>([])
const majorOptions = ref<string[]>([])
const classOptions = ref<string[]>([])
const publishForm = reactive<any>({
  id: null,
  title: '',
  publishTime: null,
  targetType: 1,
  gradeValues: [],
  majorValues: [],
  classValues: [],
  tagIds: [],
  channel: 1,
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

/** 有效期是否已过（没填就是长期有效，不算过期） */
function isExpired(v: any) {
  if (!v) return false
  return new Date(String(v).replace(' ', 'T')).getTime() < Date.now()
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

async function toggleTop(row: { id: number | string; topFlag?: number }) {
  if (topLoadingId.value !== null) return
  topLoadingId.value = row.id
  const topFlag = row.topFlag === 1 ? 0 : 1
  try {
    await newsApi.setTop(row.id, topFlag)
    ElMessage.success(topFlag === 1 ? '已置顶' : '已取消置顶')
    await getList()
  } catch (error) {
    console.error(error)
  } finally {
    topLoadingId.value = null
  }
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
  form.expireTime = null
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
    form.expireTime = d.expireTime || null
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

// ================= 发布配置 =================
/** 年级/专业/班级候选值取自学生表，避免手打出错字 */
async function loadStudentOptions() {
  try {
    const res: any = await studentApi.queryPageList({}, 1, 500)
    const list = res.data.list || []
    gradeOptions.value = [...new Set(list.map((s: any) => s.grade).filter(Boolean))] as string[]
    majorOptions.value = [...new Set(list.map((s: any) => s.major).filter(Boolean))] as string[]
    classOptions.value = [...new Set(list.map((s: any) => s.className).filter(Boolean))] as string[]
  } catch (e) {
    gradeOptions.value = []
    majorOptions.value = []
    classOptions.value = []
  }
}

function openPublish(row: any) {
  publishForm.id = row.id
  publishForm.title = row.title
  publishForm.publishTime = null
  publishForm.targetType = 1
  publishForm.gradeValues = []
  publishForm.majorValues = []
  publishForm.classValues = []
  publishForm.tagIds = []
  publishForm.channel = 1
  publishVisible.value = true
}

/** 把弹窗里的多选拼成后端要的逗号分隔串 */
function publishTargetValue() {
  if (publishForm.targetType === 2) return publishForm.gradeValues.join(',')
  if (publishForm.targetType === 3) return publishForm.majorValues.join(',')
  if (publishForm.targetType === 4) return publishForm.tagIds.join(',')
  if (publishForm.targetType === 5) return publishForm.classValues.join(',')
  return null
}

async function submitPublish() {
  const targetValue = publishTargetValue()
  if (publishForm.targetType !== 1 && !targetValue) {
    ElMessage.warning('请填写目标人群取值')
    return
  }
  try {
    publishLoading.value = true
    await newsApi.publish({
      id: publishForm.id,
      publishTime: publishForm.publishTime,
      targetType: publishForm.targetType,
      targetValue,
      channel: publishForm.channel,
    })
    ElMessage.success('发布成功')
    publishVisible.value = false
    getList()
  } catch (err) {
    console.error(err)
  } finally {
    publishLoading.value = false
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
  loadStudentOptions()
})
</script>

<style scoped lang="less">
.news-top-tag {
  margin-inline-end: 6px;
}
</style>
