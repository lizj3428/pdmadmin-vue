<template>
  <div v-loading="loading" class="stu-profile">
    <div class="stu-profile__card">
      <div class="stu-profile__head">
        <div class="stu-profile__avatar">{{ (profile.realName || '同').slice(0, 1) }}</div>
        <div>
          <div class="stu-profile__name">{{ profile.realName || '—' }}</div>
          <div class="stu-profile__sub">{{ profile.studentNo }}</div>
        </div>
      </div>

      <div class="stu-profile__grid">
        <div class="stu-profile__row">
          <span class="stu-profile__label">性别</span>
          <span>{{ profile.gender || '—' }}</span>
        </div>
        <div class="stu-profile__row">
          <span class="stu-profile__label">年级</span>
          <span>{{ profile.grade || '—' }}</span>
        </div>
        <div class="stu-profile__row">
          <span class="stu-profile__label">专业</span>
          <span>{{ profile.major || '—' }}</span>
        </div>
        <div class="stu-profile__row">
          <span class="stu-profile__label">班级</span>
          <span>{{ profile.className || '—' }}</span>
        </div>
        <div class="stu-profile__row">
          <span class="stu-profile__label">手机号</span>
          <span>{{ profile.phone || '—' }}</span>
        </div>
        <div class="stu-profile__row">
          <span class="stu-profile__label">接收渠道</span>
          <span>{{ channelName(profile.pushChannel) }}</span>
        </div>
      </div>
    </div>

    <div class="stu-profile__card">
      <div class="stu-profile__section-title">我的订阅</div>
      <p class="stu-profile__hint">
        订阅标签后，管理员发布的资讯只要带这些标签，就会直接推送到你的消息中心。不订阅则收不到定向推送。
      </p>

      <div v-if="tagList.length === 0" class="stu-profile__empty">暂无可用标签</div>

      <el-checkbox-group v-else v-model="selectedTags" class="stu-profile__tags">
        <el-checkbox
          v-for="t in tagList"
          :key="t.id"
          :value="t.id"
          :label="t.id"
          border
          size="small"
          >{{ t.name }}</el-checkbox
        >
      </el-checkbox-group>

      <div class="stu-profile__actions">
        <el-button type="primary" :loading="saving" @click="save">保存订阅</el-button>
        <el-button @click="reset">重置</el-button>
        <span class="stu-profile__count">已选 {{ selectedTags.length }} 个</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { stuApi } from '@/api/stu-api'

const loading = ref(false)
const saving = ref(false)
const profile = reactive<any>({})
const tagList = ref<any[]>([])
const selectedTags = ref<number[]>([])

function channelName(v: any) {
  if (v === 2) {
    return '微信'
  }
  if (v === 3) {
    return '站内信 + 微信'
  }
  return '站内信'
}

async function loadAll() {
  loading.value = true
  try {
    const [p, t, s]: any = await Promise.all([
      stuApi.profile(),
      stuApi.tags(),
      stuApi.subscribeList(),
    ])
    Object.assign(profile, p.data || {})
    tagList.value = t.data || []
    // 只回填标签订阅（targetType=2）；分类订阅是预留能力，个人中心暂不展示
    selectedTags.value = (s.data || [])
      .filter((item: any) => item.targetType === 2)
      .map((item: any) => item.targetId)
  } catch {
    ElMessage.error('加载个人信息失败')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await stuApi.saveSubscribe(2, selectedTags.value)
    ElMessage.success('订阅已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function reset() {
  loadAll()
}

onMounted(loadAll)
</script>

<style scoped lang="less">
.stu-profile {
  &__card {
    padding: 22px 24px;
    margin-bottom: 14px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #eef1f5;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 18px;
    border-bottom: 1px solid #f0f3f7;
  }

  &__avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #2f6fed;
    color: #fff;
    font-size: 18px;
    line-height: 46px;
    text-align: center;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
    color: #1c2333;
  }

  &__sub {
    margin-top: 2px;
    font-size: 12px;
    color: #98a1ae;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px 24px;
    padding-top: 18px;
  }

  &__row {
    display: flex;
    gap: 10px;
    font-size: 13px;
    color: #33394a;
  }

  &__label {
    flex: none;
    width: 56px;
    color: #98a1ae;
  }

  &__section-title {
    font-size: 15px;
    font-weight: 500;
    color: #1c2333;
  }

  &__hint {
    margin: 8px 0 16px;
    font-size: 12px;
    line-height: 1.7;
    color: #8b95a5;
  }

  &__empty {
    font-size: 13px;
    color: #a0a8b5;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    :deep(.el-checkbox) {
      margin-right: 0;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
  }

  &__count {
    font-size: 12px;
    color: #a0a8b5;
  }
}
</style>
