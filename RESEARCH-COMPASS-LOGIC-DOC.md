# Research Compass for Robotics -- 逻辑文档

> 版本：v2.0 (UI 从零重建版)
> 日期：2026-07-06
> 技术栈：Next.js 14 (App Router) + TypeScript + Tailwind CSS + lucide-react
> 部署方式：静态导出 (output: 'export')，basePath: /Research-Compass-for-Robotics

---

## 1. 产品定位

Research Compass 是一个**单线程研究执行系统**，面向机器人学研究场景。

核心原则：
1. 同一时刻只有一个活跃假设 (Single Active Hypothesis)
2. 每个页面引导下一步研究行动
3. MVE (最小可行实验) 是假设的决策门控
4. 论文和观察是输入信号流
5. Idea 是中央研究对象

---

## 2. 数据模型

所有数据存储在浏览器 localStorage，key 为 `research-compass-data-v14`。数据模型未做任何改动，保持向后兼容。

### 2.1 IdeaCard -- 核心研究对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| title | string | 标题 |
| status | `'active' \| 'unstable' \| 'promising' \| 'rejected' \| 'revived'` | 生命周期状态 |
| researchQuestion | string | 研究问题 |
| coreHypothesis | string | 核心假设 |
| hypothesis | string | 假设全文 |
| whyItMatters | string | 研究意义 |
| predictions | Prediction[] | 可检验预测 [{condition, expectedOutcome}] |
| failureConditions | string[] | 失败条件列表 |
| confounders | string[] | 混淆因素 |
| evidenceForHypothesis | Evidence[] | 支持证据 [{id, content, source, isAIGenerated}] |
| evidenceAgainstHypothesis | Evidence[] | 反对证据 |
| falsificationRisks | Evidence[] | 证伪风险 |
| biggestRisks | string[] | 最大风险 |
| survivalScore | number (0-100) | 存活度 |
| confidenceScore | number (0-100) | 置信度 |
| falsificationStrength | number (0-100) | 证伪强度 |
| sourceObservations | string[] | 来源观察 ID |
| sourcePaperIds | string[] | 来源论文 ID |
| areaIds | string[] | 关联研究领域 ID |
| roboticsTask | string | 机器人任务 |
| datasetOrScenario | string | 数据集/场景 |
| baseline | string | 基线方法 |
| evaluationMetric | string | 评估指标 |
| createdAt / updatedAt | string | 时间戳 |

**状态枚举**：
- `active` (活跃) -- 正常研究中的假设
- `unstable` (不稳定) -- 证据矛盾，需要调整
- `promising` (值得推进) -- 高存活+高置信
- `rejected` (已拒绝) -- 被证伪或放弃
- `revived` (已恢复) -- 之前被拒绝后重新启用

### 2.2 MVE -- 最小可行实验

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| ideaCardId | string | 所属 Idea ID |
| mveType | `'sanity_check' \| 'ablation' \| 'generalization_test' \| 'stress_test'` | 实验类型 |
| experimentGoal | string | 实验目标 |
| successCriteria | string | 成功标准 |
| failureModes | FailureMode[] | 失败模式 [{type, description, detectionCriteria}] |
| failureAnalysis | FailureAnalysis? | 失败分析 (仅 failed 时) |
| resultStatus | `'pending' \| 'passed' \| 'failed'` | 实验结果 |
| resultNotes | string | 结果备注 |
| steps | ExperimentStep[] | 实验步骤 |
| dataRecords | DataRecord[] | 数据记录 |
| createdAt | string | 创建时间 |

**MVE 类型中文映射**：
- sanity_check → Sanity Check
- ablation → Ablation
- generalization_test → Generalization Test
- stress_test → Stress Test

### 2.3 Paper -- 论文信号源

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| title / authors / year / venue | string | 基本信息 |
| arxivUrl / pdfUrl / codeUrl | string | 外部链接 |
| areaIds | string[] | 关联研究领域 |
| readingStatus | `'to_read' \| 'skimmed' \| 'deep_reading' \| 'reviewed' \| 'paused'` | 阅读状态 |
| judgementLevel | `'background' \| 'useful' \| 'idea_source' \| 'must_review'` | 判断等级 |
| oneSentenceSummary | string | 一句话摘要 |
| assumptions | string[] | 提取的假设 |
| limitations | string[] | 局限性 |
| relevanceToMyResearch | string | 与我的研究相关性 |
| inspiredIdeaIds | string[] | 启发的 Idea ID |

### 2.4 ResearchArea -- 研究领域

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 名称 |
| description | string | 描述 |
| category | string | 分类 (如 "感知", "学习", "控制", "前沿") |
| keywords | string[] | 关键词 |
| focusQuestions | string[] | 关注问题 |
| isHidden | boolean | 是否隐藏 |

### 2.5 Evidence / Observation / Prediction

- **Evidence**: `{id, content, source, isAIGenerated}` -- 支持或反对假设的证据条目
- **Observation**: `{id, content, type, keywords, potentialIssue, researchValue, ...}` -- 研究观察记录
- **Prediction**: `{condition, expectedOutcome}` -- 可检验预测

---

## 3. 页面结构

系统共 6 个扁平路由，无动态路由。所有链接指向稳定路径。

### 3.1 路由表

| 路由 | 页面 | 用途 | 文件 |
|------|------|------|------|
| `/` | 概览 Dashboard | 系统状态总览 | `app/page.tsx` |
| `/focus` | 聚焦工作区 | 单假设深度执行 | `app/focus/page.tsx` |
| `/ideas` | 选择方向 | Idea 列表+筛选 | `app/ideas/page.tsx` |
| `/mves` | 验证记录 | MVE 实验历史 | `app/mves/page.tsx` |
| `/papers` | 论文信号流 | 论文管理+信号提取 | `app/papers/page.tsx` |
| `/areas` | 研究领域地图 | 子领域浏览 | `app/areas/page.tsx` |

**查询参数约定**：
- `/ideas?areaId=xxx` -- 按研究领域筛选 Idea
- `/mves?ideaId=xxx` -- 按 Idea 筛选 MVE

### 3.2 导航栏

6 个固定导航项，从左到右：

| 顺序 | 标签 | 图标 | 路由 | 样式 |
|------|------|------|------|------|
| 1 | 概览 | LayoutDashboard | `/` | 普通 |
| 2 | 聚焦 | Target | `/focus` | **主色高亮** (primary) |
| 3 | 选择方向 | Lightbulb | `/ideas` | 普通 |
| 4 | 论文 | FileText | `/papers` | 普通 |
| 5 | 验证记录 | FlaskConical | `/mves` | 普通 |
| 6 | 子领域 | LayoutGrid | `/areas` | 仅图标 (iconOnly) |

激活态检测：`/` 精确匹配，其他路由使用 `pathname.startsWith(href)`。

---

## 4. 核心状态管理

### 4.1 AppContext (`context/AppContext.tsx`)

全局数据状态，提供完整的 CRUD 操作。

**State 结构**：
```typescript
{
  ideaCards: IdeaCard[];
  mves: MVE[];
  papers: Paper[];
  researchAreas: ResearchArea[];
  observations: Observation[];
  isInitialized: boolean;
  // ... 其他运行时状态
}
```

**关键方法**：
- `getIdeaCardById(id)` -- 通过 ID 获取 Idea
- `getResearchAreaById(id)` -- 通过 ID 获取研究领域
- `createIdeaFromPaper(paperId)` -- 从论文生成 Idea (异步，调用 AI mock)
- `extractAssumptions(paper)` / `extractGaps(paper)` -- 提取假设/空白
- `addResearchArea(name, desc, category, keywords, questions)` -- 新增研究领域

数据持久化在 `lib/storage.ts`，使用 localStorage key `research-compass-data-v14`。首次访问自动加载 mock 数据。

### 4.2 ActiveIdeaContext (`context/ActiveIdeaContext.tsx`)

**单活跃假设状态管理**。这是整个系统的核心状态，决定 `/focus` 页面显示什么内容。

**存储**：
- localStorage key: `research-compass-active-focus-idea-id`
- 自动从旧 key (`research-compass-active-idea`) 迁移

**API**：
```typescript
interface ActiveIdeaContextType {
  activeIdeaId: string | null;      // 当前聚焦的 Idea ID
  setActiveIdea: (id: string) => void;  // 设置并导航到 /focus
  clearActiveIdea: () => void;        // 清除活跃状态
  isActive: boolean;                   // 是否有活跃 Idea
}
```

**行为规则**：
1. `setActiveIdea(id)` 将 ID 写入 localStorage，然后通过 `window.location.href` 强制导航到 `/focus`
2. `/focus` 页面在初始化时，若无活跃 Idea，自动选择最近更新的非 rejected Idea
3. 若活跃 Idea ID 对应的 Idea 已不存在，自动清除

---

## 5. 页面逻辑详解

### 5.1 Dashboard (`/`)

**用途**：一眼看清整个研究系统的当前状态。

**布局**：
1. **标题区**：h1 "Research Compass" + 副标题 "机器人科研方向管理工作台"
2. **主状态卡片**：
   - 有活跃 Idea 时：显示标题、状态 Tag、假设摘要（line-clamp-1）、三个分数条（存活/置信/证伪），右侧 "进入聚焦工作区" 主按钮
   - 无活跃 Idea 时：显示 "尚未选择研究方向" + "选择研究方向" 按钮 → `/ideas`
3. **统计卡片网格** (4 列)：Idea 总数、待验证 MVE 数、已通过 MVE 数、论文数
4. **快捷导航网格** (2 列)：聚焦工作区、研究方向、验证记录、论文信号流

**数据流**：读取 `useApp().state` + `useActiveIdea().activeIdeaId`

### 5.2 Focus Workspace (`/focus`) -- 核心页面

**用途**：围绕一个活跃假设进行深度研究执行。

**前置逻辑**：
- 未初始化 → 显示 "加载中..."
- 无活跃 Idea → 显示空状态（Target 图标 + "选择一个研究方向进入聚焦模式" + "选择研究方向" 按钮 → `/ideas`）
- 自动选择：若无活跃 Idea 且存在 Idea 卡片，自动选择最近更新的非 rejected Idea

**有活跃 Idea 时的布局** (垂直堆叠，space-y-6)：

**Zone A: FocusIdeaCard**
- Card 带左侧 teal 边框 (border-l-4 border-l-accent)
- 显示：状态 Tag (使用 IDEA_STATUS_LABELS 颜色)、标题、研究问题、核心假设 (line-clamp-2)、最多 3 个研究领域 Tag

**Zone B: ScoreMeter + EvidencePressurePanel** (md:grid-cols-2 并排)

ScoreMeter：
- 3 个 SVG 圆形仪表盘 (64x64，r=28)
  - 存活度 (蓝色 #3b82f6)
  - 置信度 (绿色 #22c55e)
  - 证伪强度 (琥珀色 #f59e0b)
- 仪表盘下方：统计行显示 "预测数 | 失败条件数 | 支持证据数 | 反对证据数"

EvidencePressurePanel：
- 三行证据压力展示：
  - ▲ 支持 (绿色) -- 显示 evidenceForHypothesis 数量 + 最新条目
  - ▼ 反对 (红色) -- 显示 evidenceAgainstHypothesis 数量 + 最新条目
  - ? 缺失 (琥珀色) -- 显示 falsificationRisks 数量 + 最新条目
- 每行不可点击，仅展示

**Zone C: NextActionCard** (视觉权重最大的卡片)
- shadow-md + 左侧 teal 边框 + 浅绿背景 (#f0fdfa)
- Target 图标 + "下一步行动" 标题
- 显示 `calculateNextAction()` 返回的 label + description
- 一个 hero 按钮，标签为 actionLabel

**Zone D: MVEGateCard**
- 垂直时间线展示活跃 Idea 的所有 MVE
- 时间线节点：圆形图标，通过=绿色、失败=红色、待实验=灰色脉动
- 每个 MVE：类型 Tag + 状态 Tag + 实验目标 (line-clamp-2) + 日期
- 失败 MVE 额外显示 resultNotes
- 底部 "查看全部" 按钮 → `/mves`
- 不可点击到详情页

### 5.3 Ideas (`/ideas`)

**用途**：选择一个假设进入聚焦模式。

**查询参数**：`?areaId=xxx` -- 从 `/areas` 页面点击区域卡片跳转过来，自动筛选该区域的 Idea。

**布局**：
1. 标题 "选择研究方向" + "选择一个方向进入聚焦模式"
2. 筛选行：搜索框 (Input) + 状态下拉 (Select) + 若有活跃 Idea 则显示 "返回聚焦" 按钮
3. Idea 列表：每项使用 IdeaSelectionCard 组件
4. CreateIdeaModal：新建 Idea

**IdeaSelectionCard 显示内容**：
- 标题、状态 Tag、假设摘要 (line-clamp-1)、研究领域 Tag (最多 3 个)
- 分数显示：存活度 + 置信度
- 操作：已聚焦时显示 "已聚焦"，否则显示 "聚焦此方向" 按钮

**聚焦选择流程**：
1. 用户点击 "聚焦此方向" 按钮
2. 调用 `setActiveIdea(ideaId)`
3. ActiveIdeaContext 写入 localStorage + 强制导航到 `/focus`
4. `/focus` 页面读取活跃 Idea 并显示完整工作区

### 5.4 MVE History (`/mves`)

**用途**：查看实验验证历史。

**查询参数**：`?ideaId=xxx` -- 从 MVE 卡片点击 "在聚焦中查看" 跳转。若无查询参数，默认使用当前活跃 Idea ID 进行筛选。

**布局**：
1. 标题 "验证记录" + 描述 (根据是否有筛选条件显示不同文案)
2. 统计行 (4 列)：总计、待实验、已通过、已失败
3. 时间线：垂直线 + MVEHistoryCard 列表

**MVEHistoryCard 显示内容**：
- 左侧：状态圆形节点 (通过=绿色 CheckCircle、失败=红色 XCircle、待实验=灰色脉动 Clock)
- 右侧 Card：MVE 类型 Tag (中英文映射) + 结果状态 Tag + 日期 + 实验目标 (line-clamp-2)
- 失败时额外显示 resultNotes
- 底部 "在聚焦中查看" 按钮 → 调用 `setActiveIdea(mve.ideaCardId)` 导航到 `/focus`

**注意**：MVE 卡片不可点击到独立的 MVE 详情页（已删除动态路由）。

### 5.5 Papers (`/papers`)

**用途**：将论文转化为研究信号。

**布局**：
1. 若有活跃 Idea：上下文横幅显示 "当前聚焦: {title}" 链接 → `/focus`，以及 "仅显示相关论文" 切换按钮
2. 标题 "论文信号流" + "从论文中提取研究信号和灵感" + "添加论文" 按钮
3. PaperSignalCard 列表
4. AddPaperModal (编辑/新增)

**PaperSignalCard 显示内容**：
- 标题 + 判断等级 Tag (background/useful/idea_source/must_review 颜色映射)
- 作者、年份、场所 (text-xs muted)
- 一句话摘要 (line-clamp-2)
- 研究领域 Tag + 阅读状态
- 操作按钮行 (ghost 变体)：
  - "编辑" → 打开 AddPaperModal
  - "生成想法" → 调用 `createIdeaFromPaper(paperId)` → `setActiveIdea(newIdea.id)` → 导航到 `/focus`
  - "假设" → `extractAssumptions(paper)`
  - "空白" → `extractGaps(paper)`
  - 若有 arxivUrl，显示外部链接图标

**"仅显示相关论文" 筛选逻辑**：
对比当前论文的 `areaIds` 与活跃 Idea 的 `areaIds`，有交集则保留。

### 5.6 Areas (`/areas`)

**用途**：按子领域浏览和管理研究方向地图。

**布局**：
1. 标题 "研究领域地图" + "按机器人子领域浏览和管理研究方向" + "新增子领域" 按钮
2. 搜索框
3. 按分类分组展示 (category)：感知、学习、控制、前沿 等
4. 每组：grid 网格 (1/2/3 列响应式) 的 AreaMapCard

**AreaMapCard 显示内容**：
- 区域名称 (hover 时变 accent 色)
- 描述 (line-clamp-2)
- 关键词 Tag (最多 3 个)
- 统计网格 (3 列)：论文数、Idea 数、MVE 数
- 更新时间

**点击行为**：整个卡片是一个 `<Link href="/ideas?areaId={area.id}">`，跳转到 Ideas 页面并自动按该领域筛选。

**编辑**：hover 时右上角出现编辑图标，打开内联模态框可编辑名称、描述、分类、关键词、关注问题。

---

## 6. Next Action 决策引擎

`calculateNextAction(idea, mves)` 是系统的核心决策逻辑，分析当前 Idea 状态，返回**唯一的下一步行动建议**。

### 6.1 优先级队列 (从高到低)

| 优先级 | 类型 | 触发条件 | 标签 | 行动路径 |
|--------|------|----------|------|----------|
| 10 | complete_core_fields | 研究问题/核心假设/意义任一为空 | 完善核心假设 | /focus |
| 9 | review_failure | 最近一次 MVE 失败 | 查看失败分析 | /focus |
| 8 | execute_pending_mve | 存在待执行的 MVE | 执行待验证实验 | /focus |
| 7 | add_predictions | 无可检验预测 | 添加可检验预测 | /focus |
| 6 | add_failure_conditions | 无失败条件 | 定义失败条件 | /focus |
| 5 | strengthen_falsification | 证伪强度 < 30 | 增强证伪性 | /focus |
| 4 | add_evidence | 支持证据 < 2 条 | 补充支持证据 | /papers |
| 3 | generate_mve | 无 MVE 且核心字段完整且有足够证据 | 生成最小可行实验 | /focus |
| 2 | idea_unstable | 存活 < 50 且置信 < 30 | Idea 状态不稳定 | /focus |
| 1 | idea_promising | 存活 >= 70 且置信 >= 60 | Idea 值得推进 | /focus |
| 0 | idea_rejected | 存活 < 20 | Idea 建议放弃 | /ideas |

### 6.2 决策逻辑

1. 遍历所有优先级条件，收集所有匹配的候选动作
2. 按优先级降序排序
3. 返回优先级最高的一条
4. 若无候选，返回默认 "开始研究" (priority 0)

**关键设计**：同一时刻只显示一个行动，避免用户在多个选项间犹豫。

---

## 7. 导航流

```
用户进入系统
    │
    ▼
  / (Dashboard)
    │ 显示当前状态概览
    │ 若无活跃 Idea → 引导去 /ideas
    │
    ├──→ /ideas (选择方向)
    │       │ 浏览/搜索/筛选 Idea
    │       │ 点击 "聚焦此方向"
    │       │   → setActiveIdea(id) → 强制跳转 /focus
    │       │
    │       └── /ideas?areaId=xxx
    │               从 /areas 点击区域卡片进入
    │
    ├──→ /focus (聚焦工作区)
    │       │ 读取活跃 Idea
    │       │ 显示: FocusIdeaCard + ScoreMeter + EvidencePressure
    │       │      + NextActionCard + MVEGateCard
    │       │
    │       │ NextActionCard 引导下一步:
    │       │   → /focus (大多数动作)
    │       │   → /papers (需要更多证据时)
    │       │   → /ideas (建议放弃时)
    │       │
    │       └── 若无活跃 Idea → 空状态 → /ideas
    │
    ├──→ /mves (验证记录)
    │       │ 按活跃 Idea 或 ?ideaId=xxx 筛选
    │       │ 点击 "在聚焦中查看"
    │       │   → setActiveIdea(ideaId) → /focus
    │       │
    │       └── /mves?ideaId=xxx
    │
    ├──→ /papers (论文信号流)
    │       │ "生成想法" → createIdeaFromPaper
    │       │   → setActiveIdea(newId) → /focus
    │       │
    │       └── "仅显示相关论文" 切换
    │
    └──→ /areas (研究领域地图)
            │ 按分类分组展示
            │ 点击区域卡片
            └── → /ideas?areaId=xxx
```

---

## 8. 组件架构

### 8.1 页面级组件

| 组件 | 文件 | 使用位置 | 职责 |
|------|------|----------|------|
| Navbar | `components/Navbar.tsx` | 全局导航 | 6 项导航栏 |
| AppShell | `components/AppShell.tsx` | 布局包装 | min-h-screen bg-bg 容器 |

### 8.2 Focus 工作区组件

| 组件 | 文件 | 职责 |
|------|------|------|
| FocusIdeaCard | `components/focus/FocusIdeaCard.tsx` | 活跃 Idea 横幅：标题、问题、假设、状态、领域 Tag |
| ScoreMeter | `components/focus/ScoreMeter.tsx` | 3 个 SVG 圆形分数仪表盘 + 统计行 |
| NextActionCard | `components/focus/NextActionCard.tsx` | 决策引擎驱动的单一行动建议卡片 |
| EvidencePressurePanel | `components/focus/EvidencePressurePanel.tsx` | 支持/反对/缺失证据计数 + 最新条目 |
| MVEGateCard | `components/focus/MVEGateCard.tsx` | MVE 垂直时间线 (不可点击) |

### 8.3 列表页组件

| 组件 | 文件 | 使用位置 | 职责 |
|------|------|----------|------|
| IdeaSelectionCard | `components/idea/IdeaSelectionCard.tsx` | /ideas | Idea 列表卡片 + 聚焦按钮 |
| MVEHistoryCard | `components/mve/MVEHistoryCard.tsx` | /mves | MVE 时间线条目 |
| PaperSignalCard | `components/paper/PaperSignalCard.tsx` | /papers | 论文信号卡片 + 操作按钮 |
| AreaMapCard | `components/area/AreaMapCard.tsx` | /areas | 区域网格卡片 → /ideas?areaId= |

### 8.4 基础 UI 组件

| 组件 | 文件 | 变体 |
|------|------|------|
| Button | `components/ui/Button.tsx` | primary, secondary, danger, hero, ghost, focus |
| Card | `components/ui/Card.tsx` | 通用卡片容器 |
| Tag | `components/ui/Tag.tsx` | 颜色标签 |
| Input | `components/ui/Input.tsx` | 文本输入 |
| Select | `components/ui/Select.tsx` | 下拉选择 |
| Textarea | `components/ui/Textarea.tsx` | 多行文本 |

### 8.5 模态框组件

| 组件 | 文件 | 用途 |
|------|------|------|
| CreateIdeaModal | `components/idea/CreateIdeaModal.tsx` | 新建 Idea (AI 生成或手动) |
| AddPaperModal | `components/paper/AddPaperModal.tsx` | 添加/编辑论文 |
| AnalysisResultModal | `components/paper/AnalysisResultModal.tsx` | AI 分析结果展示 |
| IdeaEvaluationModal | `components/idea/IdeaEvaluationModal.tsx` | Idea 评估 |

---

## 9. 设计规范

### 9.1 色彩系统

| 用途 | 色值 | CSS 变量 |
|------|------|----------|
| 主背景 | #fafaf9 | bg |
| 次背景 | #f5f5f4 | bg2 |
| 主文字 | #292524 | ink |
| 次文字 | #78716c | muted |
| 分割线 | #e7e5e4 | rule |
| 主色调 | #0d9488 | accent |
| 次色调 | #d97706 | accent2 |

### 9.2 Idea 状态颜色

| 状态 | 文字色 | 背景色 | 标签 |
|------|--------|--------|------|
| active | #1e40af | #dbeafe | 活跃 |
| unstable | #92400e | #fef3c7 | 不稳定 |
| promising | #065f46 | #d1fae5 | 值得推进 |
| rejected | #991b1b | #fee2e2 | 已拒绝 |
| revived | #7c3aed | #ede9fe | 已恢复 |

### 9.3 分数指标颜色

| 指标 | 颜色 | 含义 |
|------|------|------|
| 存活度 | #3b82f6 (蓝) | 假设的整体健康程度 |
| 置信度 | #22c55e (绿) | 证据支持的信心 |
| 证伪强度 | #f59e0b (琥珀) | 可证伪的程度 |

---

## 10. 数据流总览

```
localStorage                    React State
───────────                    ───────────
research-compass-data-v14 ──→ AppContext.state
  ├── ideaCards[]                 ├── ideaCards[]
  ├── mves[]                     ├── mves[]
  ├── papers[]                   ├── papers[]
  ├── researchAreas[]            ├── researchAreas[]
  └── observations[]             └── observations[]
                                 
research-compass-active-      ──→ ActiveIdeaContext
  focus-idea-id                    ├── activeIdeaId
                                   ├── setActiveIdea(id) → write localStorage + navigate /focus
                                   ├── clearActiveIdea() → remove localStorage
                                   └── isActive

IdeaCard
  ├── evidenceForHypothesis[]  ──→ EvidencePressurePanel (支持行)
  ├── evidenceAgainstHypothesis[] ─→ EvidencePressurePanel (反对行)
  ├── falsificationRisks[]     ──→ EvidencePressurePanel (缺失行)
  ├── survivalScore             ──→ ScoreMeter (蓝色圆环)
  ├── confidenceScore           ──→ ScoreMeter (绿色圆环)
  ├── falsificationStrength     ──→ ScoreMeter (琥珀圆环)
  ├── predictions[]             ──→ ScoreMeter 统计行
  ├── failureConditions[]       ──→ ScoreMeter 统计行
  └── areaIds[]                ──→ FocusIdeaCard (领域 Tag)

MVE[]
  └── (filtered by activeIdeaId) ──→ MVEGateCard (时间线)
                                    └─→ calculateNextAction() → NextActionCard

calculateNextAction(idea, mves)
  └── returns NextAction { type, label, description, priority, actionPath, actionLabel }
       └─→ NextActionCard (唯一行动建议)
```

---

## 11. 技术约束

1. **静态导出**：`output: 'export'`，无服务端运行时。所有页面在构建时预渲染为 HTML。
2. **basePath**：`/Research-Compass-for-Robotics`。`<Link>` 和 `router.push` 自动处理。`window.location.href` 需手动拼接完整路径。
3. **无动态路由**：已删除 `/idea/[id]`、`/mve/[id]`、`/areas/[id]`、`/detail/[type]/[id]`。所有实体交互通过查询参数和聚焦模式实现。
4. **Suspense 边界**：使用 `useSearchParams()` 的页面（`/ideas`、`/mves`）必须将内容组件包裹在 `<Suspense>` 中，避免静态导出水合不匹配。
5. **localStorage 限制**：约 5-10MB。大量论文或观察数据可能触及上限。
6. **首次访问 Mock 数据**：`lib/mockData.ts` 提供预设数据，首次加载时自动初始化。
