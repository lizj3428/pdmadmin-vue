<template>
  <div class="login-container">
    <div class="login-container-content">
      <div class="login-container-content-bg">
        <div class="login-container-content-top">
          <div>
            <div style="text-align: center; padding-bottom: 25px">
              <img alt="" class="login-logo" src="/campus-mark.svg" width="60" height="60" />
            </div>
            <h1 class="login-title">校园资讯推送平台</h1>
            <p class="login-subtitle">请选择身份登录</p>
          </div>
        </div>

        <div class="login-container-content-main">
          <el-form :model="form" ref="formRef" :rules="rules" size="large">
            <!-- 身份选择：管理员用账号+验证码；教师用教工号；学生用学号 -->
            <el-form-item>
              <el-radio-group v-model="form.identity" style="width: 368px" @change="onIdentityChange">
                <el-radio-button value="admin" style="width: 122px">管理员</el-radio-button>
                <el-radio-button value="teacher" style="width: 122px">教师</el-radio-button>
                <el-radio-button value="student" style="width: 122px">学生</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item prop="username" height="80px;">
              <el-input
                :prefix-icon="User"
                v-model="form.username"
                style="width: 368px; height: 40px; font-size: 16px"
                :placeholder="accountPlaceholder"
              />
            </el-form-item>
            <el-form-item prop="userpwd">
              <el-input
                :prefix-icon="Lock"
                v-model="form.userpwd"
                style="width: 368px; height: 40px; font-size: 16px"
                placeholder="密码"
                show-password
                type="password"
              />
            </el-form-item>
            <!-- 验证码只给管理员：教师、学生端前端没有识图组件，靠 BCrypt + token 有效期保证 -->
            <el-form-item prop="captchaCode" v-if="form.identity === 'admin'">
              <div style="display: flex; justify-items: flex-start">
                <el-input
                  v-model="form.captchaCode"
                  style="width: 268px; height: 40px; font-size: 16px"
                  placeholder="验证码"
                />

                <img class="captcha-img" :src="captchaImage" @click="getCaptcha" />
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                style="width: 368px; height: 40px; font-size: 16px"
                type="primary"
                :loading="btnLoading"
                @click="onSubmit"
                >登 录</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue'
// 引入必要的 Vue API 和常量配置
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { commonApi } from '@/api/common-api'
import { adminApi } from '@/api/admin-api'
import { teacherApi } from '@/api/teacher-api'
import { studentApi } from '@/api/student-api'
import { saveLocalStorage } from '@/utils/utils'
import Constants from '@/utils/constants'
import { useAdminStore } from '@/stores/admin'

// 路由对象，用于登录成功后跳转页面
const router = useRouter()

//--------------------- 验证码 ---------------------------------
const captchaImage = ref('')
// 表单组件
const formRef = ref()
const btnLoading = ref(false)
//获取验证码
async function getCaptcha() {
  try {
    let captchaResult = await commonApi.getCaptcha()
    captchaImage.value = captchaResult.data.captchaImage
    form.captchaId = captchaResult.data.captchaId
  } catch (e) {
    console.log(e)
  }
}

// --------------------- 登录表单 ---------------------

//表单
let form = reactive({
  identity: 'admin' as string, // admin / teacher / student
  username: '',
  userpwd: '',
  captchaId: undefined as any,
  captchaCode: '',
})

// 账号输入框的提示语随身份变化
const accountPlaceholder = computed(() => {
  if (form.identity === 'teacher') return '教工号'
  if (form.identity === 'student') return '学号'
  return '管理员账号'
})

// 验证码只有管理员需要，校验规则跟着身份走
const rules = computed(() => {
  const base: any = {
    username: [{ required: true, message: '请输入' + accountPlaceholder.value, trigger: 'blur' }],
    userpwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  }
  if (form.identity === 'admin') {
    base.captchaCode = [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }
  return base
})

// 切换身份：清空已填内容；切回管理员要重新取一张验证码
function onIdentityChange() {
  form.username = ''
  form.userpwd = ''
  form.captchaCode = ''
  if (form.identity === 'admin') {
    getCaptcha()
  }
}

async function onSubmit() {
  await formRef.value.validate().then(async () => {
    try {
      btnLoading.value = true
      let result: any
      if (form.identity === 'admin') {
        result = await adminApi.login(form)
      } else if (form.identity === 'teacher') {
        result = await teacherApi.login({ teacherNo: form.username, password: form.userpwd })
      } else {
        result = await studentApi.login({ studentNo: form.username, password: form.userpwd })
      }

      // 先存登录信息：普通教师也要 token 才能调 /tch/* 的投稿接口
      useAdminStore().setAdminInfo(result.data, form.identity)

      // 管理员账号天然有管理端权限；教师、学生必须被授权过（adminFlag=1）才放行
      const canManage = form.identity === 'admin' || result.data.adminFlag === 1
      if (canManage) {
        ElMessage.success('登录成功')
        router.push('/index')
        return
      }

      if (form.identity === 'teacher') {
        // 普通教师进教师端投稿，那边只能用 /tch/* 接口
        ElMessage.success('登录成功，进入教师投稿端')
        router.push('/tch')
        return
      }

      // 普通学生进学生端：看资讯、收推送、管订阅
      ElMessage.success('登录成功')
      router.push('/stu/home')
    } catch (e: any) {
      // 只有管理员登录才刷新验证码，教师/学生没有验证码
      if (form.identity === 'admin' && e.data && e.data != 200) {
        getCaptcha()
      }
    } finally {
      btnLoading.value = false
    }
  })
}

onMounted(getCaptcha)
</script>
<style lang="less">
@import '../styles/login.less';
</style>
