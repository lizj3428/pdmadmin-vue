<template>
  <div class="list-container">
    <!-- 搜索表单区域 -->
    <el-form :inline="true">
      <el-form-item label="分类名称">
        <el-input v-model="queryForm.name" placeholder="请输入分类名称" clearable />
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary">查询</el-button>
        <el-button @click="add()" type="primary">新增</el-button>
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
      <el-table-column header-align="center" align="center" prop="name" label="分类名称" />
      <el-table-column header-align="center" align="center" prop="sort" label="排序" width="90" />
      <el-table-column header-align="center" align="center" prop="remark" label="分类说明" show-overflow-tooltip />
      <el-table-column header-align="center" align="center" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="createTime" label="创建时间" width="180" />

      <el-table-column header-align="center" align="center" label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="update(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="confirmDel(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      @current-change="handleCurrentPageChange"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="queryForm.pagesize"
      style="justify-content: flex-end; margin-top: 12px"
    />

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '新增分类'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="例如：校园通知" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
          <span style="color: #999; margin-left: 8px">值越小越靠前</span>
        </el-form-item>
        <el-form-item label="分类说明">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="选填" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
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
import { categoryApi } from '@/api/category-api'
import Constants from '@/utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const datalist = ref<any[]>([])
const listLoading = ref(false)
const total = ref(0)

const queryFormState = {
  name: '',
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE,
}
const queryForm = reactive({ ...queryFormState })

const multipleSelection = ref<any[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const submitLoading = ref(false)
const form = reactive<any>({
  id: null,
  name: '',
  sort: 0,
  remark: '',
  status: 1,
})

async function getList() {
  try {
    listLoading.value = true
    const res: any = await categoryApi.queryPageList(
      { name: queryForm.name },
      queryForm.pagenum,
      queryForm.pagesize,
    )
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

/** 重置表单，避免上次编辑的数据残留 */
function resetForm() {
  form.id = null
  form.name = ''
  form.sort = 0
  form.remark = ''
  form.status = 1
}

function add() {
  resetForm()
  dialogVisible.value = true
}

function update(row: any) {
  resetForm()
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!form.name) {
    ElMessage.warning('请填写分类名称')
    return
  }
  try {
    submitLoading.value = true
    if (form.id) {
      await categoryApi.update(form)
      ElMessage.success('修改成功')
    } else {
      await categoryApi.add(form)
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
    await categoryApi.delete(ids)
    ElMessage.success('删除成功')
    getList()
  } catch (err) {
  } finally {
    listLoading.value = false
  }
}

function handleSelectionChange(val: any[]) {
  multipleSelection.value = val
}

onMounted(getList)
</script>
