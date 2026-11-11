<template>
  <div class="common-layout">
    <el-container>
      <el-header class="pdm-shell-header">
        <Header></Header>
      </el-header>
      <el-container>
        <el-aside
          class="pdm-sidebar pdm-sidebar--dark"
          :class="{ 'pdm-sidebar--collapsed': collapsed }"
        >
          <LeftMenu :collapsed="collapsed" @toggle="toggleSidebar"></LeftMenu>
        </el-aside>
        <el-container
          class="pdm-content__wrapper"
          :class="{ 'pdm-content__wrapper--collapsed': collapsed }"
        >
          <el-main class="pdm-content">
            <el-card>
              <router-view />
            </el-card>
          </el-main>
          <el-footer class="layout-footer">
            <Footer></Footer>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue'
import LeftMenu from '../components/LeftMenu.vue'
import Footer from '../components/Footer.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'
import wsManager from '@/utils/websocket'

/** 侧边栏折叠状态：刷新后保留上次选择 */
const sidebarCollapsedKey = 'pdm-admin-sidebar-collapsed'
const collapsed = ref(localStorage.getItem(sidebarCollapsedKey) === 'true')

function toggleSidebar() {
  collapsed.value = !collapsed.value
  localStorage.setItem(sidebarCollapsedKey, String(collapsed.value))
}

// ===== WebSocket 实时推送 =====
// 登录后建立连接，后端用 MessagePushService 推消息时，这里会实时弹出通知
onMounted(() => {
  wsManager.setOnMessage((data: any) => {
    ElNotification({
      title: data.title || '新消息提醒',
      message: data.content || '',
      type: 'success',
      duration: 4000,
    })
  })
  wsManager.connect()
})

onUnmounted(() => {
  wsManager.close()
})
</script>

<style lang="less">
@import url('../styles/style.less');
</style>
