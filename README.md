# Research Compass for Robotics

面向机器人领域科研人员的研究工作流管理工具，帮助你从论文阅读到 Idea 孵化再到实验验证，形成完整的科研闭环。

> 🎯 **定位**：不是文献管理工具，而是你的「科研决策辅助工作台」——帮你把读过的论文转化为可验证的研究 Idea。

## ✨ 核心功能

### 🔬 研究子领域管理
- 预设 18 个机器人主流子领域（VLA、SLAM、扩散策略、世界模型等）
- 每个子领域有关注问题和关键词，帮你聚焦研究方向
- 自动统计每个方向的论文数、活跃 Idea、进行中 MVE

### 📄 结构化论文卡片
- 输入 arXiv 链接，自动解析论文元信息
- 一句话总结（你的判断，不是摘要）
- 结构化字段：问题定义、核心贡献、方法概述、实验证据、假设前提、局限性、待验证问题
- 阅读状态 + 判断级别双维度标记
- 关联飞书笔记、代码仓库等外部链接

### 💡 Idea 孵化
- 从论文一键生成 Idea 草稿
- 结构化 Idea 卡片：研究问题、核心假设、为什么重要、正反证据、缺失证据、最大风险
- 支持机器人领域专属字段：任务类型、数据集/场景、基线方法、评估指标

### 🧪 MVE（Minimum Viable Experiment）
- 从 Idea 一键生成最小可行实验设计
- 包含实验目标、变量定义、对照组设置、预期结果、失败信号、时间成本估算
- 追踪实验结果（通过 / 失败 / 进行中）

### 📊 Dashboard 总览
- 全局视角看所有研究方向的进展
- 论文阅读进度、Idea 状态分布、MVE 进行情况一目了然

## 🛠 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| UI | Tailwind CSS + lucide-react |
| 状态管理 | React Context API |
| 数据存储 | localStorage（纯前端，无后端） |
| 部署 | 静态导出 + GitHub Pages |

> **设计原则**：纯前端、无登录、无数据库、无真实 API 调用——打开即用，数据存在你自己的浏览器里。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

### 构建部署

```bash
# 构建静态站点
npm run build

# 本地预览构建结果
npm run start
```

项目配置了 `output: 'export'`，构建产物在 `out/` 目录下，可直接部署到任何静态托管服务（GitHub Pages、Cloudflare Pages、Vercel 等）。

## 📁 项目结构

```
.
├── app/                          # Next.js App Router 页面
│   ├── page.tsx                  # Dashboard 首页
│   ├── areas/                    # 子领域相关页面
│   │   ├── page.tsx              # 子领域列表
│   │   └── [id]/                 # 子领域详情（动态路由）
│   ├── papers/page.tsx           # 论文库
│   ├── idea/[id]/page.tsx        # Idea 详情页
│   └── mve/[id]/page.tsx         # MVE 结果页
├── components/                   # 可复用组件
│   ├── paper/                    # 论文相关组件
│   │   ├── PaperCard.tsx         # 论文卡片（完整/紧凑模式）
│   │   └── AddPaperModal.tsx     # 添加/编辑论文弹窗
│   ├── idea/                     # Idea 相关组件
│   ├── observation/              # 观察相关组件
│   └── ui/                       # 基础 UI 组件
├── context/
│   └── AppContext.tsx            # 全局状态管理
├── lib/
│   ├── types.ts                  # TypeScript 类型定义
│   ├── mockData.ts               # 种子数据
│   ├── mockAI.ts                 # Mock AI 函数
│   └── storage.ts                # localStorage 封装
└── .github/workflows/deploy.yml  # GitHub Pages 自动部署
```

## 🗂 数据模型

### ResearchArea（子领域）
- `name` / `description` / `category`
- `keywords` / `focusQuestions`
- 统计数据（论文数、Idea 数、活跃 MVE）从关联数据派生

### Paper（论文卡片）
- 基本信息：标题、作者、年份、会议、链接
- 阅读管理：`readingStatus`（待读/泛读/精读中/已复盘/暂停）
- 价值判断：`judgementLevel`（背景资料/有用/灵感来源/必复盘）
- 结构化内容：
  - `oneSentenceSummary` — 你的一句话判断
  - `problem` — 解决什么问题
  - `coreContribution` — 核心贡献
  - `methodSketch` — 方法概述
  - `evidence` — 实验证据（任务/基线/指标/结果）
  - `assumptions` — 假设前提
  - `limitations` — 局限性
  - `questionsToVerify` — 待验证问题
  - `relevanceToMyResearch` — 和我研究的关系

### IdeaCard（想法卡片）
- `researchQuestion` / `coreHypothesis` / `whyItMatters`
- 证据：`supportingEvidence` / `opposingEvidence` / `missingEvidence`
- 状态：`rough` → `researching` → `mve_running` → `promising` / `abandoned`
- 机器人专属：`roboticsTask` / `datasetOrScenario` / `baseline` / `evaluationMetric`

### MVE（最小可行实验）
- `experimentGoal` / `minimalDesign`
- `keyVariables`（自变量/因变量）
- `controlGroups` / `expectedOutcome` / `failureSignals`
- `resultStatus`：`pending` / `passed` / `failed`

## 🤖 Mock AI 功能

所有 AI 功能都是模拟的（延迟 500-1500ms），基于模板生成机器人领域的内容：

| 功能 | 说明 |
|------|------|
| arXiv 解析 | 输入 arXiv 链接，自动填充论文信息和结构化字段 |
| 一句话总结 | 基于子领域关键词生成总结建议 |
| 从论文生成 Idea | 基于论文内容和子领域模板生成 Idea 草稿 |
| 生成 MVE | 从 Idea 生成实验设计方案 |
| 假设提取 | 从论文中提取任务/感知/数据/机器人/评估五类假设 |
| 缺口分析 | 分析论文的研究空白（泛化/鲁棒性/效率等） |
| Idea 评估 | 8 维度评分（重要性/新颖性/可测试性/可行性等） |

> 模板覆盖方向：VLA、SLAM、扩散策略、世界模型、对比学习、大模型等。

## 🔄 数据存储

- 所有数据存储在浏览器的 `localStorage` 中
- 存储 key：`research-compass-data-v11`（版本号用于数据迁移）
- 包含去重机制，防止 React Strict Mode 下的重复初始化
- 首次访问会加载种子数据（18 个子领域 + 8 篇示例论文）

## 📦 部署

### GitHub Pages

项目已配置好 GitHub Actions 自动部署工作流（`.github/workflows/deploy.yml`）。

启用方式：
1. 推送代码到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择「GitHub Actions」
4. 每次 push 到 main 分支会自动构建部署

### Cloudflare Pages

1. 将仓库连接到 Cloudflare Pages
2. 构建命令：`npm run build`
3. 输出目录：`out`

## 📝 License

MIT
