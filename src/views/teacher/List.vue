<template>
  <div class="list-container">
    <el-form :inline="true">
      <el-form-item label="教工号">
        <el-input v-model="queryForm.teacherNo" placeholder="支持模糊搜索" clearable style="width: 150px" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="queryForm.realName" placeholder="支持模糊搜索" clearable style="width: 130px" />
      </el-form-item>
      <el-form-item label="院系">
        <el-input v-model="queryForm.deptName" placeholder="精确匹配" clearable style="width: 170px" />
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
      <el-table-column header-align="center" align="center" prop="teacherNo" label="教工号" width="130" />
      <el-table-column header-align="center" align="center" prop="realName" label="姓名" width="110" />
      <el-table-column header-align="center" align="center" prop="gender" label="性别" width="70" />
      <el-table-column header-align="center" align="center" prop="deptName" label="所属院系" show-overflow-tooltip min-width="180" />
      <el-table-column header-align="center" align="center" prop="title" label="职称" width="100" />
      <el-table-column header-align="center" align="center" prop="phone" label="联系电话" width="130" />
      <el-table-column header-align="center" align="center" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- adminFlag=1 的教师登录后能进管理端；0 的只能投稿 -->
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
      <el-table-column header-align="center" align="center" prop="createTime" label="创建时间" width="170" />

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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑教师' : '新增教师'" width="640px">
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="教工号" required>
              <el-input v-model="form.teacherNo" placeholder="唯一" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" :required="!form.id">
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
            <el-form-item label="所属院系">
              <el-input v-model="form.deptName" placeholder="如 联合创新产业学院" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称">
              <el-select v-model="form.title" placeholder="请选择" allow-create filterable style="width: 100%">
                <el-option label="助教" value="助教" />
                <el-option label="讲师" value="讲师" />
                <el-option label="副教授" value="副教授" />
                <el-option label="教授" value="教授" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
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
import { teacherApi } from '@/api/teacher-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)
const multipleSelection = ref<any[]>([])

const queryFormState = {
  teacherNo: '',
  realName: '',
  deptName: '',
  status: null as any,
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive<any>({ ...queryFormState })

const dialogVisible = ref(false)
const submitLoading = ref(false)
const form = reactive<any>({
  id: null,
  teacherNo: '',
  password: '',
  realName: '',
  gender: '男',
  phone: '',
  deptName: '',
  title: '',
  status: 1,
})

async function getList() {
  try {
    listLoading.value = true
    const params: any = {}
    if (queryForm.teacherNo) params.teacherNo = queryForm.teacherNo
    if (queryForm.realName) params.realName = queryForm.realName
    if (queryForm.deptName) params.deptName = queryForm.deptName
    if (queryForm.status !== null && queryForm.status !== '') params.status = queryForm.status

    const res: any = await teacherApi.queryPageList(params, queryForm.pagenum, queryForm.pagesize)
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
  form.teacherNo = ''
  form.password = ''
  form.realName = ''
  form.gender = '男'
  form.phone = ''
  form.deptName = ''
  form.title = ''
  form.status = 1
}

function add() {
  resetForm()
  dialogVisible.value = true
}

function update(row: any) {
  resetForm()
  Object.assign(form, row)
  // 列表不返回密码，必须留空
  form.password = ''
  dialogVisible.value = true
}

async function submit() {
  if (!form.teacherNo) {
    ElMessage.warning('请填写教工号')
    return
  }
  if (!form.realName) {
    ElMessage.warning('请填写姓名')
    return
  }
  if (!form.id && !form.password) {
    ElMessage.warning('新增教师必须设置密码')
    return
  }
  try {
    submitLoading.value = true
    if (form.id) {
      await teacherApi.update(form)
      ElMessage.success('修改成功')
    } else {
      await teacherApi.add(form)
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
 * 切换教师的管理端权限
 * 用 :model-value 而不是 v-model：先发请求，成功了才改行数据，
 * 失败时开关会停在原位置，不会出现「界面显示已授权、数据库其实没改」
 */
async function toggleAdmin(row: any, val: any) {
  const flag = val ? 1 : 0
  try {
    await teacherApi.grantAdmin(row.id, flag)
    row.adminFlag = flag
    ElMessage.success(flag === 1 ? '已授权，该教师可登录管理端' : '已取消管理端权限')
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
    await teacherApi.delete(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (err) {
  } finally {
    listLoading.value = false
  }
}

onMounted(getList)
</script>
