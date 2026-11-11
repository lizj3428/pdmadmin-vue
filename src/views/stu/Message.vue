<template>
  <div class="stu-msg">
    <h1 class="stu-msg__heading">消息中心</h1>
    <div class="stu-msg__bar">
      <el-radio-group v-model="filter" :disabled="loading || markingAll" @change="search">
        <el-radio-button :value="'unread'">未读</el-radio-button>
        <el-radio-button :value="'all'">全部</el-radio-button>
      </el-radio-group>

      <el-button :disabled="loading || total === 0" :loading="markingAll" @click="readAll">
        全部标为已读
      </el-button>
    </div>

    <div v-loading="loading" class="stu-msg__list">
      <el-empty v-if="!loading && loadFailed" description="消息加载失败">
        <el-button @click="loadList">重试</el-button>
      </el-empty>
      <el-empty
        v-else-if="!loading && list.length === 0"
        :description="filter === 'unread' ? '暂无未读消息' : '暂无消息'"
      />

      <button
        v-for="item in list"
        :key="item.id"
        type="button"
        class="stu-msg__item"
        :class="{ 'is-unread': item.readFlag === 0 }"
        :disabled="markingAll"
        @click="openMessage(item)"
      >
        <span class="stu-msg__body">
          <span class="stu-msg__title">
            <span v-if="item.readFlag === 0" class="stu-msg__badge">未读</span>
            {{ item.title }}
          </span>
          <span class="stu-msg__content">{{ item.content || '点击查看详情' }}</span>
        </span>
        <span class="stu-msg__time">{{ formatTime(item.createTime) }}</span>
      </button>

      <div v-if="total > 0" class="stu-msg__pager">
        <el-pagination
          layout="prev, pager, next"
          background
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          :disabled="loading || markingAll"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { stuApi } from '@/api/stu-api'

const router = useRouter()

// 布局页提供的未读数刷新方法（导航上的小红点）
const refreshUnread = inject<() => void>('refreshUnread', () => {})

const loading = ref(false)
const loadFailed = ref(false)
const markingAll = ref(false)
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
  loadFailed.value = false
  try {
    // 后端按 readFlag 精确筛选：0 未读、1 已读。选「全部」时干脆不传这个条件
    const param = filter.value === 'unread' ? { readFlag: 0 } : {}
    const res: any = await stuApi.messageList(param, pageNum.value, pageSize.value)
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch {
    loadFailed.value = true
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
  if (pageNum.value === p) return
  pageNum.value = p
  loadList()
}

async function openMessage(item: any) {
  if (item.msgType === 1 && item.newsId) {
    router.push(`/stu/news/${item.newsId}`)
    return
  }

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
  if (markingAll.value || loading.value || total.value === 0) return
  markingAll.value = true
  try {
    try {
      await ElMessageBox.confirm(
        '将把你账号下的所有未读消息标为已读，包括其他分页的消息。',
        '全部标为已读',
        { type: 'warning', confirmButtonText: '确认标为已读', cancelButtonText: '取消' },
      )
    } catch {
      return
    }
    await stuApi.readAll()
    ElMessage.success('已全部标为已读')
    refreshUnread()
    pageNum.value = 1
    await loadList()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    markingAll.value = false
  }
}

onMounted(loadList)
</script>

<style scoped lang="less">
.stu-msg {
  &__heading {
    margin-bottom: 12px;
    color: #1e293b;
    font-size: 20px;
  }

  &__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__list {
    min-height: 200px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 14px 16px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid #eef1f5;
    border-radius: 10px;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: box-shadow 0.15s;

    &:hover,
    &:focus-visible {
      box-shadow: 0 4px 14px rgba(47, 111, 237, 0.08);
    }

    &.is-unread {
      border-color: #bfdbfe;
      border-inline-start: 3px solid #2563eb;
      background: #eff6ff;
    }
  }

  &__badge {
    display: inline-block;
    margin-right: 4px;
    padding: 1px 6px;
    border-radius: 4px;
    background: #dbeafe;
    color: #1e40af;
    font-size: 12px;
    font-weight: 600;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: block;
    font-size: 14px;
    color: #1c2333;
    line-height: 1.5;
    overflow-wrap: anywhere;

    .is-unread & {
      font-weight: 600;
    }
  }

  &__content {
    display: block;
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
    color: #64748b;
  }

  &__pager {
    display: flex;
    justify-content: center;
    padding: 20px 0 4px;
  }
}

@media (max-width: 540px) {
  .stu-msg__item {
    flex-direction: column;
    gap: 4px;
  }

  .stu-msg__body {
    width: 100%;
  }
}
</style>
