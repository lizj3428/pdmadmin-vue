<template>
  <div class="pdm-topbar">
    <div class="pdm-topbar__brand">
      <img alt="" src="/campus-mark.svg" width="36" height="36" />
      <span class="pdm-topbar__title">校园资讯推送平台</span>
      <span class="pdm-topbar__section">{{ section }}</span>
    </div>
    <div class="pdm-topbar__account">
      <span class="pdm-topbar__name" :title="admin.name || admin.username">
        {{ admin.name || admin.username }}
      </span>
      <el-tag size="small" effect="dark" type="info">{{ identityName }}</el-tag>
      <button class="pdm-topbar__logout" type="button" @click="loginOut">退出</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { adminApi } from '@/api/admin-api'
import { teacherApi } from '@/api/teacher-api'
import { studentApi } from '@/api/student-api'
import { clearLocalStorage } from '@/utils/utils'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
withDefaults(defineProps<{ section?: string }>(), { section: '管理后台' })
const adminStore = useAdminStore()
const { admin, identity, identityName } = storeToRefs(adminStore)

async function loginOut() {
  try {
    // 三种身份各有各的登出入口，调错接口虽然也能退（底层都是 StpUtil.logout），
    // 但按身份分发更清楚，也避免以后加日志时统计错人
    if (identity.value === 'teacher') {
      await teacherApi.logout()
    } else if (identity.value === 'student') {
      await studentApi.logout()
    } else {
      // 注意：api 里定义的方法名是 logout，不是 loginOut
      await adminApi.logout({})
    }
  } catch (error) {
    console.error('退出登录失败', error)
  } finally {
    // 无论后端是否成功，都清掉本地 token 并跳回登录页
    clearLocalStorage()
    window.location.href = '/login'
  }
}
</script>

<style scoped lang="less">
.pdm-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  box-sizing: border-box;
  padding: 0 24px;
  background: #001529;
  color: #fff;

  &__brand,
  &__account {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__brand img,
  &__account .el-tag,
  &__logout {
    flex-shrink: 0;
  }

  &__title,
  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__section {
    padding-left: 12px;
    border-left: 1px solid #33475b;
    color: #b8c7d6;
    font-size: 13px;
    white-space: nowrap;
  }

  &__name {
    max-width: 160px;
    font-size: 14px;
  }

  &__logout {
    padding: 6px 10px;
    border: 1px solid #40556d;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: #173550;
    }
  }
}

@media (max-width: 600px) {
  .pdm-topbar {
    padding: 0 12px;
    gap: 8px;

    &__brand,
    &__account {
      gap: 8px;
    }

    &__section,
    &__name {
      display: none;
    }

    &__title {
      font-size: 15px;
    }
  }
}
</style>
