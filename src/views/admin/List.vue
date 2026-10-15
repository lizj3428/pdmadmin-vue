<template>
  <div class="list-container">
    <!-- 搜索表单区域 -->
    <el-form :inline="true">
      <el-form-item label="姓名">
        <el-input placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="电话">
        <el-input placeholder="请输入电话" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary">查询</el-button>
        <el-button type="primary">新增</el-button>
        <el-button type="danger">批量删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 分隔线 -->
    <el-divider border-style="dashed"/>

    <!-- 数据表格 -->
    <el-table border stripe style="width: 100%" :header-cell-style="{backgroundColor: '#f5f5f5'}">
      <!-- 多选框列 -->
      <el-table-column type="selection" width="55" />
      <el-table-column header-align="center" prop="username" label="用户名" />
      <el-table-column header-align="center" prop="name" label="姓名" />
      <el-table-column header-align="center" prop="sex" label="性别" />
      <el-table-column header-align="center" prop="tel" label="电话" />
      <el-table-column header-align="center" prop="headurl" label="头像" />

      <!-- 操作列 -->
      <el-table-column header-align="center"  label="操作" width="150" >
        <template #default="scope">
          <el-button type="primary" size="small">编辑</el-button>
          <el-button type="danger" size="small">删除</el-button>
        </template>
        </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination background layout="prev, pager, next" :total="1000" style="justify-content: flex-end" />

  </div>
</template>
