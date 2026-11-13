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

      <div class="stu-detail__actions">
        <el-button :type="collected ? 'primary' : ''" plain size="small" @click="toggleCollect">
          {{ collected ? '已收藏' : '收藏' }}
        </el-button>
        <el-button plain size="small" @click="scrollToComment">
          评论（{{ comments.length }}）
        </el-button>
        <el-button plain size="small" @click="share">分享</el-button>
      </div>
    </div>

    <div v-if="news" class="stu-detail__comments">
      <h2 class="stu-detail__comments-title">评论（{{ comments.length }}）</h2>

      <div class="stu-detail__comment-form">
        <el-input
          v-model="commentText"
          type="textarea"
          :rows="3"
          maxlength="300"
          show-word-limit
          placeholder="说说你的看法…"
        />
        <div class="stu-detail__comment-submit">
          <el-button type="primary" size="small" :loading="submitting" @click="submitComment">
            发表评论
          </el-button>
        </div>
      </div>

      <div v-if="comments.length" class="stu-detail__comment-list">
        <div v-for="item in comments" :key="item.id" class="stu-detail__comment">
          <div class="stu-detail__comment-head">
            <span class="stu-detail__comment-name">{{ item.studentName }}</span>
            <span class="stu-detail__comment-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <div class="stu-detail__comment-body">{{ item.content }}</div>
        </div>
      </div>
      <el-empty v-else description="还没有评论，来说第一句吧" :image-size="60" />
    </div>

    <el-empty v-else-if="!loading" description="资讯不存在或已下线" />
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { stuApi } from '@/api/stu-api'

const route = useRoute()
const router = useRouter()
const refreshUnread = inject<() => void>('refreshUnread', () => {})

const loading = ref(false)
const news = ref<any>(null)

// 收藏与评论
const collected = ref(false)
const comments = ref<any[]>([])
const commentText = ref('')
const submitting = ref(false)

function formatTime(t: any) {
  if (!t) {
    return ''
  }
  return String(t).replace('T', ' ').slice(0, 16)
}

/** 收藏状态和评论列表跟着资讯一起加载 */
async function loadExtras(id: string) {
  await stuApi.collectStatus(id).then(
    (res: any) => {
      collected.value = !!res?.data?.collected
    },
    () => {},
  )
  await stuApi.commentList(id).then(
    (res: any) => {
      comments.value = res?.data ?? []
    },
    () => {},
  )
}

async function toggleCollect() {
  if (!news.value) {
    return
  }
  try {
    const res: any = await stuApi.toggleCollect(news.value.id)
    collected.value = !!res?.data?.collected
    ElMessage.success(collected.value ? '收藏成功' : '已取消收藏')
  } catch {
    return
  }
}

async function submitComment() {
  const text = commentText.value.trim()
  if (!text) {
    ElMessage.warning('请输入评论内容')
    return
  }
  if (!news.value) {
    return
  }
  submitting.value = true
  try {
    await stuApi.addComment(news.value.id, text)
    commentText.value = ''
    ElMessage.success('评论成功')
    const res: any = await stuApi.commentList(news.value.id)
    comments.value = res?.data ?? []
  } catch {
    return
  } finally {
    submitting.value = false
  }
}

function scrollToComment() {
  const box = document.querySelector('.stu-detail__comments')
  if (box) {
    box.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function share() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.info(window.location.href)
  }
}

watch(
  () => route.params.id,
  async (id, _previousId, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })

    news.value = null
    collected.value = false
    comments.value = []
    commentText.value = ''
    if (typeof id !== 'string' || !id) {
      loading.value = false
      return
    }

    loading.value = true
    try {
      const res: any = await stuApi.newsDetail(id)
      if (!active || !res.data) {
        return
      }
      news.value = res.data
    } catch {
      return
    } finally {
      if (active) {
        loading.value = false
      }
    }

    await stuApi.readMessagesByNews(id).then(refreshUnread, () => {})
    if (active) {
      await loadExtras(id)
    }
  },
  { immediate: true },
)
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

  &__actions {
    display: flex;
    gap: 10px;
    margin-top: 26px;
    padding-top: 18px;
    border-top: 1px solid #f0f2f6;
  }

  &__comments {
    margin-top: 16px;
    padding: 22px 28px 26px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #eef1f5;
    scroll-margin-top: 12px;
  }

  &__comments-title {
    margin: 0 0 14px;
    font-size: 15px;
    font-weight: 500;
    color: #1c2333;
  }

  &__comment-submit {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  &__comment-list {
    margin-top: 18px;
    border-top: 1px solid #f4f6f9;
  }

  &__comment {
    padding: 14px 0;
    border-bottom: 1px solid #f4f6f9;
  }

  &__comment-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__comment-name {
    font-size: 13px;
    font-weight: 500;
    color: #2f6fed;
  }

  &__comment-time {
    font-size: 12px;
    color: #a6aebb;
  }

  &__comment-body {
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.75;
    color: #33394a;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
