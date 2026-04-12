# 妙妙屋 Chat V2 Web

基于 Vue 3 + Vite + TypeScript + Pinia + Element Plus 重构的聊天室前端，包含用户端与管理端，对接现有后端 `chat_java`。

## 项目概览

- 用户端：登录、注册、群聊、私聊、机器人会话、消息结构化渲染
- 管理端：用户管理、群聊记录、私聊记录、知识库管理、系统提示词、意见反馈、用户举报、AI 上下文管理
- 状态管理：Pinia 管理登录态与聊天状态，并做本地持久化
- 可视化能力：支持 Mermaid、表格、图表等 AI 结构化内容渲染
- UI 风格：Vue 3 + Tailwind + Element Plus，已完成一轮现代化界面改造

## 技术栈

- Vue 3
- Vite 5
- TypeScript
- Pinia
- Vue Router
- Element Plus（已接入中文 locale）
- Tailwind CSS
- STOMP / SockJS
- Mermaid / ECharts / Marked

## 目录说明

```text
src/
	components/      通用组件、聊天组件、AI 渲染组件
	stores/          Pinia 状态管理
	views/
		chat/          用户端页面
		admin/         管理端页面
	utils/           请求、解析、通知等工具函数
public/            静态资源
```

完整改造规划可见 [CHATROOM_V2_PLAN.md](./CHATROOM_V2_PLAN.md)。

## 环境配置

复制环境变量文件并按实际后端地址修改：

```bash
cp .env.example .env.local
```

`.env.example` 示例：

```env
VITE_APP_API_BASE=https://aprillie.online
```

说明：

- 本地直连 Java 后端时可改为 `http://localhost:8082`
- 开发环境下 `/api`、`/ws` 会通过 Vite 代理转发到 `VITE_APP_API_BASE`

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认启动在：

```text
http://localhost:5173
```

如果端口被占用，Vite 会自动递增到 5174、5175 等可用端口。

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 当前已完成的主要改动

- 用户登录页与管理端登录页视觉重构
- 管理端整体布局、侧栏、欢迎页、搜索区和表格页统一
- 管理端欢迎页支持背景图主视觉
- 网站 favicon 切换为 `public/chat.png`
- 登录态从直接读写 `sessionStorage` 迁移到 Pinia store
- Element Plus 默认文案改为中文
- 确认弹窗按钮统一为“确定 / 取消”
- AI 上下文管理页已接入管理端
- TypeScript 配置与编辑器诊断问题已清理

## 后端依赖

本项目默认对接同工作区内的 `chat_java` 后端。若需完整运行，请确保后端接口、WebSocket、知识库相关服务已可用。

## 推荐 Node 版本

- Node.js 18+
- 推荐 Node.js 20 LTS

## License

仅供当前项目开发与学习使用。
