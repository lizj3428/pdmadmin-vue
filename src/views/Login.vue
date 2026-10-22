<template>
    <div class="login-container">
        <div class="login-container-content">
            <div class="login-container-content-bg">
                <div class="login-container-content-top">
                    <div>
                        <div style="text-align: center; padding-bottom: 25px;"><img alt="logo" class="login-logo"
                                src="../assets/images/login/logo.png"></div>
                        <span class="login-title"> 潘多码后台管理系统 </span>
                    </div>
                </div>

                <div class="login-container-content-main">
                    <el-form :model="form" ref="formRef" :rules="rules" size="large">
                        <el-form-item prop="username" height="80px;">
                            <el-input :prefix-icon="User" style="width: 368px;height: 40px;font-size: 16px;;"
                                placeholder="用户名"   />
                        </el-form-item>
                        <el-form-item prop="userpwd">
                            <el-input :prefix-icon="Lock" style="width: 368px;height: 40px;font-size: 16px;;"
                                placeholder="密码"  show-password 
                                type="password" />
                        </el-form-item>
                        <el-form-item prop="captchaCode">
                            <div style="display: flex; justify-items: flex-start;">
                                <el-input style="width: 268px;height: 40px;font-size: 16px;" placeholder="验证码"
                                   />

                             
                            </div>


                        </el-form-item>


                        <el-form-item>
                            <el-button style="width: 368px;height: 40px;font-size: 16px;;" type="primary"
                                :loading="btnLoading" @click="onSubmit">登 录</el-button>
                        </el-form-item>


                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
 
</script>
<style lang="less">
@import '../styles/login.less';
</style>