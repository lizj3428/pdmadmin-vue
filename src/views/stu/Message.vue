<template>
  <div class="stu-msg">
    <div class="stu-msg__bar">
      <el-radio-group v-model="filter" @change="search">
        <el-radio-button :value="'unread'">未读</el-radio-button>
        <el-radio-button :value="'all'">全部</el-radio-button>
      </el-radio-group>

      <el-button :disabled="list.length === 0" @click="readAll">全部标为已读</el-button>
    </div>

    <div v-loading="loading" class="stu-msg__list">
      <el-empty v-if="!loading && list.length === 0" description="没有消息" />

      <div
        v-for="item in list"
        :key="item.id"
        class="stu-msg__item"
        :class="{ 'is-unread': item.readFlag === 0 }"
        @click="openMessage(item)"
      >
        <span class="stu-msg__dot"></span>
        <div class="stu-msg__body">
          <div class="stu-msg__title">{{ item.title }}</div>
          <div class="stu-msg__content">{{ item.content || '点击查看详情' }}</div>
        </div>
        <div class="stu-msg__time">{{ formatTime(item.createTime) }}</div>
      </div>

      <div v-if="total > 0" class="stu-msg__pager">
        <el-pagination
          layout="prev, pager, next"
          background
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { stuApi } from '@/api/stu-api'

const router = useRouter()

// 布局页提供的未读数刷新方法（导航上的小红点）
const refreshUnread = inject<() => void>('refreshUnread', () => {})

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filter = ref<'unread' | 'all'>('unread')

function formatTime(t: any) {
  if (!t) {
    return ''
  }
  return String(t).replace('T', ' ').slice(0, 16)
}

async function loadList() {
  loading.value = true
  try {
    // 后端按 readFlag 精确筛选：0 未读、1 已读。选「全部」时干脆不传这个条件
    const param = filter.value === 'unread' ? { readFlag: 0 } : {}
    const res: any = await stuApi.messageList(param, pageNum.value, pageSize.value)
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function search() {
  pageNum.value = 1
  loadList()
}

function onPageChange(p: number) {
  pageNum.value = p
  loadList()
}

async function openMessage(item: any) {
  // 先标已读：消息点了就算看过了，不等跳转结果
  if (item.readFlag === 0) {
    try {
      await stuApi.readMessage(item.id)
      item.readFlag = 1
      refreshUnread()
    } catch {
      // 标记失败也让他看内容
    }
  }
  if (item.newsId) {
    router.push(`/stu/news/${item.newsId}`)
  }
}

async function readAll() {
  try {
    await stuApi.readAll()
    ElMessage.success('已全部标为已读')
    refreshUnread()
    search()
  } catch {
    ElMessage.error('操作失败')
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.stu-msg {
  &__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__list {
    min-height: 200px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid #eef1f5;
    border-radius: 10px;
    cursor: pointer;
    transition: box-shadow 0.15s;

    &:hover {
      box-shadow: 0 4px 14px rgba(47, 111, 237, 0.08);
    }

    &.is-unread {
      border-color: #dce7ff;
      background: #fbfcff;
    }
  }

  &__dot {
    flex: none;
    width: 7px;
    height: 7px;
    margin-top: 7px;
    border-radius: 50%;
    background: transparent;

    .is-unread & {
      background: #f56c6c;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    color: #1c2333;
    line-height: 1.5;

    .is-unread & {
      font-weight: 500;
    }
  }

  &__content {
    margin-top: 4px;
    font-size: 13px;
    color: #7b8493;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__time {
    flex: none;
    font-size: 12px;
    color: #a0a8b5;
  }

  &__pager {
    display: flex;
    justify-content: center;
    padding: 20px 0 4px;
  }
}
</style>
