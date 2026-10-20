<template>
    <el-dialog
    v-model="visible"
    title="新增"
    width="40%"
  >

  <el-form :rules="rules" :model="form" ref="formRef" label-width="100px">

    <el-form-item label="用户名" prop="username">
      <el-input  v-model="form.username" style="width: 50%;" />
    </el-form-item>

    <el-form-item label="密码" prop="userpwd">
      <el-input v-model="form.userpwd" style="width: 50%;"/>
    </el-form-item>

    <el-form-item label="姓名" prop="name">
      <el-input v-model="form.name" style="width: 50%;"/>
    </el-form-item>

    <el-form-item label="性别" prop="sex">
      <el-select v-model="form.sex" style="width: 50%;"placeholder="请选择性别">
        <el-option label="男" value="男" />
        <el-option label="女" value="女" />
      </el-select>
    </el-form-item>

    <el-form-item label="电话" prop="tel">
      <el-input v-model="form.tel" style="width: 50%;"/>
    </el-form-item>

    <el-form-item label="头像" prop="headurl">
      <el-input v-model="form.headurl" style="width: 50%;"/>
    </el-form-item>

  </el-form>

  
    <span></span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onsubmit()" :loading="btnLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts"> 
import { ref,reactive } from 'vue'
import { adminApi } from '@/api/admin-api'
//公开父主键可以调用的方法
defineExpose({
  showModal
})
const visible = ref(false);
const btnLoading = ref(false);
const emit = defineEmits(['refresh'])
function showModal() {
  visible.value = true;
}
//表单组件
const formRef = ref();
//表单初始值
const formDefault = {
    id: undefined,
    username: undefined,
    userpwd: undefined,
    name: undefined,
    sex: undefined,
    tel: undefined,
    headurl: undefined
 
}
//表单验证规则

let form = reactive({ ...formDefault })
const rules = reactive( {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  userpwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  tel: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  headurl: [{ required: true, message: '请输入头像地址', trigger: 'blur' }]
})
function onsubmit() { 
  btnLoading.value = true;
  formRef.value.validate().then(async () => { 
    adminApi.add(form);
    btnLoading.value = false;
    visible.value = false;
    emit('refresh');
})

  
  console.log("form.username" + form.username)
}

</script>