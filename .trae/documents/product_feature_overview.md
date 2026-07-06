# Research Compass 产品功能详解

> 版本：v0.2.0 | 更新日期：2026-07-06

---

## 一、产品定位

**Research Compass（科研指南针）是一套面向科研人员的研究决策辅助系统。**

它不是论文管理器，而是位于"论文阅读"之上的一层——**研究决策层**。

```
传统工具：论文输入 → 论文管理 → 论文引用（管别人的工作）
Research Compass：观察输入 → Idea 孵化 → 实验验证 → 研究产出（管你的研究）
```

**核心价值主张**：把科研从"被动读论文"变成"主动做研究"，用系统化的工作流提升研究效率。

---

## 二、核心数据模型

### 2.1 四大实体关系

```
ResearchArea (研究领域)
      ↑
      │ 关联
      │
Observation ──→ IdeaCard ──→ MVE
 (观察)          (想法)       (最小可行实验)
      │              │              │
      └──────────────┴──────────────┘
                关联/追踪
```

| 实体 | 核心作用 | 关键字段 |
|------|----------|----------|
| **ResearchArea** | 知识分类与方向管理 | name, category, keywords, focusQuestions |
| **Observation** | 灵感入口与原始素材 | type, content, keywords, researchValue, suggestedAction |
| **Paper** | 论文深度精读记录 | readingStatus, oneSentenceSummary, judgementLevel, evidence |
| **IdeaCard** | 核心决策单元 | status, researchQuestion, coreHypothesis, evidence chain |
| **MVE** | 快速验证机制 | experimentGoal, keyVariables, expectedOutcome, failureSignals |

### 2.2 IdeaCard 六阶段状态机

```
rough → researching → mve_running → promising
  │          │            │            │
  └──────────┴────────────┴────────────┴──→ paused
  │          │            │            │
  └──────────┴────────────┴────────────┴──→ abandoned
```

| 状态 | 含义 | 典型场景 |
|------|------|----------|
| `rough` | 初步想法 | 刚有个点子，还没仔细想 |
| `researching` | 调研中 | 正在查文献、收集证据 |
| `mve_running` | MVE 进行中 | 设计了最小实验，正在验证 |
| `promising` | 值得推进 | MVE 通过，可以深入做 |
| `paused` | 已暂停 | 暂时放下，以后再说 |
| `abandoned` | 已放弃 | 验证失败或方向不对 |

### 2.3 Paper 五级阅读状态

```
to_read → skimmed → deep_reading → reviewed
                ↘
                 paused
```

| 状态 | 含义 |
|------|------|
| `to_read` | 待读 |
| `skimmed` | 泛读（扫过摘要/结论） |
| `deep_reading` | 精读中 |
| `reviewed` | 已复盘（深度消化） |
| `paused` | 暂停阅读 |

### 2.4 Paper 四级价值判断

| 级别 | 含义 |
|------|------|
| `background` | 背景资料（领域常识） |
| `useful` | 有用（方法/结果可借鉴） |
| `idea_source` | 灵感来源（直接激发你的 Idea） |
| `must_review` | 必复盘（核心文献，反复读） |

---

## 三、产品功能全景

### 3.1 页面架构

```
Navbar (主导航)
├── Dashboard (首页/仪表盘)
├── Research Areas (研究领域)
│   └── Area Detail (领域详情)
├── Paper Library (论文库)
├── Ideas (想法列表)
│   ├── Idea Detail (想法详情)
│   └── Idea Workspace (想法工作区)
└── MVEs (实验列表)
    └── MVE Result (实验结果页)
```

### 3.2 Dashboard — 全局概览

**功能**：
- 统计卡片：子领域数、论文数、活跃 Idea 数、待验证 MVE 数
- 待处理列表：待读论文、待验证 MVE
- 最近 Idea 卡片预览
- 最近观察记录
- 快速记录观察入口

**设计逻辑**：
- 一屏掌握研究全局状态
- 待处理事项驱动行动
- 统计卡片点击跳转到对应列表页

### 3.3 Research Areas — 研究领域导航

**功能**：
- 领域卡片网格展示
- 分类筛选（SLAM/感知/学习/VLA 等）
- 关键词搜索
- 每个领域显示派生统计：论文数、Idea 数、活跃 MVE 数

**领域详情页**：
- 领域信息：描述、关键词、聚焦问题
- 关联论文列表（按阅读状态筛选）
- 关联 Idea 列表
- 快速操作：新增论文、新增 Idea

**设计逻辑**：
- 不是文件夹式分类，而是有"方向感"的研究地图
- 统计数据全部派生计算，不手动维护，避免数据不一致
- 支持领域隐藏（`isHidden`），不常用的领域可以收起

### 3.4 Paper Library — 论文库

**功能**：
- 论文卡片列表
- 按阅读状态筛选
- 按价值判断筛选
- 关键词搜索（标题、作者、方法关键词）
- 添加论文（支持 arXiv URL 自动解析）

**论文卡片信息**：
- 标题、作者、年份、会议
- 一句话核心总结
- 阅读状态标签
- 价值判断标签
- 关联领域标签

**论文详情**：
- 完整元信息（arXiv/PDF/代码/笔记链接）
- 问题、核心贡献、方法草图
- 证据提取（任务/Baseline/指标/关键结果）
- 假设与局限
- 与我的研究的关联
- 需要验证的问题

**设计逻辑**：
- 从"收集论文"转向"消化论文"
- 一句话总结 + 价值分级 = 快速判断论文重要性
- 深度精读模板引导系统化阅读

### 3.5 Ideas — 想法管理

**列表页功能**：
- 状态统计卡片（全部/活跃/值得推进/已放弃）
- 多维度筛选：状态、领域
- 关键词搜索
- Idea 卡片列表

**Idea 详情页**：
- 核心信息：标题、状态、研究问题、核心假设
- 证据链三栏：支持证据 / 反对证据 / 缺失证据
- 最大风险列表
- 来源追踪：来源观察、来源论文
- 关联领域
- 机器人学专属字段：任务类型、数据集、Baseline、评价指标
- 下一步行动
- 备注

**Idea 工作区（可编辑）**：
- 所有字段可编辑
- 编辑时 2 秒防抖自动保存
- AI 生成证据链
- AI 生成 MVE 方案

**设计逻辑**：
- 证据链思维：每个 Idea 是一个可证伪的假设
- 三栏对比：支持/反对/缺失，强迫全面思考
- 下一步行动驱动：每个 Idea 都有明确的 next step

### 3.6 MVEs — 最小可行实验

**列表页功能**：
- 状态统计（待实验/已通过/已失败）
- 状态筛选
- 关键词搜索
- MVE 卡片（显示关联 Idea、任务、数据集）

**MVE 结果详情页**：

1. **实验设计部分**
   - 实验目标
   - 最小实验设计
   - 关键变量（自变量/因变量）
   - 对照组
   - 预期结果（通过标准）
   - 失败信号
   - 最小工作量
   - 通过/失败双分支下一步

2. **机器人学配置**
   - 机器人任务
   - 数据集或场景
   - Baseline
   - 评价指标
   - 算力需求估算
   - 时间预估

3. **实验步骤追踪**
   - 添加实验步骤
   - 标记完成/未完成（带时间戳）
   - 进度条可视化
   - 删除步骤

4. **数据记录表**
   - 记录实验变量、数值、单位
   - 自动记录时间戳
   - 表格形式展示
   - 支持删除记录

5. **结果记录**
   - 结果状态：待实验/已通过/已失败
   - 结果备注
   - 保存时确认状态变更（会同步更新 Idea 状态）

**设计逻辑**：
- 借鉴精益创业 MVP，但针对科研场景定制
- 提前定义通过/失败标准，避免事后自欺欺人
- 双分支下一步：无论结果如何，都有预设路径
- 实验步骤 + 数据记录 = 可复现的实验过程

---

## 四、核心工作流详解

### 4.1 完整的研究推进路径

```
Step 1: 观察记录
  │
  ├─ 读论文时有想法 → 记录 Observation (type: paper)
  ├─ 实验出异常 → 记录 Observation (type: experiment)
  ├─ 讨论有灵感 → 记录 Observation (type: discussion)
  └─ 想到一个问题 → 记录 Observation (type: question)
  │
Step 2: 孵化 Idea
  │
  ├─ 从 Observation 创建 IdeaCard
  ├─ AI 生成证据链（支持/反对/缺失）
  ├─ 手动补充证据
  ├─ 关联论文和领域
  └─ 明确最大风险和下一步
  │
Step 3: 设计 MVE
  │
  ├─ AI 基于 Idea 生成 MVE 方案
  ├─ 填写机器人学配置（任务/数据集/指标）
  ├─ 定义通过标准和失败信号
  └─ 规划通过/失败后的下一步
  │
Step 4: 执行实验
  │
  ├─ 添加实验步骤，逐步执行
  ├─ 记录实验数据
  └─ 标记结果（通过/失败）
  │
Step 5: 状态流转
  │
  ├─ 通过 → Idea 状态 → promising（值得推进）
  └─ 失败 → Idea 状态 → abandoned（已放弃），转向 nextTasks.onFail
```

### 4.2 状态联动机制

| 操作 | 触发的状态变更 |
|------|----------------|
| 创建 Idea | status = `rough` |
| 开始调研 | status = `researching`（手动或 AI 生成证据后） |
| 生成 MVE | status = `mve_running` |
| MVE 通过 | Idea status = `promising` |
| MVE 失败 | Idea status = `abandoned` |
| 删除 Paper | 清理 Idea.sourcePaperIds |
| 删除 Observation | 清理 Idea.sourceObservations |
| 删除 ResearchArea | 清理 Paper.areaIds 和 Idea.areaIds |

---

## 五、技术实现

### 5.1 技术栈

- **框架**：Next.js 15 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **状态管理**：React Context + useReducer
- **数据持久化**：localStorage
- **部署**：静态导出 + GitHub Pages

### 5.2 状态管理架构

```
AppContext (Provider)
├── state
│   ├── observations
│   ├── papers
│   ├── ideaCards
│   ├── mves
│   ├── researchAreas
│   ├── isGeneratingEvidence
│   └── isInitialized
└── dispatch → reducer → 18 种 action 类型
```

**18 种 Action 类型**：

| 分类 | Action |
|------|--------|
| 初始化 | `INITIALIZE_DATA` |
| Observation | `ADD_OBSERVATION`, `DELETE_OBSERVATION` |
| Paper | `ADD_PAPER`, `UPDATE_PAPER`, `DELETE_PAPER`, `ADD_PAPER_SUMMARY` |
| Idea | `CREATE_IDEA_CARD`, `UPDATE_IDEA_CARD`, `UPDATE_IDEA_STATUS`, `DELETE_IDEA_CARD`, `ADD_EVIDENCE` |
| MVE | `CREATE_MVE`, `UPDATE_MVE_RESULT`, `UPDATE_MVE_STEPS`, `UPDATE_MVE_DATA_RECORDS` |
| Area | `TOGGLE_AREA_HIDDEN`, `DELETE_RESEARCH_AREA` |

### 5.3 数据持久化

- **存储键**：`research_compass_data_v2`（带版本号，便于数据迁移）
- **存储时机**：每次 state 变更后 500ms 防抖保存
- **去重机制**：加载和保存时都按 ID 去重
- **初始化保护**：模块级变量防止 React Strict Mode 双执行导致重复数据

### 5.4 静态导出 + SPA 路由

- `output: 'export'` 生成纯静态页面
- `trailingSlash: true` 确保 URL 一致性
- `public/404.html` 实现 SPA 重定向
- 首页 `useEffect` 读取 `?r=` 参数执行客户端路由
- 解决了用户创建的动态路由刷新 404 问题

### 5.5 Mock AI

- 模拟 AI 生成：500-1500ms 延迟
- 基于模板选择器：根据研究问题关键词匹配模板
- 支持的生成类型：
  - 观察分析（自动提取关键词、评估价值）
  - Idea 证据链生成
  - MVE 方案生成
  - 论文一句话总结 + 深度分析
  - arXiv 元信息解析

---

## 六、当前版本的局限与优化方向

### 6.1 功能层面的局限

| 局限 | 说明 | 优化方向 |
|------|------|----------|
| 数据全在本地 | localStorage 容量有限，换设备不同步 | 云端同步、多设备 |
| 无协作功能 | 单人使用，无法共享 Idea | 团队协作、评论 |
| Mock AI | 模板生成，不是真的大模型 | 接入真实 LLM API |
| 无文献导入 | 手动添加论文，没有批量导入 | Zotero 导入、arXiv 搜索 |
| 实验分析简单 | 只有数据记录表，没有可视化 | 图表、统计分析 |
| 无时间线视图 | 只有列表，看不到研究脉络 | 研究时间线、知识图谱 |

### 6.2 产品层面的方向

1. **深度方向**：把 MVE 做深，从实验设计 → 实验执行 → 结果分析全链路
2. **广度方向**：从机器人学扩展到更多学科（生物、化学、物理等）
3. **协作方向**：从单人工具变成团队研究协作平台
4. **AI 深度融合**：用 AI 做文献综述、假设生成、实验设计助手

---

## 七、文件结构速览

```
app/
├── layout.tsx              # 根布局（Server Component）
├── ClientProviders.tsx     # 客户端 Provider 包装
├── page.tsx                # Dashboard
├── areas/
│   ├── page.tsx            # 研究领域列表
│   └── [id]/
│       ├── page.tsx        # 领域详情（Server）
│       └── AreaDetailClient.tsx
├── papers/
│   └── page.tsx            # 论文库
├── ideas/
│   └── page.tsx            # Idea 列表
├── mves/
│   └── page.tsx            # MVE 列表
├── idea/[id]/
│   ├── page.tsx
│   └── IdeaWorkspaceClient.tsx
├── mve/[id]/
│   ├── page.tsx
│   └── MVEResultClient.tsx
└── detail/[type]/[id]/
    ├── page.tsx
    └── DetailPageClient.tsx

components/
├── Navbar.tsx
├── ui/                     # 基础 UI 组件
├── idea/                   # Idea 相关组件
│   ├── CreateIdeaModal.tsx
│   ├── IdeaEvaluationModal.tsx
│   ├── IdeaCardMini.tsx
│   └── EvidenceList.tsx
├── paper/                  # Paper 相关组件
│   ├── AddPaperModal.tsx
│   ├── PaperCard.tsx
│   └── AnalysisResultModal.tsx
└── observation/            # Observation 相关组件
    ├── ObservationInput.tsx
    └── ObservationCard.tsx

lib/
├── types.ts                # 类型定义 + 常量
├── mockData.ts             # 种子数据
├── mockAI.ts               # Mock AI 生成
└── storage.ts              # localStorage 工具

context/
└── AppContext.tsx          # 全局状态管理
```

---

## 八、数据统计

当前版本（v0.2.0）：
- **页面数**：34 个静态页面
- **核心实体**：5 种（Area, Observation, Paper, Idea, MVE）
- **Action 类型**：18 种
- **Mock 数据**：18 个研究领域、3 个 Idea、1 个 MVE、多篇论文
- **组件数**：15+ 个可复用组件
