<template>
  <div class="dashboard">
    <!-- ============ 页头 ============ -->
    <div class="page-head">
      <div>
        <h1 class="page-title">数据看板</h1>
        <div class="page-sub">校园资讯推送平台 · 实时聚合数据</div>
      </div>
      <el-button :loading="loading" @click="loadAll()">刷新数据</el-button>
    </div>

    <!-- ============ 指标卡片 ============ -->
    <section v-for="group in cardGroups" :key="group.title" class="stat-group">
      <h2 class="stat-group__title">{{ group.title }}</h2>
      <div class="stat-grid">
        <component
          :is="card.to ? 'button' : 'div'"
          v-for="card in group.items"
          :key="card.key"
          :type="card.to ? 'button' : undefined"
          class="stat-card"
          :class="{ 'stat-card--primary': group.primary, clickable: card.to }"
          @click="card.to && go(card.to)"
        >
          <span class="stat-label">{{ card.label }}</span>
          <span class="stat-value">{{ card.value }}</span>
          <span class="stat-extra">{{ card.extra }}</span>
        </component>
      </div>
    </section>

    <!-- ============ 图表区 ============ -->
    <el-row :gutter="12" style="margin-top: 12px">
      <el-col :xs="24" :sm="24" :lg="10" class="chart-column">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-head">
              <span>分类资讯分布</span>
              <el-tag size="small" type="info">{{ categoryData.length }} 个分类</el-tag>
            </div>
          </template>
          <VChart v-if="categoryData.length" :option="categoryOption" autoresize class="chart" />
          <el-empty v-else description="暂无分类数据" :image-size="80" />
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :lg="14" class="chart-column">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-head">
              <span>近 7 天推送趋势</span>
              <el-tag size="small" type="info">已提交或送达 {{ sumBy('successCount') }} 条</el-tag>
            </div>
          </template>
          <VChart v-if="pushData.length" :option="pushOption" autoresize class="chart" />
          <el-empty v-else description="暂无推送记录" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <!-- ============ 阅读排行 ============ -->
    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="chart-head">
          <span>阅读量 Top 5</span>
          <el-tag size="small" type="info">按阅读量排序</el-tag>
        </div>
      </template>
      <el-table :data="topNews" border stripe size="small" v-loading="loading">
        <el-table-column header-align="center" align="center" prop="id" label="ID" width="70" />
        <el-table-column header-align="center" align="center" prop="title" label="标题" show-overflow-tooltip />
        <el-table-column header-align="center" align="center" prop="viewCount" label="阅读量" width="110">
          <template #default="scope">
            <el-tag size="small" type="warning">{{ scope.row.viewCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column header-align="center" align="center" label="发布时间" width="170">
          <template #default="scope">
            {{ formatTime(scope.row.publishTime) || '未发布' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { statApi } from '@/api/stat-api'

import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, LineChart, TooltipComponent, LegendComponent, GridComponent])

const router = useRouter()

const loading = ref(false)
const overview = ref<any>({})
const categoryData = ref<any[]>([])
const pushData = ref<any[]>([])
const topNews = ref<any[]>([])

// ================= 卡片 =================
const cards = computed(() => [
  {
    key: 'pending',
    label: '待审核',
    value: overview.value.newsPending ?? 0,
    extra: '进入审核页 →',
    to: '/index/news-audit',
    primary: true,
  },
  {
    key: 'news',
    label: '已发布资讯',
    value: overview.value.newsPublished ?? 0,
    extra: `共 ${overview.value.newsTotal ?? 0} 条资讯`,
    primary: true,
  },
  {
    key: 'task',
    label: '推送任务',
    value: overview.value.taskTotal ?? 0,
    extra: '含立即与定时推送',
    primary: true,
  },
  {
    key: 'msg',
    label: '站内信',
    value: overview.value.msgTotal ?? 0,
    extra: `未读 ${overview.value.msgUnread ?? 0} 条`,
    primary: true,
  },
  {
    key: 'view',
    label: '总阅读量',
    value: overview.value.viewTotal ?? 0,
    extra: '全部资讯累计',
  },
  {
    key: 'student',
    label: '学生用户',
    value: overview.value.studentTotal ?? 0,
    extra: `启用 ${overview.value.studentActive ?? 0} 人`,
  },
  {
    key: 'teacher',
    label: '教师用户',
    value: overview.value.teacherTotal ?? 0,
    extra: '可投稿',
  },
  {
    key: 'push',
    label: '推送人次',
    value: overview.value.pushTotal ?? 0,
    extra: `已提交或送达 ${overview.value.pushSuccess ?? 0} 人次`,
  },
])

const cardGroups = computed(() => [
  { title: '运营概览', primary: true, items: cards.value.filter((card) => card.primary) },
  { title: '其他指标', primary: false, items: cards.value.filter((card) => !card.primary) },
])

// ================= 图表配置 =================
const categoryOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 条（{d}%）' },
  legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#606266' } },
  series: [
    {
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{c} 条', color: '#606266' },
      data: categoryData.value.map((c: any) => ({ name: c.categoryName, value: Number(c.cnt) })),
    },
  ],
}))

const pushOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: '#606266' } },
  grid: { left: 40, right: 20, top: 40, bottom: 30 },
  xAxis: {
    type: 'category',
    data: pushData.value.map((d: any) => String(d.statDate).slice(5)),
    axisLine: { lineStyle: { color: '#dcdfe6' } },
    axisLabel: { color: '#909399' },
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    axisLabel: { color: '#909399' },
    splitLine: { lineStyle: { color: '#f0f2f5' } },
  },
  series: [
    {
      name: '已提交或送达',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      data: pushData.value.map((d: any) => Number(d.successCount)),
      itemStyle: { color: '#67c23a' },
      areaStyle: { color: 'rgba(103,194,58,0.12)' },
    },
    {
      name: '失败',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      data: pushData.value.map((d: any) => Number(d.failCount)),
      itemStyle: { color: '#f56c6c' },
      areaStyle: { color: 'rgba(245,108,108,0.12)' },
    },
  ],
}))

function sumBy(key: string) {
  return pushData.value.reduce((s: number, d: any) => s + Number(d[key] || 0), 0)
}

function formatTime(v: any) {
  if (!v) return ''
  return String(v).replace('T', ' ')
}

function go(path: string) {
  router.push(path)
}

// ================= 加载 =================
async function loadAll() {
  loading.value = true
  try {
    const [ov, cat, push, top] = await Promise.all([
      statApi.overview(),
      statApi.newsByCategory(),
      statApi.pushDaily(7),
      statApi.newsTop(5),
    ])
    overview.value = (ov as any).data || {}
    categoryData.value = (cat as any).data || []
    pushData.value = (push as any).data || []
    topNews.value = (top as any).data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.dashboard {
  padding: 4px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.stat-group {
  margin-bottom: 18px;
}

.stat-group__title {
  margin-bottom: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 168px), 1fr));
  gap: 12px;
}

.stat-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 16px;
  font: inherit;
  text-align: left;
}

.stat-card--primary {
  padding: 16px 18px;
  border-color: #dbe7f7;
  background: #f8fbff;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover,
.stat-card.clickable:focus-visible {
  border-color: #2563eb;
  background: #eff6ff;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #475569;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  margin: 4px 0 2px;
  color: #334155;
}

.stat-card--primary .stat-value {
  font-size: 30px;
  color: #1d4ed8;
}

.stat-extra {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.chart-column {
  margin-bottom: 12px;
}

.chart-card :deep(.el-card__body) {
  padding: 8px 12px 12px;
}

.chart-head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.chart {
  height: 280px;
  width: 100%;
}
</style>
