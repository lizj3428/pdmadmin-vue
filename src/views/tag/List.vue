<template>
  <div class="list-container">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="「引用次数」是统计出来的，不是手工填的。新建资讯时挂上这个标签，次数才会涨。"
      style="margin-bottom: 12px"
    />

    <!-- 搜索表单区域 -->
    <el-form :inline="true">
      <el-form-item label="标签名称">
        <el-input v-model="queryForm.name" placeholder="请输入标签名称" clearable />
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
      <el-table-column header-align="center" align="center" prop="name" label="标签名称" />
      <el-table-column header-align="center" align="center" label="引用次数" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.useCount > 0 ? 'success' : 'info'" size="small">
            {{ scope.row.useCount || 0 }}
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

    <el-pagination
      @current-change="handleCurrentPageChange"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="queryForm.pagesize"
      style="justify-content: flex-end; margin-top: 12px"
    />

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑标签' : '新增标签'" width="460px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标签名称" required>
          <el-input v-model="form.name" placeholder="例如：考研" />
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
import { tagApi } from '@/api/tag-api'
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

const dialogVisible = ref(false)
const submitLoading = ref(false)
const form = reactive<any>({ id: null, name: '' })

async function getList() {
  try {
    listLoading.value = true
    const res: any = await tagApi.queryPageList(
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

function add() {
  form.id = null
  form.name = ''
  dialogVisible.value = true
}

function update(row: any) {
  form.id = row.id
  form.name = row.name
  dialogVisible.value = true
}

async function submit() {
  if (!form.name) {
    ElMessage.warning('请填写标签名称')
    return
  }
  try {
    submitLoading.value = true
    if (form.id) {
      await tagApi.update(form)
      ElMessage.success('修改成功')
    } else {
      await tagApi.add(form)
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
    await tagApi.delete(ids)
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
