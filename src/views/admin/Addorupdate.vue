<template>
    <el-dialog
    v-model="visible"
    title="Tips"
    width="30%"
   
  >
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">Cancel</el-button>
        <el-button type="primary" @click="visible = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts"> 
import { ref } from 'vue'
//公开父主键可以调用的方法
defineExpose({
  showModal
})
const visible = ref(false);
function showModal() {
  visible.value = true;
}
</script>