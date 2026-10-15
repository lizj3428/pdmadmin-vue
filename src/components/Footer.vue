<template>
  <div class="version">
    <a target="_blank" class="copyright" href="https://github.com/lizj3428"> ©2026-{{ currentYear }} </a>
    <a target="_blank" class="version" href="https://github.com/lizj3428"> 校园资讯推送平台github </a>
  </div>
</template>

<!--动态获取当前年份-->
<script setup>
  import dayjs from 'dayjs';
  const currentYear = dayjs().year();
</script>

<style lang="less" scoped>
  .version,.copyright {
    font-size: 14px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
  }
  a:hover {
    color:#0a0e14;
  }
</style>
