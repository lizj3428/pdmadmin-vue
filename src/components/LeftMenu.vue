<template>
  <div class="pdm-sidebar__inner-wrap">
    <div class="pdm-sidebar__inner">
      <el-menu
        :collapseTransition="false"
        class="pdm-sidebar__menu"
        background-color="#001528"
        active-text-color="#fff"
        text-color="#8a979e"
      >
        <el-menu-item index="welcome" @click="$router.push({ name: 'welcome' })">
          <el-icon>
            <HomeFilled />
          </el-icon>
          <span slot="title">首页</span>
        </el-menu-item>
        <el-menu-item index="welcome1" @click="$router.push({ name: 'Welcome' })">
          <el-icon>
            <HomeFilled />
          </el-icon>
          <span slot="title">首页1</span>
        </el-menu-item>

        <el-sub-menu index="管理员信息管理" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <span slot="title">管理员信息管理</span>
          </template>
          <el-menu-item index="admin" @click="$router.push({ name: 'Admin' })">
            <el-icon>
              <User />
            </el-icon>
            <span slot="title">管理员信息管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="组织管理2" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <span slot="title">组织管理</span>
          </template>
          <el-menu-item index="MisDept" @click="$router.push({ name: 'MisDept' })">
            <el-icon>
              <Grid />
            </el-icon>
            <span slot="title">部门管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="组织管理3" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <span slot="title">组织管理</span>
          </template>
          <el-menu-item index="MisDept" @click="$router.push({ name: 'MisDept' })">
            <el-icon>
              <Grid />
            </el-icon>
            <span slot="title">部门管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="组织管理4" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            <span slot="title">组织管理</span>
          </template>
          <el-menu-item index="MisDept" @click="$router.push({ name: 'MisDept' })">
            <el-icon>
              <Grid />
            </el-icon>
            <span slot="title">部门管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { HomeFilled, OfficeBuilding, User, Grid } from '@element-plus/icons-vue'
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
