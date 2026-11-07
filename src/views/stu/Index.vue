<template>
  <div class="stu-layout">
    <header class="stu-header">
      <div class="stu-header__inner">
        <div class="stu-brand" @click="go('/stu/home')">
          <span class="stu-brand__mark">校</span>
          <span class="stu-brand__text">校园资讯</span>
        </div>

        <nav class="stu-nav">
          <a
            v-for="item in navs"
            :key="item.path"
            class="stu-nav__item"
            :class="{ 'is-active': isActive(item.path) }"
            @click="go(item.path)"
          >
            {{ item.label }}
            <span v-if="item.path === '/stu/message' && unread > 0" class="stu-nav__dot">
              {{ unread > 99 ? '99+' : unread }}
            </span>
          </a>
        </nav>

        <div class="stu-user">
          <span class="stu-user__name">{{ admin.name || '同学' }}</span>
          <a class="stu-user__exit" @click="logout">退出</a>
        </div>
      </div>
    </header>

    <main class="stu-main">
      <router-view />
    </main>

    <footer class="stu-footer">泉州职业技术大学 · 校园资讯推送平台</footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import { studentApi } from '@/api/student-api'
import { stuApi } from '@/api/stu-api'
import wsManager from '@/utils/websocket'

/**
 * 学生端布局
 * 和管理端的左右结构不同：学生是来「看资讯」的，不是来操作后台的，
 * 所以做成顶部导航 + 单列内容，像一个小门户。
 */

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const { admin } = storeToRefs(adminStore)

const navs = [
  { label: '首页', path: '/stu/home' },
  { label: '消息', path: '/stu/message' },
  { label: '我的', path: '/stu/profile' },
]

const unread = ref(0)
let unreadRequest = 0

function isActive(path: string) {
  if (path === '/stu/home') {
    // 资讯详情也算首页这一栏，否则点进详情后导航高亮会消失
    return route.path === '/stu/home' || route.path.startsWith('/stu/news/')
  }
  return route.path === path
}

function go(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}

async function loadUnread() {
  const request = ++unreadRequest
  try {
    const res: any = await stuApi.unreadCount()
    if (request === unreadRequest) {
      unread.value = Number(res.data) || 0
    }
  } catch {
    // 未读数失败不影响主流程，静默处理
  }
}

// 子页面（读消息、全部已读）改完未读数后调这个刷新导航上的红点
provide('refreshUnread', loadUnread)

async function logout() {
  try {
    await studentApi.logout()
  } catch {
    // 后端失败也要清本地，否则退不出去
  } finally {
    wsManager.close()
    adminStore.loginout()
    router.push('/login')
  }
}

let timer: number | undefined

onMounted(() => {
  loadUnread()
  // 站着不动时未读数也能自己更新，不用手动刷新页面
  timer = window.setInterval(loadUnread, 60000)

  // 实时推送：管理员审核通过的资讯会立刻推过来
  wsManager.setOnMessage((data: any) => {
    if (data && data.title) {
      ElNotification({
        title: data.title,
        message: data.content || '您有一条新的校园资讯',
        type: 'info',
        duration: 6000,
        onClick: () => {
          if (data.newsId) {
            router.push(`/stu/news/${data.newsId}`)
          }
        },
      })
      loadUnread()
    }
  })
  wsManager.connect()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  wsManager.close()
})
</script>

<style scoped lang="less">
.stu-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.stu-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e8ebf0;

  &__inner {
    max-width: 1100px;
    margin: 0 auto;
    height: 60px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 36px;
  }
}

.stu-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  &__mark {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: #2f6fed;
    color: #fff;
    font-size: 14px;
    line-height: 26px;
    text-align: center;
  }

  &__text {
    font-size: 16px;
    font-weight: 500;
    color: #1c2333;
    letter-spacing: 0.5px;
  }
}

.stu-nav {
  display: flex;
  gap: 4px;
  flex: 1;

  &__item {
    position: relative;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 14px;
    color: #5a6474;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: #f1f4f9;
      color: #2f6fed;
    }

    &.is-active {
      background: #eaf1ff;
      color: #2f6fed;
      font-weight: 500;
    }
  }

  &__dot {
    display: inline-block;
    min-width: 16px;
    height: 16px;
    margin-left: 4px;
    padding: 0 4px;
    border-radius: 8px;
    background: #f56c6c;
    color: #fff;
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    vertical-align: 1px;
  }
}

.stu-user {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;

  &__name {
    color: #1c2333;
  }

  &__exit {
    color: #8b95a5;
    cursor: pointer;

    &:hover {
      color: #2f6fed;
    }
  }
}

.stu-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.stu-footer {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #a0a8b5;
}
</style>
