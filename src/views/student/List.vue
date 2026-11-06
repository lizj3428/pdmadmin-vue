<template>
  <div class="list-container">
    <!-- 搜索表单区域 -->
    <el-form :inline="true">
      <el-form-item label="学号">
        <el-input v-model="queryForm.studentNo" placeholder="支持模糊搜索" clearable style="width: 150px" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="queryForm.realName" placeholder="支持模糊搜索" clearable style="width: 130px" />
      </el-form-item>
      <el-form-item label="年级">
        <el-input v-model="queryForm.grade" placeholder="如 2023" clearable style="width: 110px" />
      </el-form-item>
      <el-form-item label="专业">
        <el-input v-model="queryForm.major" placeholder="精确匹配" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 100px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary">查询</el-button>
        <el-button @click="add()" type="primary">新增</el-button>
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
      <el-table-column header-align="center" align="center" prop="studentNo" label="学号" width="120" />
      <el-table-column header-align="center" align="center" prop="realName" label="姓名" width="110" />
      <el-table-column header-align="center" align="center" prop="gender" label="性别" width="70" />
      <el-table-column header-align="center" align="center" prop="grade" label="年级" width="80" />
      <el-table-column header-align="center" align="center" prop="major" label="专业" show-overflow-tooltip min-width="150" />
      <el-table-column header-align="center" align="center" prop="className" label="班级" show-overflow-tooltip min-width="120" />
      <el-table-column header-align="center" align="center" prop="phone" label="电话" width="130" />
      <el-table-column header-align="center" align="center" label="接收渠道" width="100">
        <template #default="scope">
          {{ channelText(scope.row.pushChannel) }}
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- adminFlag=1 的学生（学生会等）登录后能进管理端 -->
      <el-table-column header-align="center" align="center" label="管理端权限" width="110">
        <template #default="scope">
          <el-switch
            :model-value="scope.row.adminFlag === 1"
            inline-prompt
            active-text="有"
            inactive-text="无"
            @change="(val: any) => toggleAdmin(scope.row, val)"
          />
        </template>
      </el-table-column>

      <el-table-column header-align="center" align="center" label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="update(scope.row)">编辑</el-button>
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

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑学生' : '新增学生'" width="680px">
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="学号" required>
              <el-input v-model="form.studentNo" placeholder="登录账号，唯一" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.id ? '密码' : '密码'" :required="!form.id">
              <el-input
                v-model="form.password"
                type="password"
                show-password
                :placeholder="form.id ? '留空表示不修改' : '默认建议 123456'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名" required>
              <el-input v-model="form.realName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="年级">
              <el-input v-model="form.grade" placeholder="如 2023" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业">
              <el-input v-model="form.major" placeholder="如 计算机应用工程" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="班级">
              <el-input v-model="form.className" placeholder="如 23计算机1班" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="接收渠道">
              <el-select v-model="form.pushChannel" style="width: 100%">
                <el-option label="站内信" :value="1" />
                <el-option label="微信" :value="2" />
                <el-option label="两者都要" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="免打扰">
              <el-switch v-model="form.disturbFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="账号状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit()">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { studentApi } from '@/api/student-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const multipleSelection = ref<any[]>([])

const queryFormState = {
  studentNo: '',
  realName: '',
  grade: '',
  major: '',
  status: null as any,
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive<any>({ ...queryFormState })

const dialogVisible = ref(false)
const submitLoading = ref(false)
const form = reactive<any>({
  id: null,
  studentNo: '',
  password: '',
  realName: '',
  gender: '男',
  grade: '',
  major: '',
  className: '',
  phone: '',
  pushChannel: 1,
  disturbFlag: 0,
  status: 1,
})

function channelText(v: any) {
  return { 1: '站内信', 2: '微信', 3: '两者' }[v as number] || '站内信'
}

async function getList() {
  try {
    listLoading.value = true
    const params: any = {}
    if (queryForm.studentNo) params.studentNo = queryForm.studentNo
    if (queryForm.realName) params.realName = queryForm.realName
    if (queryForm.grade) params.grade = queryForm.grade
    if (queryForm.major) params.major = queryForm.major
    if (queryForm.status !== null && queryForm.status !== '') params.status = queryForm.status

    const res: any = await studentApi.queryPageList(params, queryForm.pagenum, queryForm.pagesize)
    datalist.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    listLoading.value = false
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

function resetForm() {
  form.id = null
  form.studentNo = ''
  form.password = ''
  form.realName = ''
  form.gender = '男'
  form.grade = ''
  form.major = ''
  form.className = ''
  form.phone = ''
  form.pushChannel = 1
  form.disturbFlag = 0
  form.status = 1
}

function add() {
  resetForm()
  dialogVisible.value = true
}

function update(row: any) {
  resetForm()
  Object.assign(form, row)
  // 列表接口不返回密码，编辑时必须留空，否则会把密码写成 null
  form.password = ''
  dialogVisible.value = true
}

async function submit() {
  if (!form.studentNo) {
    ElMessage.warning('请填写学号')
    return
  }
  if (!form.realName) {
    ElMessage.warning('请填写姓名')
    return
  }
  if (!form.id && !form.password) {
    ElMessage.warning('新增学生必须设置密码')
    return
  }
  try {
    submitLoading.value = true
    if (form.id) {
      await studentApi.update(form)
      ElMessage.success('修改成功')
    } else {
      await studentApi.add(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (err) {
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

/**
 * 切换学生的管理端权限（学生会成员等）
 * 用 :model-value 而不是 v-model：请求成功才改行数据，失败时开关回到原位
 */
async function toggleAdmin(row: any, val: any) {
  const flag = val ? 1 : 0
  try {
    await studentApi.grantAdmin(row.id, flag)
    row.adminFlag = flag
    ElMessage.success(flag === 1 ? '已授权，该学生可登录管理端' : '已取消管理端权限')
  } catch (err) {
    ElMessage.error('操作失败，请重试')
    getList()
  }
}

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
    await studentApi.delete(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (err) {
  } finally {
    listLoading.value = false
  }
}

onMounted(getList)
</script>
