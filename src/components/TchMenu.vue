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
        class="pdm-sidebar__menu"
        background-color="#001528"
        active-text-color="#fff"
        text-color="#8a979e"
      >
        <el-menu-item index="TchNews" @click="$router.push({ name: 'TchNews' })">
          <el-icon>
            <EditPen />
          </el-icon>
          <template #title>我的投稿</template>
        </el-menu-item>
        <el-menu-item index="TchNotice" @click="$router.push({ name: 'TchNotice' })">
          <el-icon>
            <Bell />
          </el-icon>
          <template #title>我的通知</template>
        </el-menu-item>
        <el-menu-item index="TchProfile" @click="$router.push({ name: 'TchProfile' })">
          <el-icon>
            <User />
          </el-icon>
          <template #title>个人资料</template>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { EditPen, User, Bell } from '@element-plus/icons-vue'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const route = useRoute()

/** 当前高亮的菜单项：直接用路由 name 和 index 对应 */
const activeMenu = computed(() => String(route.name || ''))
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
