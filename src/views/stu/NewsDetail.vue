<template>
  <div v-loading="loading" class="stu-detail">
    <div class="stu-detail__back" @click="router.back()">
      <span>←</span> 返回列表
    </div>

    <div v-if="news" class="stu-detail__card">
      <h1 class="stu-detail__title">{{ news.title }}</h1>

      <div class="stu-detail__meta">
        <span>{{ formatTime(news.publishTime || news.createTime) }}</span>
        <span>{{ news.viewCount || 0 }} 次阅读</span>
        <span v-if="news.authorType === 2">教师投稿</span>
      </div>

      <div v-if="news.tagNames && news.tagNames.length" class="stu-detail__tags">
        <el-tag v-for="t in news.tagNames" :key="t" size="small" effect="plain">{{ t }}</el-tag>
      </div>

      <el-divider />

      <div class="stu-detail__content">{{ news.content || '暂无正文' }}</div>
    </div>

    <el-empty v-else-if="!loading" description="资讯不存在或已下线" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { stuApi } from '@/api/stu-api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const news = ref<any>(null)

function formatTime(t: any) {
  if (!t) {
    return ''
  }
  return String(t).replace('T', ' ').slice(0, 16)
}

async function load() {
  const id = route.params.id
  if (!id) {
    return
  }
  loading.value = true
  news.value = null
  try {
    const res: any = await stuApi.newsDetail(id)
    news.value = res.data
  } catch {
    news.value = null
  } finally {
    loading.value = false
  }
}

// 从通知点进来时路由参数会变，但组件是复用的，所以要 watch
watch(() => route.params.id, load)
onMounted(load)
</script>

<style scoped lang="less">
.stu-detail {
  min-height: 300px;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #6b7482;
    cursor: pointer;

    &:hover {
      color: #2f6fed;
    }
  }

  &__card {
    padding: 28px 32px 36px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #eef1f5;
  }

  &__title {
    margin: 0 0 14px;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.45;
    color: #1c2333;
  }

  &__meta {
    display: flex;
    gap: 18px;
    font-size: 12px;
    color: #98a1ae;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  &__content {
    font-size: 15px;
    line-height: 1.9;
    color: #33394a;
    // 正文是纯文本，保留用户在编辑器里敲的换行
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
