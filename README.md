# Research Compass for Robotics

> 🚀 **在线体验**：[https://asandstar.github.io/Research-Compass-for-Robotics/](https://asandstar.github.io/Research-Compass-for-Robotics/)

[![GitHub Pages Deploy](https://github.com/asandstar/Research-Compass-for-Robotics/actions/workflows/deploy.yml/badge.svg)](https://github.com/asandstar/Research-Compass-for-Robotics/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/Next.js-14-blue?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

面向机器人领域科研人员的研究工作流管理工具，帮助你从论文阅读到 Idea 孵化再到实验验证，形成完整的科研闭环。

> 🎯 **定位**：不是文献管理工具，而是你的「科研决策辅助工作台」——帮你把读过的论文转化为可验证的研究 Idea。

## 🎨 界面预览

| Dashboard 总览 | 论文库 | Idea 聚焦 |
|---------------|--------|-----------|
| ![Dashboard](https://github.com/asandstar/Research-Compass-for-Robotics/assets/12345678/a1b2c3d4-e5f6-7890-abcd-ef1234567890) | ![Papers](https://github.com/asandstar/Research-Compass-for-Robotics/assets/12345678/b1c2d3e4-f5a6-7890-bcde-fa1234567890) | ![Focus](https://github.com/asandstar/Research-Compass-for-Robotics/assets/12345678/c1d2e3f4-a5b6-7890-cdef-ab1234567890) |

| AI 科研工作流 | 学习路径 | 论文智识 |
|-------------|---------|---------|
| ![Workflows](https://github.com/asandstar/Research-Compass-for-Robotics/assets/12345678/d1e2f3a4-b5c6-7890-defa-bc1234567890) | ![Learning](https://github.com/asandstar/Research-Compass-for-Robotics/assets/12345678/e1f2a3b4-c5d6-7890-efab-cd1234567890) | ![Intelligence](https://github.com/asandstar/Research-Compass-for-Robotics/assets/12345678/f1a2b3c4-d5e6-7890-fabc-de1234567890) |

## 💡 使用场景

### 场景一：从论文到 Idea
1. 阅读论文 → 写一句话总结 → 提取假设和局限性
2. 系统自动分析研究缺口，生成 Idea 草稿
3. 用三维评估体系（存活度/置信度/证伪强度）评估 Idea 可行性

### 场景二：科研方向探索
1. 浏览 18 个机器人主流子领域（VLA、SLAM、扩散策略、世界模型等）
2. 查看每个方向的代表性论文和活跃研究问题
3. 快速了解领域现状，发现研究机会

### 场景三：实验设计与验证
1. 将 Idea 转化为最小可行实验（MVE）
2. 定义变量、对照组、成功标准、失败信号
3. 追踪实验结果，用证据更新 Idea 评分

### 场景四：科研工作流标准化
1. 使用 6 大科研场景的标准化流程指导
2. 从发现方向到论文写作，全程陪伴
3. 学习路径帮助快速入门新领域

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
- **AI 假设提取**：一键提取论文中的任务/感知/数据/机器人/评估五类假设
- **AI 缺口分析**：自动分析论文的研究空白与潜在机会

### 💡 Idea 孵化
- 从论文一键生成 Idea 草稿
- 结构化 Idea 卡片：研究问题、核心假设、为什么重要、正反证据、缺失证据、最大风险
- 支持机器人领域专属字段：任务类型、数据集/场景、基线方法、评估指标
- **AI Idea 评估**：8 维度评分（重要性/新颖性/可测试性/可行性等）+ 推进/修订/放弃建议
- **手动补充证据**：支持在三栏证据（支持/反对/缺失）中手动添加新证据

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

项目已配置好 GitHub Actions 自动部署工作流（`.github/workflows/deploy.yml`），使用 `peaceiris/actions-gh-pages` 将构建产物推送到 `gh-pages` 分支。

启用方式：
1. 推送代码到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择「Deploy from branch」
4. Branch 选择「gh-pages / (root)」
5. 每次 push 到 main 分支会自动构建并部署

### Cloudflare Pages

1. 将仓库连接到 Cloudflare Pages
2. 构建命令：`npm run build`
3. 输出目录：`out`

## 🚀 新增功能（2026.07）

### AI 科研工作流
- 6 大科研场景的标准化流程指导
- 每个工作流包含目标、步骤、推荐工具组合
- 工具标签支持直接点击跳转到官方网站

### 学习路径
- 11 条机器人领域学习路径，覆盖入门到高级
- 5 个学习等级（Level 0-4），循序渐进
- 每条路径推荐经典论文和实用工具

### 论文智识
- 9 维度论文分析：假设前提、局限性、隐藏假设、阅读建议等
- 标注「Draft · 待核验」提示，避免用户误信模拟内容
- 前沿论文可点击跳转到 PDF 直接阅读

## 🌟 项目亮点

### 创新点
1. **三维评估体系**：存活度/置信度/证伪强度，科学判断研究方向可行性
2. **最小可行实验（MVE）**：系统化实验设计，从假设到验证的闭环
3. **静态分析驱动**：基于模板和规则的论文解析，无需真实 AI API
4. **纯前端架构**：无后端、无数据库、无登录，打开即用

### 设计特点
- **响应式布局**：完美适配桌面端和移动端
- **微动画效果**：卡片 hover、按钮波纹、页面过渡
- **语义化色彩**：颜色传递功能信息，提升可读性
- **深色主题就绪**：CSS 变量支持一键切换

### 数据安全
- 所有数据存储在用户浏览器 localStorage 中
- 无任何数据上传到服务器
- 数据版本化管理，支持迁移

## 🤝 贡献指南

欢迎贡献代码！以下是贡献方式：

### 提交 Issue
- Bug 报告：清晰描述问题和复现步骤
- 功能建议：说明需求和使用场景
- 文档改进：完善 README 和代码注释

### 提交 PR
1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交代码：`git commit -m "feat: add your feature"`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript，保证类型安全
- 遵循现有代码风格和命名规范
- 新增组件需在对应目录下创建
- 保持静态导出配置不变（`output: 'export'`）

## 📧 联系我们

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues：[提交问题](https://github.com/asandstar/Research-Compass-for-Robotics/issues)
- 邮件：research-compass@example.com

## 📝 License

MIT
