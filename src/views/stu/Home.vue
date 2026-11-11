<template>
  <div class="stu-home">
    <div class="stu-home__bar">
      <el-input
        v-model="keyword"
        placeholder="搜索资讯标题"
        clearable
        class="stu-home__search"
        @keyup.enter="search"
        @clear="search"
      >
        <template #append>
          <el-button @click="search">搜索</el-button>
        </template>
      </el-input>

      <el-select
        v-model="tagId"
        placeholder="按标签筛选"
        clearable
        class="stu-home__tag"
        @change="search"
      >
        <el-option v-for="t in tagList" :key="t.id" :label="t.name" :value="t.id" />
      </el-select>

      <el-button v-if="hasFilters && list.length > 0" @click="clearFilters">清除筛选</el-button>
    </div>

    <div class="stu-home__tabs">
      <a
        class="stu-home__tab"
        :class="{ 'is-active': categoryId === null }"
        @click="pickCategory(null)"
      >
        全部
      </a>
      <a
        v-for="c in categoryList"
        :key="c.id"
        class="stu-home__tab"
        :class="{ 'is-active': categoryId === c.id }"
        @click="pickCategory(c.id)"
      >
        {{ c.name }}
      </a>
    </div>

    <div v-loading="loading" class="stu-home__list">
      <el-empty v-if="!loading && loadFailed" description="资讯加载失败，请重试">
        <el-button @click="loadList">重试</el-button>
      </el-empty>
      <el-empty
        v-else-if="!loading && list.length === 0"
        :description="hasFilters ? '没有符合当前条件的资讯' : '暂无已发布资讯'"
      >
        <el-button v-if="hasFilters" type="primary" plain @click="clearFilters">清除筛选</el-button>
      </el-empty>

      <div
        v-for="item in list"
        :key="item.id"
        class="stu-card"
        @click="openDetail(item.id)"
      >
        <div class="stu-card__head">
          <span v-if="item.topFlag === 1" class="stu-card__flag stu-card__flag--top">置顶</span>
          <span v-if="item.level === 3" class="stu-card__flag stu-card__flag--urgent">紧急</span>
          <span v-else-if="item.level === 2" class="stu-card__flag stu-card__flag--important">重要</span>
          <h3 class="stu-card__title">{{ item.title }}</h3>
        </div>
        <p class="stu-card__summary">{{ item.summary || '暂无摘要' }}</p>
        <div class="stu-card__meta">
          <span class="stu-card__cat">{{ categoryName(item.categoryId) }}</span>
          <span>{{ formatTime(item.publishTime || item.createTime) }}</span>
          <span>{{ item.viewCount || 0 }} 次阅读</span>
        </div>
      </div>

      <div v-if="total > 0" class="stu-home__pager">
        <el-pagination
          layout="prev, pager, next"
          background
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { stuApi } from '@/api/stu-api'

const router = useRouter()

const loading = ref(true)
const loadFailed = ref(false)
let latestListRequest = 0
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const keyword = ref('')
const categoryId = ref<number | null>(null)
const tagId = ref<number | string | null>(null)

const submittedFilters = ref({
  title: '',
  categoryId: null as number | null,
  tagId: null as number | string | null,
})
const hasFilters = computed(() => {
  const filters = submittedFilters.value
  return Boolean(filters.title || filters.categoryId !== null || filters.tagId !== null)
})

const categoryList = ref<any[]>([])
const tagList = ref<any[]>([])

function categoryName(id: any) {
  const found = categoryList.value.find((c) => c.id === id)
  return found ? found.name : '未分类'
}

function formatTime(t: any) {
  if (!t) {
    return ''
  }
  // 后端返回的是 2026-11-02T10:09:58 这种，取前 10 位当日期就够了
  return String(t).replace('T', ' ').slice(0, 16)
}

async function loadList() {
  const request = ++latestListRequest
  const filters = submittedFilters.value
  loading.value = true
  loadFailed.value = false
  try {
    const res: any = await stuApi.newsList(
      { title: filters.title || undefined, categoryId: filters.categoryId ?? undefined },
      pageNum.value,
      pageSize.value,
      filters.tagId,
    )
    if (request !== latestListRequest) return
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch {
    if (request !== latestListRequest) return
    loadFailed.value = true
    list.value = []
    total.value = 0
  } finally {
    if (request === latestListRequest) loading.value = false
  }
}

function search() {
  submittedFilters.value = {
    title: keyword.value.trim(),
    categoryId: categoryId.value,
    tagId: tagId.value || null,
  }
  pageNum.value = 1
  loadList()
}

function clearFilters() {
  keyword.value = ''
  categoryId.value = null
  tagId.value = null
  search()
}

function pickCategory(id: number | null) {
  categoryId.value = id
  search()
}

function onPageChange(p: number) {
  if (pageNum.value === p) return
  pageNum.value = p
  loadList()
}

function openDetail(id: any) {
  router.push(`/stu/news/${id}`)
}

async function loadFilterOptions() {
  // 分类和标签只拉一次，后面筛选都复用
  try {
    const [c, t]: any = await Promise.all([stuApi.categories(), stuApi.tags()])
    categoryList.value = c.data || []
    tagList.value = t.data || []
  } catch {
    // 下拉拉不到不影响看列表
  }
}

onMounted(() => {
  loadFilterOptions()
  loadList()
})
</script>

<style scoped lang="less">
.stu-home {
  &__bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__search {
    max-width: 420px;
  }

  &__tag {
    width: 180px;
  }

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__tab {
    padding: 5px 14px;
    border-radius: 14px;
    background: #fff;
    border: 1px solid #e4e8ee;
    font-size: 13px;
    color: #5a6474;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: #2f6fed;
      color: #2f6fed;
    }

    &.is-active {
      background: #2f6fed;
      border-color: #2f6fed;
      color: #fff;
    }
  }

  &__list {
    min-height: 200px;
  }

  &__pager {
    display: flex;
    justify-content: center;
    padding: 20px 0 4px;
  }
}

.stu-card {
  padding: 16px 18px;
  margin-bottom: 10px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eef1f5;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 16px rgba(47, 111, 237, 0.08);
    transform: translateY(-1px);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__flag {
    flex: none;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    line-height: 18px;

    &--top {
      background: #dbeafe;
      color: #1e40af;
    }

    &--urgent {
      background: #fdecec;
      color: #e34d4d;
    }

    &--important {
      background: #fff5e6;
      color: #d98214;
    }
  }

  &__title {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    color: #1c2333;
    line-height: 1.5;
  }

  &__summary {
    margin: 6px 0 10px;
    font-size: 13px;
    color: #6b7482;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #98a1ae;
  }

  &__cat {
    color: #2f6fed;
    background: #eef4ff;
    padding: 1px 8px;
    border-radius: 4px;
  }
}
</style>
