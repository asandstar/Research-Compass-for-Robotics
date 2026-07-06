# Research Compass v1.0 代码审查修复计划

## 审查总结

经过全面代码审查，发现以下问题：

### 🔴 严重问题
1. **状态过滤逻辑完全失效** - Ideas 页面的状态过滤器使用旧状态值（researching, rough, mve_running, abandoned），但新类型系统使用（active, unstable, promising, rejected, revived）
2. **stateCalculator 状态判断顺序错误** - `survivalScore < 20` 的检查永远不会被执行，因为 `survivalScore < 50` 的条件会先捕获

### 🟡 中等问题
3. **mockAI 返回旧字段名** - `mockGenerateIdeaEvidence` 返回旧字段名，虽然在 AppContext 中有映射，但不一致
4. **IdeaWorkspaceClient 缺少新字段编辑** - 用户无法编辑 hypothesis、predictions、failureConditions、confounders 等关键字段
5. **IdeaCardMini 不展示新指标** - 迷你卡片只显示 sourceObservations，不显示新的评分系统（survivalScore, confidenceScore, falsificationStrength）
6. **缺少 revived 状态统计** - 仪表盘和 Ideas 页面统计不包含 revived 状态

### 🟢 轻微问题
7. **Failure Analysis 无 UI 展示** - MVE 的 failureAnalysis 数据没有在界面展示
8. **缺少可证伪性强制校验** - 系统没有强制校验每个 Idea 必须包含失败路径

---

## 修复任务

### Task 1: 修复 stateCalculator.ts 状态判断逻辑错误
- **优先级**: high
- **描述**: 修复 calculateIdeaState 函数中条件判断顺序问题，确保 `survivalScore < 20` 的 rejected 状态能被正确识别
- **文件**: `lib/stateCalculator.ts`
- **修复**: 将 `survivalScore < 20` 检查移到 `survivalScore < 50` 之前

### Task 2: 修复 Ideas 页面状态过滤器
- **优先级**: high
- **描述**: 更新 app/ideas/page.tsx 中的 statusOptions 数组，使用新的状态值（active, unstable, promising, rejected, revived）
- **文件**: `app/ideas/page.tsx`
- **修复**: 更新 statusOptions 数组和标签显示

### Task 3: 更新 mockAI 返回新字段名
- **优先级**: medium
- **描述**: 更新 `mockGenerateIdeaEvidence` 返回值使用新字段名（evidenceForHypothesis, evidenceAgainstHypothesis, falsificationRisks）
- **文件**: `lib/mockAI.ts`
- **修复**: 修改返回对象的字段名，并更新 AppContext 中的调用处

### Task 4: IdeaWorkspaceClient 添加新字段编辑能力
- **优先级**: medium
- **描述**: 在 Idea 详情页添加 hypothesis、predictions、failureConditions、confounders 字段的编辑功能
- **文件**: `app/idea/[id]/IdeaWorkspaceClient.tsx`
- **修复**: 扩展 handleFieldChange 类型，添加新字段的表单输入

### Task 5: 更新 IdeaCardMini 展示新指标
- **优先级**: medium
- **描述**: 更新迷你卡片展示 survivalScore、confidenceScore、falsificationStrength 等新指标，替换过时的 sourceObservations
- **文件**: `components/idea/IdeaCardMini.tsx`
- **修复**: 添加评分显示和进度条

### Task 6: 添加 revived 状态统计
- **优先级**: low
- **描述**: 在仪表盘和 Ideas 页面统计中添加 revived 状态计数
- **文件**: `app/page.tsx`, `app/ideas/page.tsx`
- **修复**: 更新 stats 计算逻辑

### Task 7: 展示 MVE Failure Analysis
- **优先级**: low
- **描述**: 在 MVE 详情页展示 failureAnalysis 数据（failureReasonTaxonomy, hypothesisUpdateSuggestion, nextMveGeneration）
- **文件**: `app/mve/[id]/MVEResultClient.tsx`
- **修复**: 添加失败分析展示区块

---

## 验证方法

1. **TypeScript 类型检查**: `npx tsc --noEmit`
2. **构建验证**: `npm run build`
3. **功能验证**: 手动检查每个修复点的 UI 和逻辑

---

## 风险评估

- **低风险**: Tasks 1-3 主要是逻辑修复和字段名更新，不影响核心功能
- **中等风险**: Tasks 4-5 涉及 UI 修改，需要确保布局正常
- **低风险**: Tasks 6-7 是增强功能，不影响现有功能