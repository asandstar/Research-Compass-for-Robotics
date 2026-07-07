# Research Compass for Robotics — 项目逻辑全览

> 版本：v1.0（可证伪假设驱动的研究执行系统）
> 更新时间：2026-07-06
> 技术栈：Next.js 14 (App Router) + React 18 + TypeScript 5 + Tailwind CSS 3 + lucide-react

---

## 一、产品定位

**一句话概括**：从"子领域探索 → 论文阅读 → 灵感捕捉 → 最小可行实验 (MVE) 验证"的全链路科研工作流管理工具。

**核心原则（v1.0 重构后）**：
1. 科研对象必须可被明确否定（可证伪假设驱动）
2. 每个 Idea 必须能导出最小实验验证路径
3. 每个实验必须能产生结构化失败信息
4. 系统鼓励"推翻 idea"，而不是"记录 idea"

**部署形态**：纯静态 HTML（`output: 'export'`），部署在 GitHub Pages，basePath 为 `/Research-Compass-for-Robotics`。

---

## 二、核心数据模型

### 2.1 Observation（观察记录）

> 严格原子化输入，只记录"现象"，禁止包含结论或隐含假设。

```typescript
interface Observation {
  id: string;
  content: string;                    // 原始描述
  type: 'paper' | 'experiment' | 'discussion' | 'question' | 'anomaly';
  keywords: string[];
  potentialIssue: string;             // 潜在问题
  researchValue: 'high' | 'medium' | 'low';
  researchValueReason: string;
  suggestedAction: string;
  createdAt: string;
  context: string;                    // 来源上下文（v1.0 新增）
  signals: string[];                  // 客观信号（v1.0 新增，必须中性）
}
```

**校验函数**：`validateNoHypothesisEmbedding(content)` — 检测"因此/表明/说明/证明"等推断性词汇，如果包含则应降级为 Idea candidate。

### 2.2 IdeaCard（可证伪假设单元）

> 不再是"想法记录"，必须是"可实验推翻的假设单元"。

```typescript
interface IdeaCard {
  id: string;
  title: string;
  status: 'active' | 'unstable' | 'promising' | 'rejected' | 'revived';

  // 核心研究内容
  researchQuestion: string;           // 研究问题
  coreHypothesis: string;             // 核心假设（旧字段，兼容）
  hypothesis: string;                 // 可检验假设（v1.0 新增）
  whyItMatters: string;               // 为什么值得做

  // 可证伪性配置（v1.0 新增）
  predictions: Prediction[];          // 预测：条件 → 预期结果
  failureConditions: string[];        // 失败条件（哪些结果直接否定）
  confounders: string[];              // 混淆因素

  // 证据结构（v1.0 重命名）
  evidenceForHypothesis: Evidence[];      // 支持证据（原 supportingEvidence）
  evidenceAgainstHypothesis: Evidence[];  // 反对证据（原 opposingEvidence）
  falsificationRisks: Evidence[];         // 证伪风险（原 missingEvidence）
  biggestRisks: string[];

  // 评分系统（v1.0 新增，自动计算）
  survivalScore: number;              // 存活分数 (0-100)
  confidenceScore: number;            // 置信度 (0-100)
  falsificationStrength: number;       // 可证伪性强度 (0-100)

  // 关联
  sourceObservations: string[];
  sourcePaperIds: string[];
  areaIds: string[];

  // 实验配置
  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;

  nextAction: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 MVE（最小可执行 Benchmark）

> 从"实验计划"升级为"最小可验证 benchmark 单元"。

```typescript
interface MVE {
  id: string;
  ideaCardId: string;
  mveType: 'sanity_check' | 'ablation' | 'generalization_test' | 'stress_test';

  // 实验定义（v1.0 新增）
  experimentGoal: string;
  taskDefinition: string;             // 任务定义
  evaluationProtocol: string;         // 评估协议
  minimalDesign: string;
  keyVariables: { independent: string; dependent: string };
  controlGroups: string[];
  baselineReferences: string[];       // 基线参考（至少1个）
  successCriteria: string;            // 成功标准（可量化）
  failureModes: FailureMode[];         // 失败模式（分类结构）
  failureSignals: string[];
  minimalEnvOrDataset: string;        // 最小环境/数据集

  minimalEffort: string;
  nextTasks: { onPass: string; onFail: string };

  // 兼容字段
  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;
  minimalComputeNeed: string;
  expectedTimeCost: string;

  // 实验执行
  steps: ExperimentStep[];
  dataRecords: DataRecord[];

  // 结果（v1.0 新增 failureAnalysis）
  resultStatus: 'pending' | 'passed' | 'failed';
  resultNotes: string;
  failureAnalysis?: FailureAnalysis;   // 失败时自动生成
  createdAt: string;
}
```

### 2.4 辅助类型

```typescript
interface Prediction { condition: string; expectedOutcome: string; }

interface AdversarialReview {
  strongestCounterarguments: string[];
  likelyFailureScenarios: string[];
  falsificationExperiments: string[];
}

interface FailureAnalysis {
  failureReasonTaxonomy: string[];       // 失败原因分类
  hypothesisUpdateSuggestion: string;   // 假设更新建议
  nextMveGeneration: string[];           // 下一步实验建议
}

interface FailureMode {
  type: 'performance' | 'robustness' | 'generalization' | 'implementation' | 'theoretical';
  description: string;
  detectionCriteria: string;
}

interface IdeaRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: 'refines' | 'contradicts' | 'depends_on' | 'derived_from';
  description?: string;
  createdAt: string;
}
```

### 2.5 ResearchArea & Paper

```typescript
interface ResearchArea {
  id: string;
  name: string;                      // 格式：'英文名｜中文名'
  description: string;
  category: string;                  // 感知/学习/前沿/控制
  keywords: string[];
  focusQuestions: string[];
  isHidden: boolean;                  // 软删除标记
  createdAt: string;
  updatedAt: string;
}

interface Paper {
  id: string;
  title, authors: string;
  year: number;
  venue: string;
  arxivUrl, pdfUrl, htmlUrl, feishuNoteUrl, codeUrl: string;
  areaIds: string[];
  readingStatus: 'to_read' | 'skimmed' | 'deep_reading' | 'reviewed' | 'paused';
  methodKeywords: string[];
  oneSentenceSummary, problem, coreContribution, methodSketch: string;
  evidence: PaperEvidence;
  assumptions, limitations: string[];
  relevanceToMyResearch: string;
  questionsToVerify: string[];
  judgementLevel: 'background' | 'useful' | 'idea_source' | 'must_review';
  inspiredIdeaIds: string[];
  createdAt, updatedAt: string;
}
```

---

## 三、页面路由与导航

### 3.1 路由总览

```
/                        → 仪表盘 Dashboard
/areas                   → 子领域列表
/areas/[id]              → 子领域详情（SSG）
/papers                  → 论文库列表
/ideas                   → 想法列表
/idea/[id]               → 想法工作台（SSG）
/mves                    → MVE 列表
/mve/[id]                → MVE 结果页（SSG）
/detail/[type]/[id]      → 统一详情分发（SSG，type=idea|mve）
```

### 3.2 Navbar 导航

| 路径 | 标签 | 图标 | 说明 |
|------|------|------|------|
| `/` | Dashboard | Compass | 首页仪表盘 |
| `/areas` | Research Areas | LayoutGrid | 子领域列表 |
| `/papers` | Paper Library | FileText | 论文库 |
| `/ideas` | Ideas | Lightbulb | 想法列表 |
| `/mves` | MVEs | FlaskConical | 实验列表 |

### 3.3 路由设计说明

- **双重入口**：`/idea/[id]` 和 `/detail/idea/[id]` 都渲染 `IdeaWorkspaceClient`（MVE 同理）。列表页和 Navbar 使用 `/detail/...` 形式。
- **SSG + 客户端路由**：基于 `mockData` 生成静态参数，`dynamicParams = true` 允许动态访问用户创建的数据。
- **SPA Fallback**：`public/404.html` 处理 GitHub Pages 静态导出下的客户端路由跳转，`app/page.tsx` 监听 `?r=` 参数做重定向。

---

## 四、状态管理与数据流

### 4.1 全局状态结构

```typescript
interface AppState {
  // 数据
  observations: Observation[];
  ideaCards: IdeaCard[];
  ideaRelationships: IdeaRelationship[];
  mves: MVE[];
  researchAreas: ResearchArea[];
  papers: Paper[];

  // 加载状态
  isAnalyzing: boolean;
  isGeneratingEvidence: boolean;
  isGeneratingMVE: boolean;
  isGeneratingSummary: boolean;
  isGeneratingIdeaFromPaper: boolean;
  isParsingArxiv: boolean;
  isInitialized: boolean;
}
```

### 4.2 数据流图

```
┌─────────────┐
│ localStorage │ (key: research-compass-data-v14)
└──────┬──────┘
       │ initializeData() / resetDemoData()
       ▼
┌──────────────────────────────┐
│     AppContext (Reducer)      │
│  ┌─────────────────────────┐ │
│  │   AppState (6 data arrays)│ │
│  └────────┬────────────────┘ │
│           │                   │
│  ┌────────▼────────────────┐ │
│  │   appReducer (Actions)   │ │
│  │  INIT/ADD/UPDATE/DELETE  │ │
│  └────────┬────────────────┘ │
│           │                   │
│  ┌────────▼────────────────┐ │
│  │  useEffect: persistData  │ │
│  │   → localStorage 写回     │ │
│  └─────────────────────────┘ │
└──────────┬───────────────────┘
           │ useApp() hook
           ▼
┌──────────────────────────────┐
│      页面 / 组件              │
│  Dashboard / Ideas / MVE...   │
└──────────────────────────────┘
```

### 4.3 Context API 暴露的方法

| 分类 | 方法 | 说明 |
|------|------|------|
| 观察 | `addObservation(content)` | AI 自动结构化分析 |
| 想法 | `createIdeaCard(...)` | 创建新想法 |
| | `updateIdeaCard(card)` | 更新想法 |
| | `deleteIdeaCard(id)` | 删除想法（级联删除 MVE） |
| | `addEvidence(ideaId, type, content)` | 添加证据 |
| | `addIdeaRelationship(...)` | 添加想法关系 |
| | `generateAdversarialReview(ideaId)` | 生成对抗性审查 |
| MVE | `generateMVE(ideaCardId)` | AI 生成 MVE |
| | `updateMVEResult(id, status, notes)` | 更新实验结果（失败自动分析） |
| | `updateMveSteps(id, steps)` | 更新实验步骤 |
| | `updateMveDataRecords(id, records)` | 更新数据记录 |
| 领域 | `addResearchArea(...)` | 新增子领域 |
| | `updateResearchArea(area)` | 更新子领域 |
| | `deleteArea(id)` | 软删除（isHidden: true） |
| 论文 | `addPaper(data)` | 新增论文 |
| | `updatePaper(paper)` | 更新论文 |
| | `deletePaper(id)` | 删除论文 |
| | `fetchArxivPaper(url)` | 抓取 arxiv 论文 |
| | `createIdeaFromPaper(paperId)` | 从论文生成想法 |
| | `extractAssumptions(paper)` | 提取假设 |
| | `extractGaps(paper)` | 提取研究缺口 |
| | `evaluateIdea(idea)` | AI 评估想法 |
| 查询 | `getIdeaCardById(id)` | 按 ID 查想法 |
| | `getMVEById(id)` | 按 ID 查 MVE |
| | `getObservationsByIds(ids)` | 批量查观察 |
| | `getResearchAreaById(id)` | 按 ID 查领域 |
| | `getPaperById(id)` | 按 ID 查论文 |
| | `getPapersByAreaId(id)` | 按领域查论文 |
| | `getIdeasByAreaId(id)` | 按领域查想法 |
| | `getMvesByAreaId(id)` | 按领域查 MVE |

### 4.4 关键联动逻辑

**Idea ↔ MVE 联动**：当 MVE 创建或结果更新时，Reducer 内部自动调用 `updateIdeaCardWithCalculatedState(card, mves)` 重新计算所属 IdeaCard 的分数和状态。

---

## 五、状态自动计算逻辑

### 5.1 三大分数计算

```
┌─────────────────────────────────────────────────────────────┐
│                  calculateFalsificationStrength (0-100)      │
│                                                             │
│  有 failureConditions     → +30                              │
│  有 confounders           → +20                              │
│  有 predictions           → +25                              │
│  有 evidenceAgainst       → +25                              │
│  最大值: 100                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  calculateConfidenceScore (0-100)            │
│                                                             │
│  基础分: 50                                                  │
│  + 证据比例 × 30                                             │
│    (evidenceFor / (evidenceFor + evidenceAgainst))           │
│  + falsificationStrength                                     │
│  + predictions.length × 5                                    │
│  + failureConditions.length × 5                               │
│  范围: [0, 100]                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  calculateSurvivalScore (0-100)              │
│                                                             │
│  无 MVE 时:                                                  │
│    min(70, 50 + evidenceFor × 5 - evidenceAgainst × 10)      │
│                                                             │
│  有 MVE 时:                                                  │
│    50                                                        │
│    + passed MVE × 15                                         │
│    - failed MVE × 20                                         │
│    + pending MVE × 5                                         │
│    + evidenceFor × 3                                         │
│    - evidenceAgainst × 5                                      │
│    范围: [0, 100]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 状态判定规则

```
calculateIdeaState(card):

  survivalScore ≥ 70 且 confidenceScore ≥ 60  →  promising (值得推进)
                    ↓ 否
  survivalScore < 20                           →  rejected (已拒绝)
                    ↓ 否
  survivalScore ≥ 50 且 confidenceScore ≥ 40   →  active (活跃)
                    ↓ 否
  survivalScore < 50 或 confidenceScore < 30  →  unstable (不稳定)
                    ↓ 否
  默认                                          →  active
```

### 5.3 MVE 结果对 Idea 的影响

```
MVE passed → survivalScore +15, confidenceScore +10
MVE failed → survivalScore -20, confidenceScore -15
```

---

## 六、UI 组件层次

```
RootLayout (app/layout.tsx)
└── ClientProviders
    ├── AppProvider (context/AppContext.tsx)
    │   └── Navbar (5 个导航项)
    └── <main> {children} </main>

页面组件:
├── Dashboard (/)
│   ├── 统计卡片 × 4 (子领域/论文/活跃想法/待验证MVE)
│   ├── ObservationInput (观察输入)
│   ├── AddPaperModal
│   └── IdeaCardMini × N (带评分进度条)
│
├── ResearchAreasPage (/areas)
│   └── 内联 Modal 表单 (新增/编辑子领域)
│
├── AreaDetailClient (/areas/[id])
│   ├── 统计卡片 × 4 (论文/Idea/MVE/进行中MVE)
│   ├── PaperCard × N (compact 模式)
│   ├── AddPaperModal
│   └── CreateIdeaModal
│
├── PaperLibraryPage (/papers)
│   ├── 筛选器 (领域/阅读状态/判断级别)
│   ├── PaperCard × N (full 模式)
│   ├── AddPaperModal
│   └── AnalysisResultModal (假设/缺口提取结果)
│
├── IdeasPage (/ideas)
│   ├── 统计卡片 × 5 (总数/活跃/不稳定/值得推进/已恢复)
│   ├── 筛选器 (搜索/状态/领域)
│   ├── IdeaCardMini × N
│   └── CreateIdeaModal
│
├── IdeaWorkspaceClient (/idea/[id])
│   ├── 核心内容 (研究问题/核心假设/为什么值得做/可检验假设)
│   ├── 可证伪性配置 (预测/失败条件/混淆因素)
│   ├── 机器人实验配置 (任务/数据集/Baseline/指标)
│   ├── EvidenceList × 3 (支持/反对/证伪风险)
│   ├── 最大风险列表
│   ├── 来源论文 + 来源观察
│   ├── 备注
│   ├── AI 评估按钮 → IdeaEvaluationModal
│   └── 生成 MVE 按钮
│
├── MvesPage (/mves)
│   └── MVE 列表 (按状态筛选)
│
├── MVEResultClient (/mve/[id])
│   ├── 实验目标 + 最小实验设计
│   ├── 机器人实验配置
│   ├── 关键变量 + 资源估算
│   ├── 对照组
│   ├── 预期结果（通过标准）+ 失败信号
│   ├── 最小工作量 + 下一步任务
│   ├── 失败分析 (failureAnalysis，失败时显示)
│   ├── 实验步骤清单 (可勾选)
│   ├── 数据记录表格
│   └── 结果记录 (通过/失败/备注)
│
└── DetailPageClient (/detail/[type]/[id])
    └── 按 type 分派 → IdeaWorkspaceClient 或 MVEResultClient
```

### 6.1 通用 UI 原子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| Button | `components/ui/Button.tsx` | variant: primary/secondary/danger |
| Card | `components/ui/Card.tsx` | 白底带 border |
| Input | `components/ui/Input.tsx` | 标准输入框 |
| Select | `components/ui/Select.tsx` | 自定义下拉 |
| Tag | `components/ui/Tag.tsx` | variant: solid/outline/soft/secondary |
| Textarea | `components/ui/Textarea.tsx` | 带 label |

---

## 七、核心业务流程

### 7.1 研究推进主流程

```
Observation          Idea candidate        validated Idea
    │                     │                     │
    │  addObservation()   │                     │
    │  → AI 自动结构化     │                     │
    ▼                     │                     │
 用户观察记录             │                     │
    │                     │                     │
    │  用户选择关联观察     │                     │
    │  → createIdeaCard() │                     │
    └─────────────────────▶│                     │
                          │  AI 生成证据         │
                          │  (三类证据 + 风险)    │
                          ▼                     │
                     Idea Card 创建              │
                     (survival=50, conf=50)     │
                          │                     │
                          │  用户编辑可证伪性配置  │
                          │  (hypothesis/        │
                          │   predictions/       │
                          │   failureConditions/ │
                          │   confounders)        │
                          ▼                     │
                     validated Idea              │
                          │                     │
                          │  generateMVE()      │
                          │  → AI 生成实验方案    │
                          ▼                     │
                     MVE 设计                   │
                          │                     │
                          │  执行实验             │
                          │  (步骤/数据记录)      │
                          ▼                     │
                     实验结果                   │
                          │                     │
                    ┌───────┴───────┐           │
                    │               │           │
                  passed          failed        │
                    │               │           │
                    │     mockAnalyzeFailure()   │
                    │     → failureAnalysis      │
                    │     → survivalScore -20   │
                    │     → confidenceScore -15 │
                    ▼               │           │
              survivalScore         │           │
              +15, conf +10         │           │
                    │               │           │
                    └───────┬───────┘           │
                            ▼                   │
                    hypothesis update ◀──────────┘
                    (状态自动更新)
```

### 7.2 从论文生成 Idea 流程

```
用户添加论文
    │
    ├── 手动输入
    └── fetchArxivPaper(url) → AI 自动解析
                │
                ▼
         Paper 记录创建
                │
                ├── extractAssumptions(paper) → 提取假设
                ├── extractGaps(paper) → 提取研究缺口
                │
                ▼
    createIdeaFromPaper(paperId)
                │
                │  AI 生成:
                │  - title, researchQuestion, coreHypothesis
                │  - 三类证据
                │  - biggestRisks
                │  - 实验配置 (task/dataset/baseline/metric)
                ▼
         Idea Card 创建
```

### 7.3 防抖自动保存机制

```
用户编辑字段
    │
    ▼
setIdeaCard(updated) + setIsDirty(true)
    │
    ▼
useEffect (isDirty=true)
    │
    ├── 2 秒内无操作 → updateMVEResult()
    │                  setIsDirty(false)
    │
    └── 路由离开 (beforeunload)
        → 立即保存
```

---

## 八、存储与迁移

### 8.1 存储结构

- **存储 key**：`research-compass-data-v14`（前身 `research-compass-data`）
- **格式**：JSON 序列化的 `StoredData` 对象
- **触发时机**：每次 state 变化自动 persist

### 8.2 加载策略

```
loadFromStorage()
    │
    ├── 存在 v14 key?
    │   ├── YES → 解析 → 应用迁移函数 → 去重 → 自动修复 → 返回
    │   │        (尊重用户的空数组，不回退到 mock)
    │   │
    │   └── NO  ↓
    │
    ├── 存在 legacy key?
    │   ├── YES → 迁移到 v14 结构 → 保存 → 返回
    │   └── NO  ↓
    │
    └── 全新用户 → 加载 mockData (种子数据)
                    observations, ideaCards, mves,
                    researchAreas, papers
```

### 8.3 迁移函数

| 函数 | 作用 |
|------|------|
| `addDefaultIdeaFields(card)` | 补全新字段（hypothesis/predictions/failureConditions 等） |
| `addDefaultMVEFields(mve)` | 补全 mveType/taskDefinition/evaluationProtocol 等 |
| `addDefaultAreaFields(area)` | 补全 isHidden |
| `migrateLegacyIdeaStatus(card)` | 旧状态 → 新状态映射（rough→active, abandoned→rejected 等） |
| `migrateLegacyMVEResultStatus(status)` | success→passed, failed→failed |
| `deduplicateById(items)` | 按 ID 去重 |

### 8.4 数据损坏处理

解析失败时：
1. 备份原始数据到 `STORAGE_KEY + '-backup-' + timestamp`
2. 返回空数据（observations/ideaCards/mves 为空）+ mock 领域和论文
3. 避免覆盖用户可能可恢复的数据

---

## 九、Mock AI 实现

### 9.1 模板系统

`selectTemplate(content)` 按关键词匹配返回模板：

| 关键词 | 模板 | 覆盖领域 |
|--------|------|----------|
| perception, visual, 视觉感知 | perception | 机器人感知 |
| nlp, language, 自然语言 | nlp | NLP |
| vla, vision-language-action | vla | VLA 模型 |
| slam, localization, 定位 | slam | SLAM |
| diffusion, 扩散 | diffusion | 扩散策略 |
| world model, 世界模型 | worldModel | 世界模型 |
| 默认 | perception | 机器人感知 |

### 9.2 核心 AI 函数

| 函数 | 延迟 | 输入 | 输出 |
|------|------|------|------|
| `mockAnalyzeObservation` | 800-1500ms | content | type/keywords/issue/value/context/signals |
| `mockGenerateIdeaEvidence` | 1200-2000ms | question/hypothesis/observations | 三类证据 + 风险 + nextAction |
| `mockGenerateMVE` | 1500-2500ms | ideaCard | 完整 MVE 方案 |
| `mockGenerateRoboticsMVE` | 1500-2500ms | ideaCard + sourcePapers | 含 robotics 上下文的 MVE |
| `mockGenerateOneSentenceSummary` | 500-1000ms | paper + areas | 一句话总结 |
| `mockGenerateIdeaFromPaper` | 1200-2000ms | paper + areas | 完整 Idea 数据 |
| `mockFetchArxivPaper` | 1000-2000ms | arxivUrl | 预定义论文模板（按 ID hash） |
| `mockExtractAssumptions` | 1000-1500ms | paper | 5 类假设 + 验证问题 |
| `mockExtractGaps` | 1000-1500ms | paper | 3 个研究缺口 |
| `mockGenerateAdversarialReview` | 1000-1800ms | ideaCard | 3 反论证 + 3 失败场景 + 2 证伪实验 |
| `mockAnalyzeFailure` | 1000-1800ms | mve + ideaCard | 失败原因 + 假设更新 + 下一步 MVE |
| `mockEvaluateIdea` | 1500-2500ms | idea | 8 维度评分 + recommendation + revisedHypothesis |

---

## 十、UI 组件详情

### 10.1 IdeaCardMini（想法迷你卡片）

展示内容：
- 标题 + 状态标签
- **存活分数**进度条（蓝色）
- **置信度**进度条（绿色）
- **可证伪性**进度条（琥珀色）
- 观察数量 + 更新时间

### 10.2 IdeaWorkspaceClient（想法工作台）

布局：`grid grid-cols-[2fr_1fr]`

**左栏（2/3）**：
1. 核心内容卡片
   - 研究问题（必填）
   - 核心假设（必填）
   - 为什么值得做（必填）
   - 可检验假设
2. 可证伪性配置卡片
   - 预测列表（条件 → 预期结果，可增删）
   - 失败条件列表（可增删）
   - 混淆因素列表（可增删）
3. 机器人实验配置卡片
4. 证据三栏（支持/反对/证伪风险）
5. 最大风险列表
6. 下一步行动

**右栏（1/3）**：
1. 来源论文
2. 来源观察
3. 备注
4. AI 评估按钮
5. 生成 MVE 按钮

### 10.3 MVEResultClient（MVE 结果页）

展示区块顺序：
1. 标题 + 关联 Idea + 结果标签
2. 子领域链接
3. 实验目标 + 最小实验设计
4. 机器人实验配置
5. 关键变量 + 资源估算
6. 对照组
7. 预期结果（通过标准）+ 失败信号
8. 最小工作量 + 下一步任务
9. **失败分析**（仅 resultStatus=failed 时显示）
   - 失败原因分类（标签云）
   - 假设更新建议
   - 下一步实验建议
10. 实验步骤清单（可勾选完成）
11. 数据记录表格
12. 结果记录区（通过/失败/备注）

---

## 十一、Tailwind 主题配置

```javascript
colors: {
  bg: '#fafaf9',      // 主背景
  bg2: '#f5f5f4',      // 次背景
  ink: '#292524',      // 主文字
  muted: '#78716c',    // 次文字
  rule: '#e7e5e4',     // 分割线
  accent: '#0d9488',   // 强调色 (teal)
  accent2: '#d97706',  // 次强调色 (amber)
}
```

---

## 十二、已知设计模式

1. **Server/Client 分离**：`page.tsx` (Server) 负责 `generateStaticParams`，复杂交互移到 `*Client.tsx`
2. **统一详情分发**：`DetailPageClient` 按 type 分派，避免重复实现
3. **防抖自动保存**：2 秒防抖 + `beforeunload` 路由离开前保存
4. **本地编辑隔离**：`isDirty` + 仅依赖 `[id]` 的 useEffect，避免 dispatch 覆盖
5. **状态派生联动**：MVE 创建/结果更新 → IdeaCard 分数重算（Reducer 内完成）
6. **SPA Fallback**：`404.html` + `?r=` 参数处理 GitHub Pages 路由
7. **软删除**：删除子领域 → `isHidden: true`，不真正移除数据

---

## 十三、重构建议参考点

如果要重构展示逻辑，可以重点关注以下方面：

1. **Idea Graph 可视化**：当前 `ideaRelationships` 数据模型已支持 refines/contradicts/depends_on/derived_from 四种关系，但 UI 上没有可视化展示
2. **Adversarial Review UI**：`generateAdversarialReview` 函数已实现，但结果只在 Modal 中展示，没有持久化到 IdeaCard
3. **Observation 校验**：`validateNoHypothesisEmbedding` 函数已实现，但未在 ObservationInput 中集成实时校验
4. **MVE Failure → Next MVE**：`failureAnalysis.nextMveGeneration` 已生成建议，但没有"一键生成下一个 MVE"的 UI 流程
5. **状态自动更新触发**：当前状态计算在 Reducer 中完成，但用户手动编辑字段后不会自动重算（需刷新或 MVE 变化时触发）
6. **Idea 状态手动覆盖**：系统支持 revived 状态，但没有 UI 允许用户手动将 rejected 的 Idea 恢复为 active/revived
7. **领域导航增强**：当前 18 个子领域全部平铺展示，可考虑按 category（感知/学习/前沿/控制）分组或树状展示
8. **数据仪表盘**：当前 Dashboard 只有简单计数，可考虑添加趋势图、Idea 存活率变化、MVE 成功率等可视化
