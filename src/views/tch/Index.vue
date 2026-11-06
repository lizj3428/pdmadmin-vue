<template>
  <div class="common-layout">
    <el-container>
      <el-header style="height: 90px">
        <Header></Header>
      </el-header>
      <el-container>
        <el-aside class="pdm-sidebar pdm-sidebar--dark">
          <TchMenu></TchMenu>
        </el-aside>
        <el-container class="pdm-content__wrapper">
          <el-main class="pdm-content" :style="siteContent.siteContentHeight">
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
import Header from '../../components/Header.vue'
import TchMenu from '../../components/TchMenu.vue'
import Footer from '../../components/Footer.vue'
import { reactive } from 'vue'

/**
 * 教师端布局
 * 结构和管理端的 Index.vue 完全一样，只是左侧菜单换成 TchMenu（只有「我的投稿」）。
 * 不做成同一个组件的 prop 开关，是因为两端的菜单会越差越多，
 * 分开之后改教师端不会误伤管理端。
 *
 * 这里不连 WebSocket：教师端没有实时通知需求，
 * 连了反而会和同一个浏览器里开着的管理端抢同一条连接。
 */
const siteContent = reactive({
  documentClientHeight: 0,
  siteContentHeight: {} as any,
})

function getSiteContentHeight() {
  siteContent.documentClientHeight = document.documentElement.clientHeight
  const hight = siteContent.documentClientHeight - 90 - 100
  siteContent.siteContentHeight = { minHeight: hight + 'px' }
}

getSiteContentHeight()
</script>

<style lang="less">
@import url('../../styles/style.less');
</style>
