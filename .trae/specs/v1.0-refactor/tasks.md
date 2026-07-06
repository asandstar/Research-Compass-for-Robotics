# Research Compass v0.3 → v1.0 架构重构 - 实现计划

## [ ] Task 1: 重构 Observation 类型 - 严格原子化
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 `lib/types.ts` 中扩展 Observation 类型，新增 `anomaly` 类型、`context` 和 `signals` 字段
  - 新增 `validateNoHypothesisEmbedding()` 校验函数
  - 更新 Mock AI 的 `mockAnalyzeObservation` 以支持新字段
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: Observation 类型包含 anomaly，context 和 signals 字段
  - `programmatic` TR-1.2: `validateNoHypothesisEmbedding()` 能检测"因此/表明/说明/证明"等推断性词汇
  - `human-judgement` TR-1.3: 观察输入表单在包含推断性内容时显示提示

## [ ] Task 2: 重构 IdeaCard 类型 - 升级为可证伪对象
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 `lib/types.ts` 中重构 IdeaCard 类型：
    - 新增 `hypothesis`、`predictions`、`failureConditions`、`confounders` 字段
    - 替换证据结构：`supportingEvidence` → `evidenceForHypothesis`，`opposingEvidence` → `evidenceAgainstHypothesis`，`missingEvidence` → `falsificationRisks`
    - 新增分数字段：`survivalScore`、`confidenceScore`、`falsificationStrength`
    - 替换状态：`active` / `unstable` / `promising` / `rejected` / `revived`
  - 更新 `IDEA_STATUS_LABELS` 常量
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: IdeaCard 类型包含 hypothesis、predictions、failureConditions、confounders 字段
  - `programmatic` TR-2.2: 证据字段已替换为 evidenceForHypothesis、evidenceAgainstHypothesis、falsificationRisks
  - `programmatic` TR-2.3: 新增 survivalScore、confidenceScore、falsificationStrength 数值字段

## [ ] Task 3: 重构 MVE 类型 - 升级为最小可执行 Benchmark
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 在 `lib/types.ts` 中重构 MVE 类型：
    - 新增 `mve_type` 字段（sanity_check/ablation/generalization_test/stress_test）
    - 新增 `taskDefinition`、`evaluationProtocol`、`baselineReferences`、`failureModes`、`minimalEnvOrDataset` 字段
    - `successCriteria` 改为可量化结构
  - 更新 `MVE_RESULT_LABELS` 常量
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: MVE 类型包含 mve_type 字段和所有新增字段
  - `programmatic` TR-3.2: failureModes 是分类结构
  - `human-judgement` TR-3.3: MVE 创建表单要求定义失败模式

## [ ] Task 4: 实现 Adversarial Reviewer Mock AI
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 在 `lib/mockAI.ts` 中新增 `mockGenerateAdversarialReview()` 函数
  - 函数输出：`strongestCounterarguments`、`likelyFailureScenarios`、`falsificationExperiments`
  - 基于模板选择器生成反对论点，目标是推翻 Idea
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: `mockGenerateAdversarialReview()` 函数存在并返回正确结构
  - `human-judgement` TR-4.2: 反对者输出内容有说服力，确实是在尝试推翻 Idea

## [ ] Task 5: 实现 Idea Graph 关系模型
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 在 `lib/types.ts` 中新增 `IdeaRelationship` 接口
  - 支持关系类型：`refines`/`contradicts`/`depends_on`/`derived_from`
  - 在 AppState 中新增 `ideaRelationships` 数组
  - 在 AppContext 中添加关系管理 actions 和方法
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-5.1: `IdeaRelationship` 接口存在，支持四种关系类型
  - `programmatic` TR-5.2: AppState 包含 ideaRelationships 数组
  - `human-judgement` TR-5.3: Idea 详情页显示关联 Idea 及其关系类型

## [ ] Task 6: 实现 MVE Failure 学习机制
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - 在 `lib/types.ts` 中新增 `FailureAnalysis` 接口（包含 failureReasonTaxonomy、hypothesisUpdateSuggestion、nextMveGeneration）
  - 在 MVE 类型中新增 `failureAnalysis` 字段
  - 在 `lib/mockAI.ts` 中新增 `mockAnalyzeFailure()` 函数
  - 更新 AppContext 的 `updateMVEResult` 逻辑：失败时触发 failure analysis，更新 Idea 分数而不是直接标记 abandoned
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-6.1: `FailureAnalysis` 接口存在并包含所有必要字段
  - `programmatic` TR-6.2: MVE 失败时调用 `mockAnalyzeFailure()` 并更新 Idea 分数
  - `programmatic` TR-6.3: Idea 的 survivalScore 在 MVE 失败时下降

## [ ] Task 7: 实现状态自动计算逻辑
- **Priority**: high
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 创建 `lib/stateCalculator.ts`，实现状态计算逻辑
  - `calculateIdeaState()`: 根据 survivalScore、confidenceScore、falsificationStrength 计算状态
  - 状态规则：
    - survivalScore >= 70 && confidenceScore >= 60 → promising
    - survivalScore >= 50 && confidenceScore >= 40 → active
    - survivalScore < 50 || confidenceScore < 30 → unstable
    - survivalScore < 20 → rejected
  - 更新 AppContext 的 reducer，移除手动状态切换，改为自动计算
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-7.1: `calculateIdeaState()` 函数存在并返回正确状态
  - `programmatic` TR-7.2: Idea 状态由分数自动计算，不是手动设置
  - `programmatic` TR-7.3: MVE 失败后 Idea 状态可能变为 unstable 或 rejected

## [ ] Task 8: 更新 AppContext 状态管理
- **Priority**: high
- **Depends On**: Task 1-7
- **Description**: 
  - 更新 `context/AppContext.tsx` 的 Action 类型
  - 更新 reducer 处理新类型和字段
  - 更新所有 dispatch 方法（createIdeaCard、updateIdeaCard、generateMVE、updateMVEResult 等）
  - 添加新方法：`addIdeaRelationship`、`removeIdeaRelationship`、`generateAdversarialReview`、`analyzeFailure`
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: 所有 Action 类型和 reducer 分支更新完成
  - `programmatic` TR-8.2: 新方法（addIdeaRelationship、generateAdversarialReview、analyzeFailure）存在
  - `human-judgement` TR-8.3: 状态管理逻辑正确，数据流转正常

## [ ] Task 9: 更新 Mock Data 种子数据
- **Priority**: medium
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 更新 `lib/mockData.ts`，将现有数据转换为新类型结构
  - 添加新字段的示例数据（hypothesis、predictions、failureConditions、mve_type 等）
  - 添加 Adversarial Reviewer 的示例输出
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-9.1: mockData 导出的数据符合新类型定义
  - `human-judgement` TR-9.2: 种子数据包含丰富的示例内容

## [ ] Task 10: 更新 UI 组件 - Idea Workspace
- **Priority**: medium
- **Depends On**: Task 8
- **Description**: 
  - 更新 `app/idea/[id]/IdeaWorkspaceClient.tsx`
  - 添加 hypothesis、predictions、failureConditions、confounders 的编辑表单
  - 替换证据区域为新的三栏：evidenceForHypothesis / evidenceAgainstHypothesis / falsificationRisks
  - 添加 Adversarial Reviewer 输出展示区域
  - 添加分数展示和状态自动计算结果
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `human-judgement` TR-10.1: Idea Workspace 包含所有新字段的编辑表单
  - `human-judgement` TR-10.2: 证据区域显示为新的三栏结构
  - `human-judgement` TR-10.3: Adversarial Reviewer 输出在 UI 中可见

## [ ] Task 11: 更新 UI 组件 - MVE Result
- **Priority**: medium
- **Depends On**: Task 8
- **Description**: 
  - 更新 `app/mve/[id]/MVEResultClient.tsx`
  - 添加 mve_type 选择器
  - 添加 taskDefinition、evaluationProtocol、baselineReferences、failureModes 表单
  - 添加 Failure Analysis 展示区域（失败时显示）
  - 添加状态自动更新逻辑
- **Acceptance Criteria Addressed**: AC-4, AC-7
- **Test Requirements**:
  - `human-judgement` TR-11.1: MVE Result 页面包含所有新字段的编辑表单
  - `human-judgement` TR-11.2: 失败模式（failureModes）定义清晰
  - `human-judgement` TR-11.3: Failure Analysis 在 MVE 失败时正确显示

## [ ] Task 12: 更新 UI 组件 - Ideas 列表页
- **Priority**: medium
- **Depends On**: Task 8
- **Description**: 
  - 更新 `app/ideas/page.tsx`
  - 添加分数展示（survivalScore、confidenceScore）
  - 更新状态标签为新状态（active/unstable/promising/rejected/revived）
  - 添加 Idea Graph 关系展示
- **Acceptance Criteria Addressed**: AC-3, AC-6
- **Test Requirements**:
  - `human-judgement` TR-12.1: Ideas 列表显示分数和新状态标签
  - `human-judgement` TR-12.2: Idea 关系在列表中可见

## [ ] Task 13: 更新 UI 组件 - Dashboard
- **Priority**: low
- **Depends On**: Task 8
- **Description**: 
  - 更新 `app/page.tsx`
  - 更新统计卡片以反映新状态
  - 添加 Idea 分数统计展示
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-13.1: Dashboard 统计卡片更新为新状态

## [ ] Task 14: Legacy 数据迁移
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 在 `lib/storage.ts` 中实现数据迁移逻辑
  - 将 v0.3 的 IdeaCard 和 MVE 数据转换为 v1.0 结构
  - 更新 localStorage 存储键版本号
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `programmatic` TR-14.1: 旧数据能正确迁移到新结构
  - `human-judgement` TR-14.2: 用户打开应用后旧数据可见且格式正确

## [ ] Task 15: 构建验证和类型检查
- **Priority**: high
- **Depends On**: Task 1-14
- **Description**: 
  - 运行 TypeScript 类型检查
  - 运行 Next.js 构建
  - 确保所有静态页面正确生成
- **Acceptance Criteria Addressed**: 所有 AC
- **Test Requirements**:
  - `programmatic` TR-15.1: TypeScript 类型检查通过（0 errors）
  - `programmatic` TR-15.2: Next.js 构建成功，生成静态页面
