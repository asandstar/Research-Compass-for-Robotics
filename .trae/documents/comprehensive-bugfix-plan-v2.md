# Research Compass for Robotics — 综合问题修复计划 v2

## Summary

本次检查在原 `comprehensive-bugfix-plan.md` 基础上,发现 **6 项原计划未修复** + **4 项新发现的严重问题** + **5 项新发现的高严重问题** + **多项中严重新问题**。本计划完成原计划剩余部分,并修复所有影响数据完整性、功能正确性、用户误导的严重/高严重问题。

**修复目标**:
1. 完成原计划未修复的 6 项(阶段 1)
2. 修复 4 项新发现的严重数据/功能问题(阶段 2)
3. 修复 5 项新发现的高严重问题(阶段 3)
4. 修复关键中严重问题(阶段 4)
5. 验证收尾(阶段 5)

---

## Current State Analysis

### 原计划已完成(对照 comprehensive-bugfix-plan.md)
- ✅ 1.1 dynamicParams = true(3 个 page.tsx)
- ✅ 1.2 AddPaperModal 年份 NaN
- ✅ 1.3 PaperCard 误导性 cursor
- ✅ 1.4 ObservationCard border-l-[3px]
- ✅ 2.1 Dashboard 统计卡片可点击 + no-underline
- ✅ 2.2 Dashboard 最近论文列表项可点击
- ✅ 2.3 AreaDetailClient "查看全部" → `/papers?area=${areaId}`
- ✅ 2.4 button 嵌套 Link(app/page.tsx 快速开始)
- ✅ 2.7 MVEResultClient lazy initializer
- ✅ 2.8 DELETE_IDEA_CARD 级联清理
- ✅ 2.9 selectTemplate 中文关键词

### 原计划未完成(阶段 1 处理)
- ❌ H1: ObservationInput 缺 'use client'
- ❌ H2: AddPaperModal 2 处原生 select 未替换
- ❌ H3: app/areas/page.tsx 原生 select 未替换
- ❌ H4: AddPaperModal updatePaper 类型污染
- ❌ H5: STORAGE_KEY 仍为 v12
- ❌ H6: papers/page.tsx 未实现 useSearchParams
- ❌ M1: IdeaCardMini 缺 'use client'
- ❌ M2: Textarea 缺 'use client'
- ❌ M3: 3 个死代码组件未挂载
- ❌ M4: IdeaCardMini Link 缺 no-underline
- ❌ M5: 所有原生 textarea 未替换

### 新发现严重问题(阶段 2 处理)
1. **mockAI.ts cvTemplates 内容误导**:默认 fallback 返回 CIFAR-100-LT 图像分类内容,与机器人项目无关。所有机器人模板合并 cvTemplates 后,`observation` 字段永远来自 cvTemplates(对比学习/长尾分布),严重误导用户
2. **IdeaWorkspaceClient handleAddObservation 不持久化**:第 111-120 行只调用 `setIdeaCard` 本地 state,不调用 `updateIdeaCard`,导致孤立 Observation 数据
3. **IdeaWorkspaceClient 三个 handleRemove* 同样不持久化**:第 90-109 行删除证据只改本地 state,导航离开即丢失
4. **storage.ts JSON 解析失败丢数据**:第 123-132 行 catch 块返回 mock 数据,AppContext 立即回写 localStorage,覆盖用户原始数据

### 新发现高严重问题(阶段 3 处理)
1. **AppContext DELETE_PAPER 不级联清理**:第 199-203 行不清理 IdeaCard.sourcePaperIds 的悬空引用
2. **storage.ts 空数组回退逻辑错误**:第 78-83 行,用户清空 ResearchArea/Paper 后会被回退为 mock 数据
3. **IdeaWorkspaceClient useEffect 覆盖编辑中内容**:第 29-31 行依赖 `state.ideaCards`,任何无关 dispatch 都会覆盖用户未保存编辑
4. **storage.ts addDefaultMVEFields 不迁移 resultStatus**:legacy 值如 'success' 不会被映射为 'passed'
5. **AppContext 缺 DELETE_AREA action**:用户无法删除误建的子领域

### 新发现中严重问题(阶段 4 处理关键项)
1. **app/areas/page.tsx button 嵌套 Link**:第 86-147 行,与原计划 1.5 同类问题
2. **app/layout.tsx 缺 metadata**:无 title/description,影响浏览器标签页
3. **动态路由组件 hydration 闪烁 404**:数据未加载时短暂显示 404
4. **AddPaperModal 提交按钮在 form 外 + as any**:第 567-574 行
5. **IdeaWorkspaceClient handleGenerateMVE 错误反馈不足**:用户看不到错误
6. **a11y:图标按钮缺 aria-label**

---

## Proposed Changes

### 阶段 1: 完成原计划未修复部分

#### 1.1 添加 'use client' 指令

**修改文件**:
- [components/observation/ObservationInput.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationInput.tsx):顶部添加 `'use client';`
- [components/idea/IdeaCardMini.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/IdeaCardMini.tsx):顶部添加 `'use client';`
- [components/ui/Textarea.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/ui/Textarea.tsx):顶部添加 `'use client';`

#### 1.2 替换原生 select 为自定义 Select(3 处)

**修改文件**:
- [app/areas/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/page.tsx#L182-L191):子领域分类 select → `<Select>`
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L357-L367):阅读状态 select → `<Select>`
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L371-L380):判断级别 select → `<Select>`

**实现**:参考 [app/papers/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/papers/page.tsx#L119-L156) 已有用法。

#### 1.3 修复 AddPaperModal updatePaper 类型污染

**修改文件**: [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L177-L199)

**方案**: 在构造 paperData 前解构出中间字段:
```tsx
const { evidenceTasks, evidenceBaselines, evidenceMetrics, evidenceKeyResults, methodKeywords, ...rest } = formData;
const paperData: Partial<Paper> = {
  ...rest,
  methodKeywords: methodKeywords.split(',').map(k => k.trim()).filter(Boolean),
  evidence: {
    tasks: evidenceTasks.split('\n').filter(Boolean),
    baselines: evidenceBaselines.split('\n').filter(Boolean),
    metrics: evidenceMetrics.split('\n').filter(Boolean),
    keyResults: evidenceKeyResults.split('\n').filter(Boolean),
  },
  // ...
};
```

#### 1.4 实现 useSearchParams 读取 area 参数

**修改文件**: [app/papers/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/papers/page.tsx)

```tsx
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 组件内
const searchParams = useSearchParams();
const initialArea = searchParams.get('area') || 'all';
const [filterArea, setFilterArea] = useState<string>(initialArea);
```

**注意**: `useSearchParams` 在静态导出下需 Suspense 边界。如果构建报错,将整个 PaperLibraryPage 包裹 `<Suspense>`。

#### 1.5 升级 STORAGE_KEY 到 v13

**修改文件**: [lib/storage.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/storage.ts#L4)

```tsx
const STORAGE_KEY = 'research-compass-data-v13';
```

#### 1.6 挂载 3 个死代码组件

**1.6.1 IdeaCardMini**:
- [components/idea/IdeaCardMini.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/IdeaCardMini.tsx):Link 添加 `className="no-underline hover:no-underline block"`
- [app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx#L221-L244):导入 IdeaCardMini,替换 `activeIdeaCards.map` 内的 inline div

**1.6.2 ObservationInput**:
- [components/observation/ObservationInput.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationInput.tsx):确认 `state.isAnalyzing` 引用,如不存在改为正确字段或移除 loading 逻辑
- [app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx):导入 ObservationInput + ObservationCard,在 Dashboard 主内容区上方添加"快速记录观察"区块

**1.6.3 Textarea**:替换以下位置的原生 textarea(共约 14 处)
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx):9 处
- [components/idea/CreateIdeaModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/CreateIdeaModal.tsx):3 处
- [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx):4 处
- [app/mve/[id]/MVEResultClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/mve/[id]/MVEResultClient.tsx):1 处
- [app/areas/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/page.tsx):2 处
- [components/idea/EvidenceList.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/EvidenceList.tsx):1 处
- [components/observation/ObservationInput.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationInput.tsx):1 处

**风格统一**: Textarea 组件当前用自定义颜色(`border-rule`/`bg-bg`/`text-ink`),与现有标准 Tailwind 颜色不一致。**决策:统一使用 Textarea 的自定义颜色**,保持与 ObservationCard、IdeaCardMini 风格一致。

---

### 阶段 2: 修复新发现严重问题(数据完整性 + 用户误导)

#### 2.1 重写 cvTemplates 为机器人感知内容

**修改文件**: [lib/mockAI.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/mockAI.ts#L11-L68)

**问题**: 当前 cvTemplates 是图像分类/对比学习内容(CIFAR-100-LT、ResNet-32、Top-1 准确率),作为默认 fallback 和所有机器人模板的 `observation` 来源,严重误导。

**方案**: 重写 cvTemplates 为机器人感知方向(更通用的 fallback):
```tsx
const perceptionTemplates = {
  observation: {
    type: 'paper' as const,
    keywords: ['深度感知', '鲁棒性', '域适应'],
    potentialIssue: '复杂场景下感知算法的鲁棒性不足',
    researchValue: 'high' as const,
    researchValueReason: '感知是机器人基础能力,鲁棒性问题影响广泛',
    suggestedAction: '调研相关失败案例与改进方法',
  },
  evidence: {
    supporting: [...机器人感知相关支撑证据...],
    opposing: [...],
    missing: [...],
    risks: [...],
    nextAction: '在公开数据集上做 MVE 验证(预计 2-3 天)',
  },
  mve: {
    experimentGoal: '改进方案能否在复杂场景下提升感知精度/鲁棒性?',
    minimalDesign: '在公开数据集上对比 baseline 与改进方案',
    // ... 机器人感知相关内容
  },
};
```

**同步**: 将 `selectTemplate` 中的 `cvTemplates` 引用全部改为 `perceptionTemplates`。

#### 2.2 修复 IdeaWorkspaceClient 持久化缺失

**修改文件**: [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx)

**修复 4 处**:
1. `handleAddObservation`(L111-120):添加 `updateIdeaCard({ ...updatedIdeaCard, sourceObservations: [...] })`
2. `handleRemoveSupportingEvidence`(L90-95):同上,持久化过滤后的 supportingEvidence
3. `handleRemoveOpposingEvidence`(L97-102):同上,持久化 opposingEvidence
4. `handleRemoveMissingEvidence`(L104-109):同上,持久化 missingEvidence

**实现模式**: 先构造新的 ideaCard 对象,然后同时 `setIdeaCard(newCard)` 和 `updateIdeaCard(newCard)`。

#### 2.3 修复 storage.ts JSON 解析失败保护

**修改文件**: [lib/storage.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/storage.ts#L57-L133)

**方案**: 在 catch 块中,先备份原始数据到 backup key,再返回空数组(而非 mock 数据):
```tsx
} catch (e) {
  console.error('Failed to load from storage:', e);
  // 备份损坏的原始数据,以便用户后续恢复
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      localStorage.setItem(STORAGE_KEY + '-backup-' + Date.now(), rawData);
    }
  } catch {}
  // 返回空数据,避免 mock 覆盖用户可能可恢复的数据
  return {
    observations: [],
    ideaCards: [],
    mves: [],
    researchAreas: [...mockResearchAreas],  // 保留基础结构
    papers: [...mockPapers],  // 保留基础结构
  };
}
```

**决策说明**: 即使解析失败,也保留 mockResearchAreas/mockPapers 作为最低保障,但 observations/ideaCards/mves 返回空,避免覆盖用户独立数据。配合阶段 3.2 的空数组保护修复,即使返回空也不会被回退为 mock。

---

### 阶段 3: 修复新发现高严重问题

#### 3.1 修复 DELETE_PAPER 级联清理

**修改文件**: [context/AppContext.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/context/AppContext.tsx#L199-L203)

```tsx
case 'DELETE_PAPER': {
  const targetId = action.payload;
  return {
    ...state,
    papers: state.papers.filter(p => p.id !== targetId),
    ideaCards: state.ideaCards.map(card => ({
      ...card,
      sourcePaperIds: card.sourcePaperIds.filter(pid => pid !== targetId),
    })),
  };
}
```

#### 3.2 修复 storage.ts 空数组回退逻辑

**修改文件**: [lib/storage.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/storage.ts#L78-L86)

**问题**: 当前逻辑 `rawResearchAreas.length > 0 ? ... : [...mockResearchAreas]` 会在用户清空数据后被回退为 mock。

**方案**: 引入 `hasUserKey` 标记区分"首次访问"和"用户主动清空":
```tsx
// 用 parsed 是否存在 userInitiated 标记,或者 localStorage 中有 STORAGE_KEY 但数据为空
const hasUserKey = localStorage.getItem(STORAGE_KEY) !== null;
const researchAreas: ResearchArea[] = (hasUserKey && rawResearchAreas.length === 0)
  ? []  // 用户主动清空,保留空
  : (rawResearchAreas.length > 0 ? deduplicateById(rawResearchAreas) : [...mockResearchAreas]);
```

**简化方案(推荐)**: 直接去掉回退逻辑,如果 localStorage 有数据(无论空否),就尊重用户的数据:
```tsx
const researchAreas: ResearchArea[] = parsed && Array.isArray(parsed.researchAreas)
  ? deduplicateById(rawResearchAreas)
  : [...mockResearchAreas];
```

#### 3.3 修复 IdeaWorkspaceClient useEffect 覆盖编辑内容

**修改文件**: [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx#L29-L31)

**问题**: `useEffect` 依赖 `state.ideaCards`,任何其他 IdeaCard 变化都会覆盖本地编辑。

**方案**: 只在 `id` 变化时同步,移除 `state.ideaCards` 依赖:
```tsx
useEffect(() => {
  setIdeaCard(getIdeaCardById(id));
}, [id]);
```

**风险**: 用户在别处编辑同一 IdeaCard 后,此页面不会同步。但此场景罕见,且当前页面有"保存"按钮显式提交,可接受。

#### 3.4 修复 addDefaultMVEFields 迁移 resultStatus

**修改文件**: [lib/storage.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/storage.ts#L34-L44)

```tsx
function migrateLegacyMVEResultStatus(status: any): MVE['resultStatus'] {
  if (status === 'success' || status === 'succeeded') return 'passed';
  if (status === 'failed' || status === 'failure') return 'failed';
  return status || 'pending';
}

function addDefaultMVEFields(mve: any): MVE {
  return {
    ...mve,
    resultStatus: migrateLegacyMVEResultStatus(mve.resultStatus),
    roboticsTask: mve.roboticsTask || '',
    // ...
  };
}
```

#### 3.5 添加 DELETE_AREA action

**修改文件**:
- [lib/types.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/types.ts):添加 `DELETE_AREA` 到 Action 类型
- [context/AppContext.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/context/AppContext.tsx):实现 reducer + 暴露 `deleteArea` 函数
- [app/areas/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/page.tsx):子领域卡片添加删除按钮(可选,根据用户偏好)

**reducer 实现策略**: 软删除 — 将 `isHidden` 设为 `true`,保留数据关联,不在 UI 中显示。这是更安全的方案,避免级联删除造成大量数据损失:
```tsx
case 'DELETE_AREA': {
  const targetId = action.payload;
  return {
    ...state,
    researchAreas: state.researchAreas.map(a =>
      a.id === targetId ? { ...a, isHidden: true } : a
    ),
  };
}
```

**决策**: 软删除而非硬删除,因为硬删除会留下 papers.areaIds、ideaCards.areaIds 的悬空引用。软删除通过 `isHidden` 隐藏,数据保留可恢复。**注意**: 用户偏好渐进式设计,删除功能需配合确认对话框,避免误操作。本次仅添加 reducer 与函数,UI 集成可作为后续迭代。

---

### 阶段 4: 修复关键中严重问题

#### 4.1 修复 app/areas/page.tsx button 嵌套 Link

**修改文件**: [app/areas/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/page.tsx#L86-L147)

**方案**: button 移出 Link,改为并列布局。参考 app/page.tsx 快速开始第 2 步的实现:
```tsx
<div className="relative group">
  <Link href={`/areas/${area.id}`} className="block no-underline hover:no-underline">
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      {/* 卡片内容,button 位置改为占位 */}
    </Card>
  </Link>
  <button
    onClick={() => openEdit(area)}
    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <Edit3 className="w-4 h-4" />
  </button>
</div>
```

#### 4.2 添加 app/layout.tsx metadata

**修改文件**: [app/layout.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/layout.tsx)

```tsx
export const metadata = {
  title: 'Research Compass for Robotics',
  description: '机器人科研方向管理工作台 — 从子领域探索到 MVE 验证',
};
```

#### 4.3 修复动态路由组件 hydration 闪烁

**修改文件**:
- [app/areas/[id]/AreaDetailClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/[id]/AreaDetailClient.tsx)
- [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx)
- [app/mve/[id]/MVEResultClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/mve/[id]/MVEResultClient.tsx)

**方案**: 添加 `isInitialized` 状态判断,数据未加载时显示 loading 而非 404:
```tsx
const [isInitialized, setIsInitialized] = useState(false);
useEffect(() => {
  // 等待 INIT_DATA 完成
  if (state.researchAreas.length > 0 || state.papers.length > 0) {
    setIsInitialized(true);
  }
}, [state.researchAreas, state.papers]);

if (!isInitialized) {
  return <div className="p-8 text-center text-gray-500">加载中...</div>;
}
if (!area) {
  return <404 />;
}
```

**简化方案(推荐)**: 用 `state.isInitialized` 标记,在 AppContext 中 INIT_DATA 后设为 true。所有动态路由组件检查此标记。

#### 4.4 修复 AddPaperModal 按钮位置 + as any

**修改文件**: [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L567-L574)

**方案**: 将提交按钮移入 form 内部,移除 `as any`:
```tsx
<form onSubmit={handleSubmit}>
  {/* 表单字段 */}
  <div className="flex gap-2 pt-4">
    <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
    <Button type="submit">{editingPaper ? '更新' : '添加'}</Button>
  </div>
</form>
```

#### 4.5 修复 IdeaWorkspaceClient 错误反馈

**修改文件**: [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx)

**方案**: 添加错误提示状态:
```tsx
const [errorMessage, setErrorMessage] = useState('');

const handleGenerateMVE = async () => {
  try {
    setErrorMessage('');
    const mve = await generateMVE(ideaCard.id);
    router.push(`/mve/${mve.id}`);
  } catch (error) {
    console.error('Failed to generate MVE:', error);
    setErrorMessage('生成 MVE 失败,请重试');
  }
};

// JSX 中显示错误提示
{errorMessage && (
  <div className="text-sm text-red-600 mt-2">{errorMessage}</div>
)}
```

#### 4.6 添加 a11y aria-label(图标按钮)

**修改文件**:
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L212):关闭按钮添加 `aria-label="关闭"`
- [app/areas/[id]/AreaDetailClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/[id]/AreaDetailClient.tsx):返回按钮添加 `aria-label="返回"`
- [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx):返回按钮添加 `aria-label="返回"`
- [app/mve/[id]/MVEResultClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/mve/[id]/MVEResultClient.tsx):返回按钮添加 `aria-label="返回"`
- [app/papers/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/papers/page.tsx#L169):SVG 添加 `aria-hidden="true"`

---

### 阶段 5: 验证收尾

#### 5.1 验证步骤

1. **TypeScript 检查**: `npx tsc --noEmit` 应无错误
2. **构建检查**: `npm run build` 应成功
3. **功能验证**:
   - 三个原生 select 替换为自定义 Select 后,下拉框样式一致、可滚动
   - AddPaperModal 编辑论文后,localStorage 中 Paper 对象不包含 evidenceTasks 等中间字段
   - Paper Library 通过 URL `?area=xxx` 跳转后筛选正确
   - STORAGE_KEY 升级到 v13 后,旧 v12 数据被忽略,加载 mock 数据
   - Dashboard 活跃 Ideas 用 IdeaCardMini 渲染,无下划线
   - Dashboard 快速记录观察区块可用
   - 所有 textarea 用 Textarea 组件渲染,样式统一
   - mockAI 输入"VLA 推理加速"等关键词,返回机器人相关内容(非 CIFAR-100-LT)
   - IdeaWorkspace 添加 Observation 后,刷新页面数据保留
   - IdeaWorkspace 删除 evidence 后,刷新页面数据保留
   - 删除 Paper 后,关联 IdeaCard 的 sourcePaperIds 不再包含该 id
   - localStorage 数据损坏时,原始数据被备份而非被 mock 覆盖
   - IdeaWorkspace 编辑时,其他 dispatch 不会覆盖本地编辑
   - 旧 MVE 数据 resultStatus='success' 被迁移为 'passed'
   - app/areas/page.tsx 卡片编辑按钮不再嵌套在 Link 内
   - 浏览器标签页显示 "Research Compass for Robotics"
   - 动态路由页面初次加载显示 loading 而非闪烁 404
4. **回归检查**: 确认所有原有功能未受影响

---

## Assumptions & Decisions

### 关键假设
1. **Textarea 风格统一**: 替换后部分页面会出现自定义颜色(`border-rule`/`bg-bg`)与标准 Tailwind 颜色混用。决策:统一使用 Textarea 的自定义颜色,与 ObservationCard/IdeaCardMini 风格一致。
2. **DELETE_AREA 软删除**: 不级联硬删除 papers/ideas,通过 `isHidden=true` 隐藏,数据保留可恢复。UI 暂不集成,作为后续迭代。
3. **storage.ts 空数组逻辑修复**: 简化方案是直接去掉"length>0 才用 mock"的回退,改为"有 STORAGE_KEY 数据(包括空)就尊重,无数据才用 mock"。
4. **IdeaWorkspace useEffect 修复**: 移除 `state.ideaCards` 依赖,只依赖 `id`。风险是别处编辑同卡不同步,可接受(用户有显式保存按钮)。
5. **cvTemplates 重写**: 改名为 `perceptionTemplates`,内容改为机器人感知方向(深度感知/鲁棒性/域适应),作为通用 fallback。

### 范围边界
- **本次修复**: 阶段 1(原计划未完成 6 项)+ 阶段 2(严重新问题 4 项)+ 阶段 3(高严重新问题 5 项)+ 阶段 4(中严重关键 6 项)
- **本次不修**: 低严重问题(重复代码、any 类型滥用、硬编码颜色、resultLabels 抽取等)
- **不修原因**: 低严重问题不影响功能和数据完整性,属于代码质量优化,可后续迭代

### 实现顺序
1. 阶段 1(原计划未完成) → 验证构建
2. 阶段 2(严重数据/误导) → 验证构建
3. 阶段 3(高严重功能) → 验证构建
4. 阶段 4(中严重 UX) → 验证构建
5. 阶段 5(最终验证)

---

## 涉及文件清单

| 文件 | 修改类型 | 阶段 |
|------|---------|------|
| components/observation/ObservationInput.tsx | 添加 'use client' + 挂载 | 1.1, 1.6.2 |
| components/idea/IdeaCardMini.tsx | 添加 'use client' + no-underline + 挂载 | 1.1, 1.6.1 |
| components/ui/Textarea.tsx | 添加 'use client' + 替换原生 textarea | 1.1, 1.6.3 |
| app/areas/page.tsx | 替换原生 select + 替换 textarea + button 嵌套修复 | 1.2, 1.6.3, 4.1 |
| components/paper/AddPaperModal.tsx | 替换 select + 类型污染 + textarea + 按钮位置 + a11y | 1.2, 1.3, 1.6.3, 4.4, 4.6 |
| app/papers/page.tsx | useSearchParams + a11y | 1.4, 4.6 |
| lib/storage.ts | 升级 v13 + JSON 保护 + 空数组逻辑 + MVE 迁移 | 1.5, 2.3, 3.2, 3.4 |
| app/page.tsx | 挂载 IdeaCardMini + ObservationInput | 1.6.1, 1.6.2 |
| components/idea/CreateIdeaModal.tsx | 替换 textarea | 1.6.3 |
| app/idea/[id]/IdeaWorkspaceClient.tsx | 持久化修复 + useEffect 修复 + textarea + loading + 错误反馈 + a11y | 2.2, 3.3, 1.6.3, 4.3, 4.5, 4.6 |
| app/mve/[id]/MVEResultClient.tsx | textarea + loading + a11y | 1.6.3, 4.3, 4.6 |
| app/areas/[id]/AreaDetailClient.tsx | loading + a11y | 4.3, 4.6 |
| lib/mockAI.ts | 重写 cvTemplates 为 perceptionTemplates | 2.1 |
| context/AppContext.tsx | DELETE_PAPER 级联 + DELETE_AREA action | 3.1, 3.5 |
| lib/types.ts | DELETE_AREA action 类型 | 3.5 |
| app/layout.tsx | metadata | 4.2 |
