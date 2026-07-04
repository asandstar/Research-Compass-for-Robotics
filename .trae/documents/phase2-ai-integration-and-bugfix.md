# Phase 2 计划：激活闲置 AI 功能 + 修复关键半成品

## 概述

Phase 1 完成了 Paper 数据模型扩展和 Mock AI 函数实现（假设提取、缺口分析、Idea 评估），但这 3 个 AI 功能虽然在 `mockAI.ts` 和 `AppContext.tsx` 中已实现并暴露，**UI 中完全没有调用入口**。同时，代码库中存在几个明显的半成品（子领域增删改功能缺失、AreaDetail 按钮无效、Idea 手动创建无入口等）。

Phase 2 的目标：**让已实现的 AI 功能真正可用，修复阻塞核心工作流的半成品**，使整个工具形成完整可演示的闭环。

## 当前状态分析

### 已实现但 UI 未调用的 AI 功能（3 个）
| AI 功能 | Context 方法 | 状态 |
|---------|-------------|------|
| 假设提取（5 类假设 + 验证问题） | `extractAssumptions` | PaperCard 无按钮 |
| 缺口分析（研究空白 + 证据 + 弱点） | `extractGaps` | PaperCard 无按钮 |
| Idea 评估（8 维度评分 + 建议） | `evaluateIdea` | IdeaWorkspace 无按钮 |

### 关键半成品（按严重性排序）
1. **`app/areas/page.tsx`**：`handleSubmit` 只有 `// TODO`，新增/编辑子领域不落库
2. **`app/areas/[id]/AreaDetailClient.tsx`**：新增论文按钮无弹窗、新增 Idea 按钮无 handler
3. **`createIdeaCard`**：Context 方法存在但无 UI 入口，无法手动新建 Idea
4. **`EvidenceList.tsx`**：只能删除证据，无法新增
5. **`ObservationInput` / `IdeaCardMini`**：组件已实现但未挂载
6. **Navbar**：缺少 Ideas / MVE 列表入口

## 计划分组

将 Phase 2 分为 **2 个子阶段**，按优先级执行：

---

### 子阶段 2A：激活 3 个闲置 AI 功能（核心价值）

#### 1. PaperCard 添加"提取假设"和"分析缺口"按钮

**文件**：`components/paper/PaperCard.tsx`

**改动**：
- 在完整模式的操作区（编辑/生成 Idea 按钮旁）新增 2 个按钮：
  - "提取假设"（Microscope 图标）→ 调用 `extractAssumptions(paper)`
  - "分析缺口"（Search 图标）→ 调用 `extractGaps(paper)`
- 新增 Props：`onExtractAssumptions?: (paper: Paper) => void`、`onExtractGaps?: (paper: Paper) => void`
- 结果展示：用 Modal/Drawer 展示分析结果，不自动写入 Paper 数据（符合"AI 生成内容需用户确认"原则）
- 假设提取结果展示 5 类假设（任务/感知/数据/机器人/评估）+ 验证问题列表
- 缺口分析结果展示每个 gap 的 description / evidenceFor / whyWeak

**新增组件**：`components/paper/AnalysisResultModal.tsx`（复用 Modal 基础组件，展示 AI 分析结果）

#### 2. IdeaWorkspace 添加"Idea 评估"功能

**文件**：`app/idea/[id]/IdeaWorkspaceClient.tsx`

**改动**：
- 在 Idea 信息卡片区域新增"AI 评估"按钮（ClipboardCheck 图标）
- 点击调用 `evaluateIdea({title, researchQuestion, coreHypothesis, roboticsTask, baseline})`
- 结果用 Modal 展示：
  - 8 个维度的评分条（进度条 + 分数 + 说明）
  - 推荐结论（proceed / revise / drop）醒目展示
  - 如果有 revisedHypothesis，展示"建议修订的假设"，并提供"采纳"按钮（一键写回 coreHypothesis）

**新增组件**：`components/idea/IdeaEvaluationModal.tsx`

#### 3. 页面层接入

**文件**：`app/papers/page.tsx`、`app/areas/[id]/AreaDetailClient.tsx`

**改动**：
- `papers/page.tsx`：给 PaperCard 传入 `onExtractAssumptions` 和 `onExtractGaps` 回调
- `AreaDetailClient.tsx`：compact 模式暂不加按钮（保持简洁），只在完整模式启用

---

### 子阶段 2B：修复关键半成品（工作流闭环）

#### 4. 修复子领域新增/编辑功能

**文件**：`app/areas/page.tsx`

**改动**：
- 实现 `handleSubmit`：调用 `addResearchArea` / `updateResearchArea`
- 表单字段：name、description、category、keywords（逗号分隔）、focusQuestions（换行分隔）
- 编辑模式：点击编辑按钮预填表单数据
- 新增成功后关闭弹窗并刷新列表

#### 5. 修复 AreaDetailClient 的失效按钮

**文件**：`app/areas/[id]/AreaDetailClient.tsx`

**改动**：
- 渲染 `<AddPaperModal>` 组件（当前设置 `showAddPaper` 但没渲染弹窗）
- 给 AddPaperModal 传入 `defaultAreaId={area.id}`，自动预选当前子领域
- "新增 Idea"按钮：打开一个简化的 Idea 创建弹窗（输入 title + researchQuestion → 调用 `createIdeaCard`）
- 相关论文列表的 PaperCard 传入 `onEdit` 和 `onGenerateIdea` 回调

**新增组件**：`components/idea/CreateIdeaModal.tsx`（简化版 Idea 创建弹窗）

#### 6. 给 EvidenceList 添加新增证据功能

**文件**：`components/idea/EvidenceList.tsx`

**改动**：
- 底部新增输入框 + 添加按钮
- 输入内容后调用 `onAdd(content, evidenceType)` 回调
- AppContext 新增 `addEvidence(ideaId, evidenceType, content)` 方法

**文件**：`context/AppContext.tsx`

**改动**：
- 新增 `addEvidence` reducer action 和方法
- 支持向 supportingEvidence / opposingEvidence / missingEvidence 添加新证据

---

## 不做的事情（明确排除）

以下事项不在 Phase 2 范围内，避免过度膨胀：

- ❌ 不新增 Ideas 列表页 / MVE 列表页（通过 Dashboard 和 AreaDetail 访问已够用）
- ❌ 不挂载 ObservationInput 组件（当前通过 IdeaWorkspace 的"补充观察"已覆盖）
- ❌ 不清理死代码 `mockGenerateMVE`（低优先级，不影响功能）
- ❌ 不做 Navbar 入口扩展（当前 3 个入口足够）
- ❌ 不新增 Prompt Library / Research Drills / Fault Tree（这是 Phase 3 的内容）

## 验证步骤

### 功能验证
1. **假设提取**：Paper Library → 任一论文 → 点"提取假设" → 弹窗展示 5 类假设
2. **缺口分析**：Paper Library → 任一论文 → 点"分析缺口" → 弹窗展示研究空白
3. **Idea 评估**：Idea Workspace → 点"AI 评估" → 弹窗展示 8 维评分 + 建议
4. **子领域创建**：Research Areas → 创建 → 填表 → 保存 → 列表刷新出现新卡片
5. **AreaDetail 新增论文**：子领域详情 → 新增论文 → 弹窗弹出 → 预选当前子领域
6. **AreaDetail 新增 Idea**：子领域详情 → 新增 Idea → 弹窗 → 保存 → Idea 出现在列表
7. **证据新增**：Idea Workspace → 证据栏 → 输入内容 → 添加 → 证据出现在列表

### 构建验证
- `npm run build` 通过，无 TypeScript 错误
- 存储版本号是否需要升级（如果改动数据结构才需要）
- GitHub Pages 部署成功

## 假设与决策

1. **AI 分析结果不自动写入数据**：遵循用户偏好"AI 生成内容需用户确认后保存"，分析结果先展示在 Modal 中，用户可以选择忽略或手动采纳
2. **Idea 评估的"采纳修订假设"**：这是一键写入的唯一例外，因为用户点击"采纳"就是确认行为
3. **新增证据标记为非 AI 生成**：手动添加的证据 `isAIGenerated = false`
4. **CreateIdeaModal 是简化版**：只输入 title + researchQuestion，其余字段通过 AI 生成或后续编辑补充
5. **存储版本号**：如果只新增 `addEvidence` 方法不改变数据结构，不需要升级版本号
