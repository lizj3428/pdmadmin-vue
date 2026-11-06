<template>
  <div class="stat-page">
    <!-- ============ 页头 ============ -->
    <div class="page-head">
      <div>
        <div class="page-title">数据统计</div>
        <div class="page-sub">资讯、用户、推送三维度实时聚合，切换天数只影响趋势图</div>
      </div>
      <div class="head-actions">
        <el-radio-group v-model="days" size="default">
          <el-radio-button :value="7">近 7 天</el-radio-button>
          <el-radio-button :value="14">近 14 天</el-radio-button>
          <el-radio-button :value="30">近 30 天</el-radio-button>
        </el-radio-group>
        <el-button type="primary" :loading="loading" @click="loadAll()">刷新</el-button>
      </div>
    </div>

    <!-- ============ 四项关键指标 ============ -->
    <el-row :gutter="12" v-loading="loading">
      <el-col :span="6" v-for="k in keyCards" :key="k.label">
        <div class="mini-card">
          <div class="mini-label">{{ k.label }}</div>
          <div class="mini-value" :style="{ color: k.color }">{{ k.value }}</div>
          <div class="mini-extra">{{ k.extra }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- ============ 第一行：分类分布 + 阅读排行 ============ -->
    <el-row :gutter="12" style="margin-top: 12px">
      <el-col :span="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-head">
              <span>各分类资讯数量</span>
              <el-tag size="small" type="info">含 0 条分类</el-tag>
            </div>
          </template>
          <VChart v-if="categoryData.length" :option="categoryOption" autoresize class="chart" />
          <el-empty v-else description="暂无分类数据" :image-size="80" />
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-head">
              <span>阅读量 Top 10</span>
              <el-tag size="small" type="warning">按 view_count 倒序</el-tag>
            </div>
          </template>
          <VChart v-if="topNews.length" :option="topOption" autoresize class="chart" />
          <el-empty v-else description="暂无资讯" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <!-- ============ 第二行：推送趋势 + 状态分布 ============ -->
    <el-row :gutter="12" style="margin-top: 12px">
      <el-col :span="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-head">
              <span>近 {{ days }} 天推送趋势</span>
              <el-tag size="small" type="success">成功 {{ sumBy('successCount') }} / 失败 {{ sumBy('failCount') }}</el-tag>
            </div>
          </template>
          <VChart v-if="pushData.length" :option="pushOption" autoresize class="chart" />
          <el-empty v-else description="所选区间内没有推送记录" :image-size="80" />
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-head">
              <span>推送发送状态分布</span>
              <el-tag size="small" type="info">共 {{ pushStatusTotal }} 条</el-tag>
            </div>
          </template>
          <VChart v-if="pushStatusData.length" :option="statusOption" autoresize class="chart" />
          <el-empty v-else description="暂无推送记录" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <!-- ============ 第三行：学生增长 ============ -->
    <el-card shadow="never" class="chart-card" style="margin-top: 12px">
      <template #header>
        <div class="chart-head">
          <span>近 {{ days }} 天新增学生</span>
          <el-tag size="small" type="primary">累计 {{ sumBy2('cnt') }} 人</el-tag>
        </div>
      </template>
      <VChart v-if="studentData.length" :option="studentOption" autoresize class="chart tall" />
      <el-empty v-else description="所选区间内没有新增学生" :image-size="80" />
    </el-card>

    <!-- ============ 明细表 ============ -->
    <el-card shadow="never" style="margin-top: 12px">
      <template #header>
        <div class="chart-head">
          <span>阅读量排行明细</span>
          <span class="tip">published_time 为空的资讯显示「未发布」</span>
        </div>
      </template>
      <el-table :data="topNews" border stripe size="small">
        <el-table-column header-align="center" align="center" type="index" label="排名" width="70" />
        <el-table-column header-align="center" align="center" prop="id" label="ID" width="70" />
        <el-table-column header-align="center" align="center" prop="title" label="标题" show-overflow-tooltip />
        <el-table-column header-align="center" align="center" prop="viewCount" label="阅读量" width="110" sortable />
        <el-table-column header-align="center" align="center" label="发布时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.publishTime) || '未发布' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { statApi } from '@/api/stat-api'

import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, LineChart, BarChart, TooltipComponent, LegendComponent, GridComponent])

const loading = ref(false)
const days = ref(7)

const overview = ref<any>({})
const categoryData = ref<any[]>([])
const topNews = ref<any[]>([])
const pushData = ref<any[]>([])
const pushStatusData = ref<any[]>([])
const studentData = ref<any[]>([])

// ================= 指标卡 =================
const keyCards = computed(() => [
  {
    label: '资讯总量',
    value: overview.value.newsTotal ?? 0,
    extra: `已发布 ${overview.value.newsPublished ?? 0} · 待审核 ${overview.value.newsPending ?? 0}`,
    color: '#409eff',
  },
  {
    label: '累计阅读量',
    value: overview.value.viewTotal ?? 0,
    extra: '全部资讯阅读次数之和',
    color: '#f56c6c',
  },
  {
    label: '推送成功人次',
    value: overview.value.pushSuccess ?? 0,
    extra: `总人次 ${overview.value.pushTotal ?? 0}`,
    color: '#67c23a',
  },
  {
    label: '注册学生',
    value: overview.value.studentTotal ?? 0,
    extra: `启用 ${overview.value.studentActive ?? 0} 人 · 教师 ${overview.value.teacherTotal ?? 0} 人`,
    color: '#e6a23c',
  },
])

const pushStatusTotal = computed(() =>
  pushStatusData.value.reduce((s: number, d: any) => s + Number(d.cnt || 0), 0)
)

// ================= 图表配置 =================
const categoryOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 条（{d}%）' },
  legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#606266' } },
  series: [
    {
      type: 'pie',
      radius: ['40%', '66%'],
      center: ['50%', '44%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { formatter: '{b}\n{c} 条', color: '#606266', fontSize: 11 },
      data: categoryData.value.map((c: any) => ({ name: c.categoryName, value: Number(c.cnt) })),
    },
  ],
}))

const topOption = computed(() => {
  // 横向柱状图从下往上画，倒序一次让阅读量最高的排最上面
  const rows = [...topNews.value].reverse()
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 40, top: 10, bottom: 10, containLabel: true },
    xAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#909399' }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
    yAxis: {
      type: 'category',
      data: rows.map((n: any) => (String(n.title).length > 12 ? String(n.title).slice(0, 12) + '…' : n.title)),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#79bbff' },
              { offset: 1, color: '#409eff' },
            ],
          },
        },
        label: { show: true, position: 'right', color: '#606266', fontSize: 11 },
        data: rows.map((n: any) => Number(n.viewCount)),
      },
    ],
  }
})

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
      name: '成功',
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

const STATUS_TEXT: any = { 0: '待发送', 1: '已提交', 2: '已送达', 3: '发送失败' }
const STATUS_COLOR: any = { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' }
const STATUS_HEX: any = { 0: '#909399', 1: '#409eff', 2: '#67c23a', 3: '#f56c6c' }

const statusOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 条（{d}%）' },
  legend: {
    bottom: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { color: '#606266' },
    formatter: (name: string) => `${name}：${statusCount(name)} 条`,
  },
  series: [
    {
      type: 'pie',
      radius: ['48%', '70%'],
      center: ['50%', '44%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{c}', color: '#606266', fontSize: 11 },
      data: pushStatusData.value.map((d: any) => ({
        name: STATUS_TEXT[d.sendStatus] || `状态${d.sendStatus}`,
        value: Number(d.cnt),
        itemStyle: { color: STATUS_HEX[d.sendStatus] || '#c0c4cc' },
      })),
    },
  ],
}))

function statusCount(name: string) {
  const hit = pushStatusData.value.find((d: any) => (STATUS_TEXT[d.sendStatus] || `状态${d.sendStatus}`) === name)
  return hit ? Number(hit.cnt) : 0
}

const studentOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 40, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: studentData.value.map((d: any) => String(d.statDate).slice(5)),
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
      name: '新增学生',
      type: 'bar',
      barWidth: '45%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#95d475' },
            { offset: 1, color: '#67c23a' },
          ],
        },
      },
      label: { show: true, position: 'top', color: '#606266', fontSize: 11 },
      data: studentData.value.map((d: any) => Number(d.cnt)),
    },
  ],
}))

// ================= 工具 =================
function sumBy(key: string) {
  return pushData.value.reduce((s: number, d: any) => s + Number(d[key] || 0), 0)
}

function sumBy2(key: string) {
  return studentData.value.reduce((s: number, d: any) => s + Number(d[key] || 0), 0)
}

function formatTime(v: any) {
  if (!v) return ''
  return String(v).replace('T', ' ')
}

// ================= 加载 =================
async function loadAll() {
  loading.value = true
  try {
    const [ov, cat, top, push, status] = await Promise.all([
      statApi.overview(),
      statApi.newsByCategory(),
      statApi.newsTop(10),
      statApi.pushDaily(days.value),
      statApi.pushStatus(),
    ])
    overview.value = (ov as any).data || {}
    categoryData.value = (cat as any).data || []
    topNews.value = (top as any).data || []
    pushData.value = (push as any).data || []
    pushStatusData.value = (status as any).data || []
    await loadStudent()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadStudent() {
  try {
    const res: any = await statApi.studentDaily(days.value)
    studentData.value = res.data || []
  } catch (e) {
    studentData.value = []
  }
}

/** 切天数只重新拉两条趋势，其余指标与天数无关，不必重复请求 */
watch(days, async () => {
  loading.value = true
  try {
    const [push] = await Promise.all([statApi.pushDaily(days.value)])
    pushData.value = (push as any).data || []
    await loadStudent()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.stat-page {
  padding: 4px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 18px;
  margin-bottom: 12px;
}

.mini-label {
  font-size: 13px;
  color: #909399;
}

.mini-value {
  font-size: 30px;
  font-weight: 600;
  line-height: 1.35;
  margin: 4px 0 2px;
}

.mini-extra {
  font-size: 12px;
  color: #c0c4cc;
}

.chart-card :deep(.el-card__body) {
  padding: 8px 12px 12px;
}

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.tip {
  font-size: 12px;
  font-weight: 400;
  color: #c0c4cc;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart.tall {
  height: 240px;
}
</style>
