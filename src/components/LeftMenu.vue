<template>
  <div class="pdm-sidebar__inner-wrap">
    <!-- ---------- 侧边栏收起展开 ---------- -->
    <button
      type="button"
      class="pdm-sidebar__toggle"
      :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
      :aria-expanded="!collapsed"
      :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
      @click="emit('toggle')"
    >
      <el-icon>
        <Expand v-if="collapsed" />
        <Fold v-else />
      </el-icon>
    </button>
    <div class="pdm-sidebar__inner">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        :default-openeds="defaultOpeneds"
        class="pdm-sidebar__menu"
        background-color="#001528"
        active-text-color="#fff"
        text-color="#8a979e"
      >
        <!-- ---------- 数据看板 ---------- -->
        <el-menu-item index="Welcome" @click="$router.push({ name: 'Welcome' })">
          <el-icon>
            <Odometer />
          </el-icon>
          <template #title>数据看板</template>
        </el-menu-item>

        <!-- ---------- 资讯管理 ---------- -->
        <el-sub-menu index="news-group" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <Document />
            </el-icon>
            <span slot="title">资讯管理</span>
          </template>
          <el-menu-item index="News" @click="$router.push({ name: 'News' })">
            <el-icon>
              <Files />
            </el-icon>
            <span slot="title">资讯列表</span>
          </el-menu-item>
          <el-menu-item index="NewsAudit" @click="$router.push({ name: 'NewsAudit' })">
            <el-icon>
              <DocumentChecked />
            </el-icon>
            <span slot="title">资讯审核</span>
          </el-menu-item>
          <el-menu-item index="Category" @click="$router.push({ name: 'Category' })">
            <el-icon>
              <Grid />
            </el-icon>
            <span slot="title">分类管理</span>
          </el-menu-item>
          <el-menu-item index="Tag" @click="$router.push({ name: 'Tag' })">
            <el-icon>
              <PriceTag />
            </el-icon>
            <span slot="title">标签管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- ---------- 用户管理 ---------- -->
        <el-sub-menu index="user-group" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <User />
            </el-icon>
            <span slot="title">用户管理</span>
          </template>
          <el-menu-item index="Admin" @click="$router.push({ name: 'Admin' })">
            <el-icon>
              <Avatar />
            </el-icon>
            <span slot="title">管理员管理</span>
          </el-menu-item>
          <el-menu-item index="Student" @click="$router.push({ name: 'Student' })">
            <el-icon>
              <School />
            </el-icon>
            <span slot="title">学生管理</span>
          </el-menu-item>
          <el-menu-item index="Teacher" @click="$router.push({ name: 'Teacher' })">
            <el-icon>
              <Reading />
            </el-icon>
            <span slot="title">教师管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- ---------- 推送管理 ---------- -->
        <el-sub-menu index="push-group" :popper-class="'pdm-sidebar--dark-popper'">
          <template #title>
            <el-icon>
              <Promotion />
            </el-icon>
            <span slot="title">推送管理</span>
          </template>
          <el-menu-item index="PushTask" @click="$router.push({ name: 'PushTask' })">
            <el-icon>
              <Promotion />
            </el-icon>
            <span slot="title">推送任务</span>
          </el-menu-item>
          <el-menu-item index="PushRecord" @click="$router.push({ name: 'PushRecord' })">
            <el-icon>
              <Bell />
            </el-icon>
            <span slot="title">推送记录</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- ---------- 数据统计 ---------- -->
        <el-menu-item index="Stat" @click="$router.push({ name: 'Stat' })">
          <el-icon>
            <TrendCharts />
          </el-icon>
          <template #title>数据统计</template>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  Document,
  DocumentChecked,
  Files,
  Grid,
  PriceTag,
  User,
  Avatar,
  School,
  Reading,
  Promotion,
  Bell,
  TrendCharts,
} from '@element-plus/icons-vue'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const route = useRoute()

/** 当前高亮的菜单项：直接用路由 name 和 index 对应 */
const activeMenu = computed(() => String(route.name || ''))

/** 默认展开「资讯管理」和「用户管理」，进来就能看到常用菜单 */
const defaultOpeneds = ['news-group', 'user-group']
</script>

<style scoped lang="less">
.pdm-sidebar__toggle {
  display: flex;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  padding: 0;
  border: 0;
  background-color: #001528;
  color: #8a979e;
  font-size: 20px;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background-color: #0f3a5c;
    color: #fff;
  }

  &:focus-visible {
    outline: 2px solid #8a979e;
    outline-offset: -2px;
  }
}
</style>
