# Research Compass v0.3 → v1.0 架构重构 - 验证检查清单

## 类型定义验证
- [ ] Observation 类型包含 anomaly、context、signals 字段
- [ ] IdeaCard 类型包含 hypothesis、predictions、failureConditions、confounders 字段
- [ ] IdeaCard 证据字段已替换为 evidenceForHypothesis、evidenceAgainstHypothesis、falsificationRisks
- [ ] IdeaCard 包含 survivalScore、confidenceScore、falsificationStrength 数值字段
- [ ] IdeaCard 状态为 active/unstable/promising/rejected/revived
- [ ] MVE 类型包含 mve_type 字段（sanity_check/ablation/generalization_test/stress_test）
- [ ] MVE 类型包含 taskDefinition、evaluationProtocol、baselineReferences、failureModes、minimalEnvOrDataset 字段
- [ ] FailureAnalysis 接口存在（failureReasonTaxonomy、hypothesisUpdateSuggestion、nextMveGeneration）
- [ ] IdeaRelationship 接口存在，支持 refines/contradicts/depends_on/derived_from 关系类型

## Mock AI 验证
- [ ] `validateNoHypothesisEmbedding()` 能检测推断性词汇
- [ ] `mockGenerateAdversarialReview()` 函数存在并返回正确结构
- [ ] `mockAnalyzeFailure()` 函数存在并返回 FailureAnalysis 结构

## 状态管理验证
- [ ] AppState 包含 ideaRelationships 数组
- [ ] Action 类型和 reducer 分支更新完成
- [ ] 新方法存在：addIdeaRelationship、removeIdeaRelationship、generateAdversarialReview、analyzeFailure
- [ ] Idea 状态由分数自动计算，不是手动设置

## 状态计算验证
- [ ] `calculateIdeaState()` 函数存在并返回正确状态
- [ ] MVE 失败后 Idea 的 survivalScore 下降
- [ ] MVE 失败后 Idea 状态可能变为 unstable 或 rejected（不是直接标记 abandoned）

## UI 验证
- [ ] Idea Workspace 包含 hypothesis、predictions、failureConditions、confounders 编辑表单
- [ ] Idea Workspace 证据区域显示为新的三栏结构
- [ ] Idea Workspace 显示 Adversarial Reviewer 输出
- [ ] Idea Workspace 显示分数和状态自动计算结果
- [ ] MVE Result 页面包含 mve_type 选择器
- [ ] MVE Result 页面包含 failureModes 定义表单
- [ ] MVE Result 页面在失败时显示 Failure Analysis
- [ ] Ideas 列表显示分数和新状态标签
- [ ] Dashboard 统计卡片更新为新状态

## 数据迁移验证
- [ ] localStorage 存储键版本号更新
- [ ] 旧数据能正确迁移到新结构

## 构建验证
- [ ] TypeScript 类型检查通过（0 errors）
- [ ] Next.js 构建成功
- [ ] 所有静态页面正确生成

## 强制验证规则
- [ ] Idea 创建时必须包含至少一条反对证据（evidenceAgainstHypothesis 非空）
- [ ] MVE 创建时必须定义失败模式（failureModes 非空）
- [ ] Observation 包含推断性内容时显示提示
