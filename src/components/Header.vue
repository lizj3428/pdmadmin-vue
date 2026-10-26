<template>
  <div class="header">
    <div class="header-menu">
      <div class="haeder-logo">
        <div class="header-title">校园资讯推送后台</div>
      </div>
      <div class="header-rinfo">
        当前用户：
        <span>admin</span>
        <span class="header-exit">
          <a @click="loginOut()">退出</a>
        </span>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {adminApi} from '@/api/admin-api'
import { clearLocalStorage } from '@/utils/utils'


async function loginOut(){
  try{
    // 注意：api 里定义的方法名是 logout，不是 loginOut
    await adminApi.logout({})
  } catch (error) {
    console.error('退出登录失败', error);
  } finally {
    // 无论后端是否成功，都清掉本地 token 并跳回登录页
    clearLocalStorage()
    window.location.href = '/login';
  }
}

</script>

