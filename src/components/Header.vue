<template>
  <div class="header">
    <div class="header-menu">
      <div class="haeder-logo">
        <div class="header-title">校园资讯推送后台</div>
      </div>
      <div class="header-rinfo">
        当前用户：
        <span>{{ admin.name || admin.username }}</span>
        <!-- 教师/学生是被授权后才进得来管理端的，标一下身份，演示时一眼能看出是谁在操作 -->
        <el-tag
          size="small"
          :type="identity === 'admin' ? 'danger' : 'warning'"
          style="margin-left: 8px"
        >
          {{ identityName }}
        </el-tag>
        <span class="header-exit">
          <a @click="loginOut()">退出</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminApi } from '@/api/admin-api'
import { teacherApi } from '@/api/teacher-api'
import { studentApi } from '@/api/student-api'
import { clearLocalStorage } from '@/utils/utils'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
const adminStore = useAdminStore()
const { admin, identity, identityName } = storeToRefs(adminStore)

async function loginOut() {
  try {
    // 三种身份各有各的登出入口，调错接口虽然也能退（底层都是 StpUtil.logout），
    // 但按身份分发更清楚，也避免以后加日志时统计错人
    if (identity.value === 'teacher') {
      await teacherApi.logout()
    } else if (identity.value === 'student') {
      await studentApi.logout()
    } else {
      // 注意：api 里定义的方法名是 logout，不是 loginOut
      await adminApi.logout({})
    }
  } catch (error) {
    console.error('退出登录失败', error)
  } finally {
    // 无论后端是否成功，都清掉本地 token 并跳回登录页
    clearLocalStorage()
    window.location.href = '/login'
  }
}
</script>
