<template>
  <div class="list-container">
    <!-- 搜索表单区域 -->
    <el-form :inline="true">
      <el-form-item label="姓名">
        <el-input v-model="queryForm.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="电话">
        <el-input v-model="queryForm.tel" placeholder="请输入电话" />
      </el-form-item>

      <el-form-item>
        <el-button @click="onSearch()" type="primary">查询</el-button>
        <el-button @click="add()"  type="primary">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 分隔线 -->
    <el-divider border-style="dashed"/>

    <!-- 数据表格 -->
    <el-table border :data="datalist" v-loading="listLoading" stripe style="width: 100%" :header-cell-style="{backgroundColor: '#f5f5f5'}">
      <!-- 多选框列 -->
      <el-table-column type="selection" width="55" />
      <el-table-column header-align="center" align="center" prop="username" label="用户名" />
      <el-table-column header-align="center" align="center" prop="name" label="姓名" />
      <el-table-column header-align="center" align="center" prop="sex" label="性别" />
      <el-table-column header-align="center" align="center" prop="tel" label="电话" />
      <el-table-column header-align="center" align="center" prop="headurl" label="头像" />

      <!-- 操作列 -->
      <el-table-column header-align="center" align="center" label="操作" width="150" >
        <template #default="scope">
          <el-button type="primary" size="small">编辑</el-button>
          <el-button type="danger" size="small">删除</el-button>
        </template>
        </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination @current-change="" background layout="prev, pager, next" :total="total" style="justify-content: flex-end" />
    <Addorupdate @refresh="getList" ref="operateRef"></Addorupdate>
  </div>
</template>

<script setup lang="ts">
// 引入必要的 Vue API 和常量配置
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin-api'
import Constants from '@/utils/constants'
import Addorupdate from './Addorupdate.vue'


// 表格数据、加载状态、总条数
const datalist = ref([]);
const listLoading = ref(false);
const total = ref(0);

// 查询表单（响应式对象）
const queryFormState = {
  name: '',
  tel: '',
  pagenum: 1,
  pagesize: Constants.PAGE_SIZE
}
const queryForm = reactive({...queryFormState});
const operateRef = ref();

// 获取列表数据
async function getList() {
  try {
    listLoading.value = true
    let responseModel = await adminApi.queryPageList(queryForm, queryForm.pagenum, queryForm.pagesize);
    datalist.value = responseModel.data.list
    total.value = responseModel.data.total
  } catch (error) {
    console.error(error)
  } finally {
    listLoading.value = false
  }
}

// 查询按钮：重置页码并查询
function onSearch() { 
   queryForm.pagenum = 1;
   getList();
}

// 分页切换
function handleCurrentPageChange(val: number) {
  queryForm.pagenum = val;
  getList();
}

function add() {
  operateRef.value.showModal();
}

// 页面加载时获取数据
onMounted(getList)
</script>
