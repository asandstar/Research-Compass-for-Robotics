# Research Compass v0.3 → v1.0 架构重构 - 产品需求文档

## Overview
- **Summary**: 将系统从"科研记录工具"升级为"可证伪假设驱动的研究执行系统"（Hypothesis-driven Research Execution System）
- **Purpose**: 通过严格的科学方法论约束，强制用户以可证伪假设为核心组织研究活动，提升实验效率和假设淘汰速度
- **Target Users**: 机器人学/VLA/memory research 领域的研究生、青年科研工作者

## Goals
- [x] Observation 严格原子化：只记录现象，禁止包含推断性内容
- [x] IdeaCard 升级为可证伪对象：包含 hypothesis、prediction、failure_conditions、confounders
- [x] Idea 状态机去线性化：用 survival_score、confidence_score、falsification_strength 替代手动状态切换
- [x] MVE 升级为最小可执行 Benchmark：新增 mve_type，定义可量化成功/失败标准
- [x] 引入 Adversarial Reviewer：自动生成反对论点和推翻路径
- [x] Idea Graph：支持 Idea 之间的关系建模（refines/contradicts/depends_on/derived_from）
- [x] MVE Failure 学习机制：失败触发结构化知识更新

## Non-Goals (Out of Scope)
- [ ] 云端同步功能
- [ ] 团队协作功能
- [ ] 接入真实 LLM API（继续使用 Mock AI）
- [ ] 文献批量导入（Zotero 等）
- [ ] 实验数据可视化图表

## Background & Context
当前系统（v0.3）已经实现 Observation → Idea → MVE 的流转链路，但整体仍偏"信息管理系统"：
- Idea 只是想法记录，缺乏可证伪性约束
- 状态机是线性推进，无法反映假设的动态演化
- MVE 只是实验计划，缺乏可复现的 benchmark 标准
- 没有机制强制用户考虑反例和失败路径

本次重构将引入以下核心原则：
1. 科研对象必须可被明确否定
2. 每个 Idea 必须能导出最小实验验证路径
3. 每个实验必须能产生结构化失败信息
4. 系统必须鼓励"推翻 idea"，而不是"记录 idea"

## Functional Requirements

### FR-1: Observation 严格原子化
- **FR-1.1**: Observation type 新增 `anomaly` 类型
- **FR-1.2**: Observation 新增 `context` 和 `signals` 字段
- **FR-1.3**: 新增 `validate_no_hypothesis_embedding()` 校验函数
- **FR-1.4**: 如果 Observation 包含推断性内容（因此/表明/说明/证明），提示用户降级为 Idea candidate

### FR-2: IdeaCard 升级为可证伪对象
- **FR-2.1**: 新增 `hypothesis` 字段（明确可检验陈述）
- **FR-2.2**: 新增 `predictions` 字段（不同条件下的预期结果）
- **FR-2.3**: 新增 `failureConditions` 字段（哪些结果会直接否定该 idea）
- **FR-2.4**: 新增 `confounders` 字段（可能导致误判的因素）
- **FR-2.5**: 替换证据结构：`supportingEvidence` → `evidenceForHypothesis`，`opposingEvidence` → `evidenceAgainstHypothesis`，`missingEvidence` → `falsificationRisks`
- **FR-2.6**: 新增 `generateCounterarguments()` 方法
- **FR-2.7**: 新增 `generateFalsificationExperiments()` 方法
- **FR-2.8**: 新增 `generateEdgeCases()` 方法
- **FR-2.9**: Idea 创建时必须同时包含支持证据和最强反例路径

### FR-3: Idea 状态机重构（去线性化）
- **FR-3.1**: 新增 `survivalScore`（核心指标，0-100）
- **FR-3.2**: 新增 `confidenceScore`（置信度，0-100）
- **FR-3.3**: 新增 `falsificationStrength`（可证伪强度，0-100）
- **FR-3.4**: 废除线性状态，改为计算得出：`active` / `unstable` / `promising` / `rejected` / `revived`
- **FR-3.5**: 状态由 MVE 成功率、反例压力测试结果、证据一致性决定

### FR-4: MVE 升级为最小可执行 Benchmark
- **FR-4.1**: 新增 `mve_type` 字段：`sanity_check` / `ablation` / `generalization_test` / `stress_test`
- **FR-4.2**: 新增 `taskDefinition` 字段
- **FR-4.3**: 新增 `evaluationProtocol` 字段
- **FR-4.4**: 新增 `baselineReferences` 字段（至少1个）
- **FR-4.5**: `successCriteria` 必须可量化
- **FR-4.6**: 新增 `failureModes` 分类结构
- **FR-4.7**: 新增 `minimalEnvOrDataset` 字段
- **FR-4.8**: 每个 MVE 必须能推翻 Idea
- **FR-4.9**: 每个 MVE 必须能复现实验过程

### FR-5: Adversarial Reviewer（关键）
- **FR-5.1**: 系统为每个 Idea 自动生成反对者模块
- **FR-5.2**: 输出 `strongestCounterarguments`
- **FR-5.3**: 输出 `likelyFailureScenarios`
- **FR-5.4**: 输出 `falsificationExperiments`
- **FR-5.5**: 反对者模块目标：优先推翻 Idea，而不是验证 Idea

### FR-6: Idea Graph
- **FR-6.1**: 支持 Idea 之间的关系建模
- **FR-6.2**: 关系类型：`refines`（改进）/ `contradicts`（冲突）/ `depends_on`（依赖）/ `derived_from`（来源）
- **FR-6.3**: 系统支持 Idea graph 视图，而不是 list

### FR-7: MVE Failure 学习机制
- **FR-7.1**: MVE 失败不能直接终止 Idea
- **FR-7.2**: 失败触发 `failureReasonTaxonomy`
- **FR-7.3**: 失败触发 `hypothesisUpdateSuggestion`
- **FR-7.4**: 失败触发 `nextMveGeneration`
- **FR-7.5**: 失败必须转化为结构化知识更新

### FR-8: 强制验证规则
- **FR-8.1**: 每个 Idea 至少有一个失败路径（failureConditions 非空）
- **FR-8.2**: 每个 MVE 必须定义 failure condition
- **FR-8.3**: 每个结果必须更新 hypothesis 状态

## Non-Functional Requirements
- **NFR-1**: 低实验成本迭代支持（机器人学/VLA 场景）
- **NFR-2**: 高证伪效率（快速淘汰错误假设）
- **NFR-3**: 可复现的实验协议
- **NFR-4**: 快速假设修剪

## Constraints
- **Technical**: Next.js 15 + React 19 + TypeScript + Tailwind CSS，保持静态导出
- **Business**: 单人使用，localStorage 数据持久化
- **Dependencies**: Mock AI 模拟所有 AI 生成功能

## Assumptions
- [ ] 用户理解可证伪假设的基本概念
- [ ] 用户愿意接受系统的强制验证规则
- [ ] Mock AI 模板足够覆盖机器人学/VLA/memory research 场景

## Acceptance Criteria

### AC-1: Observation 校验
- **Given**: 用户输入包含"因此"的观察内容
- **When**: 提交观察
- **Then**: 系统提示用户内容包含推断性表述，并询问是否创建为 Idea candidate
- **Verification**: `programmatic`

### AC-2: Idea 必须包含反例路径
- **Given**: 用户创建 Idea
- **When**: 提交 Idea（evidenceAgainstHypothesis 为空）
- **Then**: 系统阻止提交，提示"必须提供至少一条反对证据或最强反例"
- **Verification**: `programmatic`

### AC-3: Idea 状态自动计算
- **Given**: Idea 的 MVE 失败
- **When**: 更新 MVE 结果
- **Then**: Idea 的 survivalScore 下降，状态可能变为 unstable 或 rejected
- **Verification**: `programmatic`

### AC-4: MVE 必须定义失败条件
- **Given**: 用户创建 MVE
- **When**: 提交 MVE（failureModes 为空）
- **Then**: 系统阻止提交，提示"必须定义失败模式"
- **Verification**: `programmatic`

### AC-5: Adversarial Reviewer 输出
- **Given**: 用户创建或更新 Idea
- **When**: 触发 AI 分析
- **Then**: 系统生成 strongestCounterarguments、likelyFailureScenarios、falsificationExperiments
- **Verification**: `human-judgment`

### AC-6: Idea Graph 关系
- **Given**: 用户查看 Idea 详情
- **When**: 查看关联 Idea
- **Then**: 显示 Idea 之间的关系（refines/contradicts/depends_on/derived_from）
- **Verification**: `human-judgment`

### AC-7: MVE Failure 学习
- **Given**: MVE 标记为失败
- **When**: 系统处理失败结果
- **Then**: 生成 failureReasonTaxonomy、hypothesisUpdateSuggestion、nextMveGeneration
- **Verification**: `programmatic`

## Open Questions
- [ ] 用户界面如何展示 Idea Graph？是列表 + 关系标签还是可视化图？
- [ ] survivalScore、confidenceScore、falsificationStrength 的具体计算公式？
- [ ] 如何处理 Legacy 数据（v0.3 的 IdeaCard 数据）迁移？
