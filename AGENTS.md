# AGENTS.md — pdmadmin-vue 前端

本文件是本项目的开发约定。修改代码前必读，与本文件冲突时以本文件为准。

## 项目是什么

校园资讯推送平台的前端。一套代码含三个端：

- `/index` — 管理端（资讯、分类、标签、用户管理、推送、统计）
- `/tch` — 教师端（投稿、审核、消息）
- `/stu` — 学生端（浏览资讯、订阅、消息）

## 技术栈

Vue 3.5 + TypeScript + Vite，Element Plus 2.14（**全量引入**），Pinia，Vue Router 5，Axios，ECharts 6 + vue-echarts，Less。

**不引入新依赖、新 UI 库、新状态管理库。**

## 目录结构

```
src/
├── api/       每个模块一个文件，导出 xxxApi 对象
├── views/     按端和模块分目录
├── stores/    Pinia（admin.ts 存登录态）
├── router/    index.ts 单文件，所有路由写这里
├── utils/     request.ts / constants.ts / websocket.ts / utils.ts
├── styles/    style.less（全局）
└── components/
```

## 请求

统一用 `@/utils/request` 导出的 `post`，**不要直接用 axios**。

```ts
import { post } from '@/utils/request'

export const xxxApi = {
  list: (param: any, pageNum: any, pageSize: any) =>
    post(`/xxx/list?pageNum=${pageNum}&pageSize=${pageSize}`, param),
}
```

约定：
- 后端全部是 POST 接口，分页参数走 query，业务参数走 body
- api 函数只做转发，不写业务逻辑、不做数据加工
- 新增接口在对应模块文件里加，不要新建零散文件

### token 与拦截器

- token 存 localStorage，key 用 `Constants.USER_TOKEN`
- 请求头名是 `pdmtoken`，由请求拦截器自动加。**业务代码不要手动设置**
- 响应拦截器已统一处理：
  - `res.code === 11011 / 11012` — 未登录或已在别处登录，自动跳登录页
  - `res.code === 30001` — 特殊提示
  - 业务代码不要再重复判断这两类

## 路由

`router/index.ts` 单文件维护：
- `/index` 管理端，`/tch` 教师端，`/stu` 学生端，各自带 children
- 守卫在 `router.beforeEach`，读 `adminStore.getToken`，无 token 跳 `/login`
- 新增页面：在对应父路由的 `children` 里加，`component` 用动态 import

```ts
{ path: 'news', name: 'News', component: () => import('../views/news/List.vue') }
```

## UI

- Element Plus 已全局注册，直接用 `<el-table>`、`<el-dialog>`、`ElMessage` 等，**不要 import 组件**
- 图标已全局注册，用 `<el-icon><Plus /></el-icon>`
- 中文语言包已配置，不需要重复设置 locale
- 样式：优先 Element Plus 自带类 + `<style scoped lang="less">`，不写全局样式覆盖
- 图表用 `vue-echarts`，不要直接操作 DOM 初始化 echarts

## 修改规则

1. 只改与当前任务相关的文件。不顺手重构、不顺手优化、不顺手改无关文件。
2. 不引入新依赖。确有需要时先说明用途和利弊，等确认后再加。
3. 统一用 `<script setup lang="ts">`，不要用 Options API。
4. 保持现有命名和目录组织方式。
5. 改 api 层的函数签名时，必须同步检查所有调用方。

## 完成前自检

- `npm run build` 通过（内含 type-check）
- 改动 api 时确认调用方已同步
- 新增页面已挂到对应父路由
