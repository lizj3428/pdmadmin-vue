<template>
  <div class="pdm-sidebar__inner-wrap">
    <div class="pdm-sidebar__inner">
      <el-menu
        :default-active="activeMenu"
        :collapseTransition="false"
        class="pdm-sidebar__menu"
        background-color="#001528"
        active-text-color="#fff"
        text-color="#8a979e"
      >
        <el-menu-item index="TchNews" @click="$router.push({ name: 'TchNews' })">
          <el-icon>
            <EditPen />
          </el-icon>
          <span slot="title">我的投稿</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { EditPen } from '@element-plus/icons-vue'

const route = useRoute()

/** 当前高亮的菜单项：直接用路由 name 和 index 对应 */
const activeMenu = computed(() => String(route.name || ''))
</script>
