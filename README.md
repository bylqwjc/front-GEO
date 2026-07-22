# front-GEO

GEO Pulse 是一个面向出海 B2B 品牌的 AI 可见度工作台原型。当前版本使用本地模拟数据，完整覆盖创建检测、运行进度、证据报告、优化任务和复测对比流程。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

## 当前范围

- 可操作的品牌可见度控制台
- 检测配置与 Prompt 编辑
- 本地 API 创建检测任务
- 模拟异步检测进度
- 按引擎筛选的 Prompt 证据报告
- 可更新状态的优化任务看板
- 14 天优化实验前后对比
- 桌面端和移动端响应式布局

## 下一阶段

1. 使用 Supabase PostgreSQL 持久化品牌、检测和回答。
2. 使用 Trigger.dev 执行长时间检测任务。
3. 通过统一 Adapter 接入 ChatGPT Search、Perplexity 和 Gemini。
4. 增加邮箱登录、额度限制、付费和通知。

环境变量模板见 `.env.example`。

## 登录与注册

前端通过 `NEXT_PUBLIC_API_URL` 调用独立后端，使用 HttpOnly Cookie 保持登录状态。
登录页为 `/login`，注册页为 `/register`。
