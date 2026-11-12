# pdmadmin-vue

校园资讯推送平台前端。一套代码含三个端，共用同一套登录页和组件库。

| 路径 | 端 | 内容 |
|---|---|---|
| `/index` | 管理端 | 资讯、审核、推送、统计、分类标签、用户管理 |
| `/tch` | 教师端 | 投稿、我的投稿 |
| `/stu` | 学生端 | 浏览资讯、订阅、站内消息、个人中心 |

登录页按「管理员 / 教师 / 学生」切换身份；教师、学生只有被授予管理端权限（后端 `admin_flag = 1`）才放行进管理端，否则进各自的端。

## 技术栈

| 组件 | 版本 | 说明 |
|---|---|---|
| Vue | 3.5 | `<script setup lang="ts">`，不使用 Options API |
| TypeScript | 6.0 | 类型检查用 `vue-tsc` |
| Vite | 8.2 | 开发服务器与构建 |
| Element Plus | 2.14 | **全量引入**，组件与图标已全局注册，业务代码不 import |
| Pinia | 4 | 状态管理（`stores/admin.ts` 存登录态） |
| Vue Router | 5 | 路由集中在 `router/index.ts` |
| Axios | 1.20 | 统一经 `@/utils/request` 封装 |
| ECharts | 6 + vue-echarts | 统计图表 |
| Less | 4.9 | 样式 |

## 目录结构

```
src/
├── api/          每模块一个文件，导出 xxxApi 对象，只做转发
├── components/   Header / LeftMenu / TchMenu / Footer
├── router/       index.ts 单文件，所有路由与守卫
├── stores/       Pinia（admin.ts：token、身份、用户 id、adminFlag）
├── styles/       style.less 全局样式
├── utils/        request.ts / constants.ts / websocket.ts / utils.ts
└── views/
    ├── Login.vue         三身份登录
    ├── Index.vue         管理端布局
    ├── news/             List / Audit
    ├── push/             Task / Record
    ├── stat/             Index
    ├── admin|student|teacher|category|tag/
    ├── tch/              教师端：Index / NewsList
    └── stu/              学生端：Home / Index / NewsDetail / Message / Profile
```

## 快速开始

### 环境要求

- Node.js `^22.18.0` 或 `>= 24.12.0`（见 `package.json` 的 `engines`）
- 后端服务已启动（默认 http://127.0.0.1:8080/pdmadmin）

### 安装与运行

```bash
npm install
npm run dev
```

默认地址 http://localhost:5173 。

前端请求直接打绝对地址（`VITE_APP_API_URL`），不走 Vite 代理，跨域由后端的 `CorsConfig` 处理。

## 环境变量

`.env.development`（开发）与 `.env.production`（生产构建）：

| 变量 | 说明 |
|---|---|
| `VITE_APP_API_URL` | 后端根地址，如 `http://127.0.0.1:8080/pdmadmin` |
| `VITE_APP_WS_URL` | WebSocket 地址，如 `ws://127.0.0.1:8080/pdmadmin/ws` |
| `VITE_APP_TITLE` | 页面标题 |
| `NODE_ENV` | 环境标识 |

> 注意：这两个文件里的 `NODE_ENV` 和 `VITE_APP_TITLE` 目前是写反的（development 标的是生产、production 标的是开发）。部署前按实际环境改正，否则标题与构建判断都会错。

## 构建与检查

```bash
npm run build       # type-check 与 vite build 并行，任一失败即整体失败
npm run type-check  # 仅类型检查
npm run test:unit   # Vitest
npm run lint        # oxlint + eslint
npm run format      # prettier
```

`npm run build` 会先跑 `vue-tsc`，类型不过就出不了包。

## 测试账号

与后端种子数据一致（密码均为 `123456`）：

| 身份 | 账号 |
|---|---|
| 管理员 | `admin` |
| 教师 | `T001`（普通）、`T002`（有管理端权限） |
| 学生 | `20230101` / `20230102` / `20220103` |

教师种子在后端的 `sql/upgrade_admin_flag.sql` 里，需要先执行该脚本才存在。

## 接口调用约定

```ts
import { post } from '@/utils/request'

export const newsApi = {
  list: (param: any, pageNum: number, pageSize: number) =>
    post(`/news/list?pageNum=${pageNum}&pageSize=${pageSize}`, param),
}
```

- 后端全部 POST，分页参数走 query，业务参数走 body
- token 存 localStorage，请求头 `pdmtoken` 由拦截器自动加，业务代码不要手动设置
- 拦截器已统一处理未登录 / 被顶下线（`11011`、`11012`），业务代码不要重复判断

## 开发约定

见 [AGENTS.md](AGENTS.md)：目录组织、api 层写法、路由注册、UI 使用、修改规则与自检项都在那里，改代码前先读。
