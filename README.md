# Research Compass for Robotics

> 🚀 **在线体验**：[https://asandstar.github.io/Research-Compass-for-Robotics/](https://asandstar.github.io/Research-Compass-for-Robotics/)

[![GitHub Pages Deploy](https://github.com/asandstar/Research-Compass-for-Robotics/actions/workflows/deploy.yml/badge.svg)](https://github.com/asandstar/Research-Compass-for-Robotics/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/Next.js-14-blue?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

面向机器人领域科研人员的研究工作流管理工具，帮助你从论文阅读到 Idea 孵化再到实验验证，形成完整的科研闭环。

> 🎯 **定位**：不是文献管理工具，而是你的「科研决策辅助工作台」——帮你把读过的论文转化为可验证的研究 Idea。

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
- 输入 arXiv 链接，自动识别并规范化链接地址（abs / pdf）
- **注意**：当前版本无法自动获取论文元信息（标题、作者、会议等），需手动填写
- 一句话总结（你的判断，不是摘要）
- 结构化字段：问题定义、核心贡献、方法概述、实验证据、假设前提、局限性、待验证问题
- 阅读状态 + 判断级别双维度标记
- 关联飞书笔记、代码仓库等外部链接
- `metadataStatus` 标记：`manual`（手动填写）/ `unavailable`（仅解析链接）
- `verificationStatus` 标记：`unverified` / `verified`
- 旧版模拟数据自动检测并标注提示

### 🧠 论文智识
- 9 维度论文深度分析：问题定义、动机、核心思想、方法、证据、局限性、隐藏假设、重要性、扩展方向
- **假设思考引导**：帮助读者自行提取论文中的隐藏假设
- **缺口探索引导**：引导式思考研究空白与潜在机会
- **论文对比功能**：支持选择 2-3 篇论文进行关键维度并排对比
- 标注「Draft · 待核验」提示，避免用户误信模拟内容
- 前沿论文可点击跳转到 PDF 直接阅读

### 💡 Idea 孵化
- 从论文一键生成 Idea 草稿
- 结构化 Idea 卡片：研究问题、核心假设、为什么重要、正反证据、缺失证据、最大风险
- 支持机器人领域专属字段：任务类型、数据集/场景、基线方法、评估指标
- **三维评估体系**：存活度/置信度/证伪强度，科学判断研究方向可行性
- **科研决策雷达图**：SVG 可视化展示 Idea 的三维评分
- **Idea 关联图谱**：力导向布局展示 Idea 之间的关系网络（改进/矛盾/依赖/衍生）
- **手动补充证据**：支持在证据（支持/反对/证伪风险）中手动添加新证据
- 证据字段：`evidenceForHypothesis` / `evidenceAgainstHypothesis` / `falsificationRisks`
- Idea 状态：`rough` / `active` / `promising` / `inconclusive` / `falsified` / `abandoned`
- 添加证据、编辑 Idea、创建 MVE 后自动重算评分和状态

### 🧪 MVE（Minimum Viable Experiment）
- 从 Idea 一键生成最小可行实验设计
- 包含实验目标、变量定义、对照组设置、预期结果、失败信号、时间成本估算
- 追踪实验结果（通过 / 失败 / 进行中）
- Pending 状态的 MVE 不影响评分，仅通过/失败才更新存活度

### 📊 证据压力可视化
- **证据分布条形图**：直观展示支持/反对/缺失证据的比例
- **三维评分进度条**：存活度、置信度、证伪强度的可视化
- **可折叠面板**：点击展开/收起影响力详情

### ❓ 研究问题空间探索器
- 30+ 个机器人领域的研究问题，涵盖热门、空白、新兴、经典四种类型
- 支持按类型和领域筛选
- 每个问题标注难度（入门/进阶/挑战）和影响力（局部/领域/跨领域）

### 📚 学习路径
- 11 条机器人领域学习路径，覆盖入门到高级
- 5 个学习等级（Level 0-4），循序渐进
- 每条路径推荐经典论文和实用工具，工具标签支持直接点击跳转

### 🛠️ AI 科研工作流
- 6 大科研场景的标准化流程指导
- 每个工作流包含目标、步骤、推荐工具组合
- 工具标签支持直接点击跳转到官方网站

### 🎮 假设检验游戏
- 6 道专业题目，涵盖机器人视觉、强化学习、SLAM 等领域
- 交互式学习如何设计对照实验，验证科研假设
- 详细解析每个选项的正误原因，帮助掌握实验设计方法论

### 🕐 研究进度时间线
- 自动收集 Idea 创建、MVE 设计、实验通过/失败等事件
- 按时间倒序排列，最新事件在最上方
- 智能时间显示（今天/昨天/N天前）

### 📊 Dashboard 总览
- 全局视角看所有研究方向的进展
- 论文阅读进度、Idea 状态分布、MVE 进行情况一目了然

### 🌙 深色主题
- 一键切换深色/浅色模式，localStorage 持久化主题偏好
- 防闪烁加载，避免首次加载时的主题闪烁
- 全局色彩映射，确保所有组件在暗黑模式下可读

## 🛠 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| UI | Tailwind CSS + lucide-react |
| 状态管理 | React Context API |
| 数据存储 | IndexedDB（主） + localStorage（辅助/降级） |
| 测试 | Vitest（76 个测试用例） |
| 部署 | 静态导出 + GitHub Pages |
| CI/CD | GitHub Actions（typecheck → lint → test → build → deploy） |

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
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 运行测试
npm run test:run

# 构建静态站点
npm run build

# 本地预览构建结果
npm run start

# 完整验证（类型检查 + 代码检查 + 测试 + 构建）
npm run validate
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
│   ├── papers/                   # 论文相关页面
│   │   ├── page.tsx              # 论文库
│   │   └── intelligence/         # 论文智识页面
│   ├── ideas/                    # Idea 列表页面
│   │   └── page.tsx
│   ├── focus/                    # Idea 聚焦工作区
│   │   └── page.tsx
│   ├── mves/                     # MVE 列表页面
│   │   └── page.tsx
│   ├── questions/                # 研究问题空间
│   │   └── page.tsx
│   ├── workflows/                # AI 科研工作流
│   │   └── page.tsx
│   ├── learning/                 # 学习路径
│   │   └── page.tsx
│   ├── games/                    # 科研训练游戏
│   │   ├── page.tsx              # 游戏列表
│   │   └── hypothesis-testing/   # 假设检验游戏
│   └── not-found.tsx             # 404 页面
├── components/                   # 可复用组件
│   ├── paper/                    # 论文相关组件
│   ├── idea/                     # Idea 相关组件
│   │   └── IdeaGraph.tsx         # Idea 关联图谱
│   ├── focus/                    # 聚焦工作区组件
│   │   ├── ScoreMeter.tsx        # 评分仪表盘
│   │   ├── RadarChart.tsx        # 科研决策雷达图
│   │   ├── EvidencePressurePanel.tsx
│   │   ├── EvidencePressureGauge.tsx
│   │   └── ResearchTimeline.tsx  # 研究进度时间线
│   ├── intelligence/             # 论文智识组件
│   ├── questions/                # 研究问题组件
│   ├── backup/                   # 数据备份恢复组件
│   ├── ui/                       # 基础 UI 组件
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Tag.tsx
│   │   └── EmptyState.tsx        # 统一空状态组件
│   ├── AppShell.tsx              # 应用外壳布局
│   └── Navbar.tsx                # 导航栏
├── context/
│   ├── AppContext.tsx            # 全局状态管理
│   ├── appReducer.ts             # Reducer 逻辑（可测试）
│   ├── ActiveIdeaContext.tsx     # 当前聚焦 Idea
│   ├── ThemeContext.tsx          # 深色主题管理
│   └── ToastContext.tsx          # Toast 通知系统
├── lib/
│   ├── types.ts                  # TypeScript 类型定义
│   ├── id.ts                     # 集中化 ID 生成
│   ├── mockData.ts               # 种子数据
│   ├── mockAI.ts                 # Mock AI 函数
│   ├── storage.ts                # IndexedDB + localStorage 封装
│   ├── stateCalculator.ts        # 状态计算引擎（统一评分）
│   ├── nextActionCalculator.ts   # 下一步行动推荐
│   ├── intelligence/             # 论文智识数据
│   ├── questions/                # 研究问题数据
│   └── games/                    # 游戏题库
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
- 数据来源：`dataProvenance`（`manual` / `link_only` / `legacy_mock` / `demo`）
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
- 证据可手动添加：`evidenceForHypothesis` / `evidenceAgainstHypothesis` / `falsificationRisks`
- 状态：`rough` → `researching` → `mve_running` → `promising` / `abandoned`
- 机器人专属：`roboticsTask` / `datasetOrScenario` / `baseline` / `evaluationMetric`
- 评分通过 `updateIdeaCardWithCalculatedState` 统一重算

### MVE（最小可行实验）
- `experimentGoal` / `minimalDesign`
- `keyVariables`（自变量/因变量）
- `controlGroups` / `expectedOutcome` / `failureSignals`
- `resultStatus`：`pending` / `passed` / `failed`
- 按 `createdAt` 时间戳判断最新 MVE

## 🤖 Mock AI 功能

所有 AI 功能都是模拟的（延迟 300-1500ms），基于模板生成机器人领域的内容：

| 功能 | 说明 |
|------|------|
| arXiv 链接识别 | 输入 arXiv 链接，规范化 abs / pdf 链接，不自动填充论文内容 |
| 一句话总结 | 基于子领域关键词生成总结建议 |
| 从论文生成 Idea | 基于论文内容和子领域模板生成 Idea 草稿 |
| 生成 MVE | 从 Idea 生成实验设计方案 |
| 思考引导 | 假设思考引导和缺口探索引导，帮助读者自行提取分析 |
| Idea 评估 | 存活度/置信度/证伪强度三维评估 |

> 模板覆盖方向：VLA、SLAM、扩散策略、世界模型、对比学习、大模型等。

> **重要说明**：
> - arXiv 功能仅能识别和规范化链接，不会生成虚构的论文标题、作者、实验结果等元信息
> - Mock AI 生成的内容仅供参考和启发，不代表真实的论文分析结果
> - 假设提取和缺口分析已改为引导式思考，不再自动生成结果

## 🔄 数据存储

- **主存储**：IndexedDB（存储全量数据，支持大容量数据）
- **辅助存储**：localStorage（存储轻量状态和降级方案）
- **自动备份**：定期自动备份，支持手动备份和恢复
- **数据规范化**：加载和恢复时自动进行引用完整性检查和修复
- **存储版本**：版本号用于数据迁移，确保旧数据兼容加载
- **包含去重机制**，防止 React Strict Mode 下的重复初始化
- **备份恢复报告**：恢复时显示修复摘要（如修复无效引用、移除孤立实验等）
- 首次访问会加载种子数据（18 个子领域 + 8 篇示例论文）

## 📦 部署

### GitHub Pages

项目已配置好 GitHub Actions 自动部署工作流（`.github/workflows/deploy.yml`），使用 `peaceiris/actions-gh-pages` 将构建产物推送到 `gh-pages` 分支。

CI 流程：`npm ci` → `npm run typecheck` → `npm run lint` → `npm run test:run` → `npm run build` → 部署到 gh-pages。

Pull Request 提交时会自动运行验证（typecheck、lint、test、build），确保代码质量。仅 push 到 main 分支才会触发部署。

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

## 🔒 可靠性保障

### 数据完整性
- 停止编造 arXiv 元数据，仅规范化链接地址
- 旧版模拟数据保守检测并标注提示，不自动删除
- 数据加载时通过 `normalizeStoredData` 进行验证和修复
- 删除操作自动级联清理关联引用

### 状态一致性
- Idea 评分和状态通过 `updateIdeaCardWithCalculatedState` 统一重算
- Pending MVE 不影响评分，仅通过/失败才更新存活度
- MVE 按 `createdAt` 时间戳判断最新状态

### 测试覆盖
- 76 个测试用例覆盖 reducer 动作、arXiv 解析、数据迁移、删除级联等
- Reducer 逻辑提取到独立文件，支持直接测试

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
- **深色主题**：一键切换深色/浅色模式，防闪烁加载

### 数据安全
- 所有数据存储在用户浏览器 IndexedDB 和 localStorage 中
- 无任何数据上传到服务器
- 数据版本化管理，支持迁移
- 支持手动备份和恢复

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
6. 等待 CI 检查通过（typecheck、lint、test、build）

### 开发规范
- 使用 TypeScript，保证类型安全
- 遵循现有代码风格和命名规范
- 新增组件需在对应目录下创建
- 保持静态导出配置不变（`output: 'export'`）
- 新增功能需附带测试用例

## 📧 联系我们

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues：[提交问题](https://github.com/asandstar/Research-Compass-for-Robotics/issues)

## 📝 License

Apache License 2.0，详见 [LICENSE](LICENSE)。
