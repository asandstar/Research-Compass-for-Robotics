# Research Compass for Robotics — 综合问题修复计划

## Summary

通过代码探索发现 30+ 个问题,涵盖 4 个高严重(影响核心功能)和 11 个中严重(影响体验/数据一致性)。本计划修复全部高严重 + 中严重问题,并将 3 个死代码组件(ObservationInput / IdeaCardMini / Textarea)挂载到实际页面中使用。低严重问题(死代码清理、数据标注错误、mockAI 细节)不在本次范围。

修复目标:
- 修复 4 个高严重问题(404 路由、年份 NaN、PaperCard 误导、ObservationCard 边框不显示)
- 修复 11 个中严重问题(链接跳转、原生 select、hover 下划线、级联清理、类型污染等)
- 挂载 3 个死代码组件到实际页面

---

## Current State Analysis

### 项目架构
- Next.js 14 + React + TypeScript + Tailwind CSS,`output: 'export'` 静态导出
- 数据存储:React Context + localStorage(key: `research-compass-data-v12`)
- 6 个核心页面:Dashboard / Research Areas / Area Detail / Paper Library / Idea Workspace / MVE Result
- 自定义颜色已在 [tailwind.config.js](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/tailwind.config.js#L10-L18) 定义:`bg`/`bg2`/`ink`/`muted`/`rule`/`accent`/`accent2`

### 关键发现
1. **静态导出限制**:`output: 'export'` 下 `generateStaticParams` 只返回 mockData 中的 id,用户通过 UI 创建的新 area/idea/mve 访问详情页会 404
2. **混合样式风格**:部分组件用自定义颜色(ObservationCard、死代码组件),部分用标准 Tailwind 颜色(大部分页面),两者共存
3. **3 个死代码组件样式有效**:ObservationInput / IdeaCardMini / Textarea 使用自定义颜色,与 ObservationCard 风格一致,可挂载

---

## Proposed Changes

### 阶段 1:修复高严重问题(4 个)

#### 1.1 修复 generateStaticParams 404 问题(问题 6.1/6.2/6.3)

**问题**:用户通过 `addResearchArea` / `createIdeaCard` / `generateMVE` 创建的新数据,其 id 不在 mockData 中,`generateStaticParams` 不会为其生成静态页面,访问 `/areas/新id`、`/idea/新id`、`/mve/新id` 会 404。

**修复方案**:在三个 `[id]/page.tsx` 中添加 `export const dynamicParams = true;`。这允许 Next.js 在客户端导航时动态渲染未预生成的路径(虽然直接访问/刷新仍会 404,但应用内 `<Link>` 导航可以工作,这是可接受的限制)。

**修改文件**:
- [app/areas/[id]/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/[id]/page.tsx):添加 `export const dynamicParams = true;`
- [app/idea/[id]/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/page.tsx):添加 `export const dynamicParams = true;`
- [app/mve/[id]/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/mve/[id]/page.tsx):添加 `export const dynamicParams = true;`

**验证**:构建后,从 Dashboard 点击新创建的 idea/mve 链接,应能正常跳转。注意:`output: 'export'` 下 `dynamicParams = true` 可能导致构建警告或错误,如果构建失败,回退方案是保留 `dynamicParams = false` 并在客户端组件中显示"页面未预生成"提示。

#### 1.2 修复 AddPaperModal 年份 NaN 问题(问题 5.1)

**问题**:[components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L246) 中 `parseInt(e.target.value)` 在输入框清空时返回 NaN。

**修复方案**:修改 onChange 处理:
```tsx
onChange={(e) => setFormData({ ...formData, year: e.target.value === '' ? new Date().getFullYear() : parseInt(e.target.value) || new Date().getFullYear() })}
```

#### 1.3 修复 PaperCard 标题误导性 cursor(问题 1.4)

**问题**:[components/paper/PaperCard.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/PaperCard.tsx) 完整模式标题有 `hover:text-indigo-600 cursor-pointer` 但不可点击,误导用户。

**修复方案**:移除 `cursor-pointer` 和 `hover:text-indigo-600` 类,保持标题为普通文本样式。compact 模式同理,移除 Card 的 `hover:shadow-sm transition-shadow`。

#### 1.4 修复 ObservationCard 无效 Tailwind 类(问题 10.1)

**问题**:[components/observation/ObservationCard.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationCard.tsx#L27) 使用 `border-l-3`,但 Tailwind 没有这个类,导致左侧彩色标识条不显示。

**修复方案**:改为 `border-l-[3px]`(任意值语法),并添加 `border-l` 启用 border-left:
```tsx
className="bg-bg2 border-l-[3px] rounded-lg p-3 mb-3"
```

---

### 阶段 2:修复中严重问题(11 个)

#### 2.1 修复 Dashboard 统计卡片可点击性 + hover 下划线(问题 1.1, 3.1)

**问题**:
- "活跃 Idea"和"待验证 MVE"统计卡片不可点击
- 4 个统计卡片 Link(子领域、论文)缺少 `no-underline hover:no-underline`

**修复方案**:
- 给"子领域"和"论文"卡片的 `<Link>` 添加 `className="no-underline hover:no-underline"`
- 给"活跃 Idea"卡片包裹 `<Link href={firstActiveIdea ? `/idea/${firstActiveIdea.id}` : '/papers'}>`,并添加 `no-underline hover:no-underline`
- 给"待验证 MVE"卡片包裹 `<Link href={firstPendingMVE ? `/mve/${firstPendingMVE.id}` : '#'}>`,无 pending MVE 时不包裹 Link

**修改文件**:[app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx#L70-L119)

#### 2.2 修复 Dashboard 最近论文列表项可点击(问题 1.2)

**问题**:[app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx#L169-L198) 最近论文列表项是普通 `<div>`,不可点击。

**修复方案**:将每个论文条目包裹为 `<Link href="/papers">`,添加 `no-underline hover:no-underline` 和 hover 效果。

#### 2.3 修复 AreaDetail "查看全部"跳转(问题 1.3)

**问题**:[app/areas/[id]/AreaDetailClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/[id]/AreaDetailClient.tsx#L127) "查看全部"跳转到 `/papers` 全局列表,未保留子领域筛选。

**修复方案**:改为 `<Link href={`/papers?area=${areaId}`}>`,并在 [app/papers/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/papers/page.tsx) 中用 `useSearchParams` 读取 `area` 参数初始化 `filterArea` 状态。

#### 2.4 修复 button 嵌套在 Link 内(问题 1.5)

**问题**:[app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx#L256-L268) "快速开始"第 2 步,`<button>` 嵌套在 `<Link>` 内违反 HTML 规范。

**修复方案**:重构布局,button 移出 Link,改为并列:
```tsx
<div className="flex items-center gap-2 text-indigo-600">
  <span className="...">2</span>
  <Link href="/papers" className="hover:text-indigo-700 no-underline hover:no-underline">添加论文并写总结</Link>
  <button onClick={() => setShowAddPaper(true)} className="ml-auto ...">
    <Plus className="w-4 h-4" />
  </button>
</div>
```

#### 2.5 替换 3 处原生 select 为自定义 Select 组件(问题 2.1, 2.2, 2.3)

**问题**:
- [app/areas/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/areas/page.tsx#L182-L191) 子领域分类 select
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L357-L367) 阅读状态 select
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L371-L380) 判断级别 select

**修复方案**:用已存在的 [components/ui/Select.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/ui/Select.tsx) 替换三处原生 `<select>`,保持选项和当前选中值不变。

#### 2.6 修复 updatePaper 类型污染(问题 4.1)

**问题**:[components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx#L177-L199) 的 `handleSubmit` 把中间字段(`evidenceTasks` 等)写入 Paper 对象。

**修复方案**:在构造 paperData 前解构出中间字段:
```tsx
const { evidenceTasks, evidenceBaselines, evidenceMetrics, evidenceKeyResults, methodKeywords, ...rest } = formData;
const paperData = {
  ...rest,
  methodKeywords: methodKeywords.split(',').map(k => k.trim()).filter(Boolean),
  evidence: { tasks: ..., baselines: ..., metrics: ..., keyResults: ... },
  // ...
};
```

#### 2.7 修复 MVEResultClient 初始状态 flash(问题 5.2)

**问题**:[app/mve/[id]/MVEResultClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/mve/[id]/MVEResultClient.tsx#L24-L26) 初始 state 硬编码 'pending',首次渲染会显示错误状态。

**修复方案**:使用 lazy initializer:
```tsx
const [mve, setMve] = useState(() => getMVEById(id));
const [resultStatus, setResultStatus] = useState<MVE['resultStatus']>(() => getMVEById(id)?.resultStatus || 'pending');
const [resultNotes, setResultNotes] = useState(() => getMVEById(id)?.resultNotes || '');
```

#### 2.8 修复 DELETE_IDEA_CARD 级联清理(问题 5.3, 7.1)

**问题**:[context/AppContext.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/context/AppContext.tsx#L108-L112) 删除 IdeaCard 时不清理关联 MVE 和 Paper.inspiredIdeaIds。

**修复方案**:修改 `DELETE_IDEA_CARD` reducer:
```tsx
case 'DELETE_IDEA_CARD': {
  const targetId = action.payload;
  return {
    ...state,
    ideaCards: state.ideaCards.filter(c => c.id !== targetId),
    mves: state.mves.filter(m => m.ideaCardId !== targetId),
    papers: state.papers.map(p => ({
      ...p,
      inspiredIdeaIds: p.inspiredIdeaIds.filter(id => id !== targetId),
    })),
  };
}
```

#### 2.9 修复 selectTemplate 中文关键词(问题 8.1)

**问题**:[lib/mockAI.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/mockAI.ts#L379-L400) `selectTemplate` 对"模仿学习"、"灵巧"、"具身"等中文关键词不匹配,fallback 到 cvTemplates。

**修复方案**:在 selectTemplate 中添加中文关键词匹配:
- `模仿学习`/`行为克隆` → imitationTemplates(复用现有模板)
- `灵巧`/`dexterous` → diffusionTemplates
- `具身`/`embodied` → vlaTemplates

---

### 阶段 3:挂载 3 个死代码组件

#### 3.1 挂载 IdeaCardMini(替换 Dashboard 活跃 Ideas inline div)

**目标**:将 [components/idea/IdeaCardMini.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/IdeaCardMini.tsx) 挂载到 Dashboard "活跃 Ideas"卡片。

**修改**:
1. [components/idea/IdeaCardMini.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/IdeaCardMini.tsx):
   - 添加 `'use client'` 指令
   - Link 添加 `className="no-underline hover:no-underline block"`
   - 适配当前 Dashboard 卡片样式:显示标题 + 状态 Tag + 子领域名 + 更新时间(已是当前 inline 实现的字段)
2. [app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx#L213-L235):导入 IdeaCardMini,替换 `activeIdeaCards.map` 内的 inline `<div>` 为 `<IdeaCardMini ideaCard={idea} />`

#### 3.2 挂载 ObservationInput(添加到 Dashboard 快速记录入口)

**目标**:将 [components/observation/ObservationInput.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationInput.tsx) 挂载到 Dashboard,提供快速记录观察的入口。同时展示最近的 ObservationCard 列表。

**修改**:
1. [components/observation/ObservationInput.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationInput.tsx):
   - 添加 `'use client'` 指令(顶部已有 `import { useState }`,需补 `'use client'`)
   - 修复 `border-rule` 应为 `border-rule`(已正确,自定义颜色)
   - 修复 `state.isAnalyzing` 引用(确认 AppContext 中是否存在,如不存在改为 `state.isAnalyzingObservation` 或移除 loading 逻辑)
2. [app/page.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/page.tsx):
   - 导入 ObservationInput 和 ObservationCard
   - 在 Dashboard 主内容区(子领域概览上方或侧边栏)添加"快速记录观察"区块,包含 ObservationInput + 最近 3 条 ObservationCard 列表
3. [components/observation/ObservationCard.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/observation/ObservationCard.tsx):修复 `border-l-3`(阶段 1.4 已处理)

#### 3.3 挂载 Textarea(替换所有原生 textarea)

**目标**:将 [components/ui/Textarea.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/ui/Textarea.tsx) 挂载到所有使用原生 `<textarea>` 的地方。

**修改文件**(需扫描确认所有 textarea 位置):
- [components/paper/AddPaperModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/paper/AddPaperModal.tsx):替换所有原生 textarea(oneSentenceSummary、problem、coreContribution、methodSketch、relevanceToMyResearch、limitationsOrQuestions 等)
- [components/idea/CreateIdeaModal.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/components/idea/CreateIdeaModal.tsx):替换 researchQuestion、coreHypothesis、whyItMatters 等
- [app/idea/[id]/IdeaWorkspaceClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/idea/[id]/IdeaWorkspaceClient.tsx):替换编辑模式的 textarea
- [app/mve/[id]/MVEResultClient.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/mve/[id]/MVEResultClient.tsx#L280-L287):替换 resultNotes textarea

**适配**:Textarea 组件当前用自定义颜色(`border-rule`/`bg-bg`/`text-ink`/`focus:border-accent`),与现有页面标准 Tailwind 颜色(`border-gray-300`/`bg-white`/`focus:ring-indigo-500`)不一致。**决策:统一使用 Textarea 组件的自定义颜色风格**,保持与 ObservationCard、IdeaCardMini 一致。如果视觉差异过大,在 Textarea 组件内调整 className 为标准 Tailwind 颜色。

---

### 阶段 4:收尾与验证

#### 4.1 升级存储版本

由于数据模型和种子数据有调整,将 [lib/storage.ts](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/lib/storage.ts#L4) 的 `STORAGE_KEY` 从 `v12` 升级到 `v13`,清除旧数据,加载新种子数据。

#### 4.2 验证步骤

1. **TypeScript 检查**:`npx tsc --noEmit` 应无错误
2. **构建检查**:`npm run build` 应成功生成所有静态页面
3. **功能验证**:
   - 创建新 area → 点击进入详情页(应用内导航)应正常
   - 创建新 idea → 点击进入 Idea Workspace 应正常
   - 生成新 MVE → 点击进入 MVE Result 应正常
   - Paper Library 三个筛选下拉框样式一致、可滚动
   - AddPaperModal 年份清空后不出现 NaN
   - Dashboard 4 个统计卡片 hover 无下划线、可点击
   - Dashboard 活跃 Ideas 用 IdeaCardMini 渲染
   - Dashboard 快速记录观察功能可用
   - ObservationCard 左侧彩色边框显示
   - 删除 Idea 后关联 MVE 一并删除
   - MVE Result 页面初始状态无 flash
4. **回归检查**:确认所有原有功能未受影响

---

## Assumptions & Decisions

### 关键假设
1. **`dynamicParams = true` 在 `output: 'export'` 下的行为**:预期允许客户端导航到未预生成的路径(直接访问/刷新仍会 404,这是静态导出的固有限制,可接受)。如果构建报错,回退方案是保留 `dynamicParams = false` 并在客户端组件中显示"页面未预生成,请从应用内导航"提示。
2. **死代码组件样式有效**:ObservationInput / IdeaCardMini / Textarea 使用 `bg-bg`/`border-rule`/`text-ink` 等自定义颜色,已在 [tailwind.config.js](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/tailwind.config.js#L10-L18) 定义,样式有效。
3. **ObservationInput 的 `state.isAnalyzing`**:需确认 AppContext 中是否有 `isAnalyzing` 状态;若无,移除 loading 逻辑或改为 `isAnalyzingObservation`(若存在)。
4. **Textarea 风格统一**:替换后部分页面会出现自定义颜色与标准 Tailwind 颜色混用。决策:统一使用 Textarea 的自定义颜色,如果视觉不一致,调整 Textarea 内部 className。

### 范围边界
- **本次修复**:4 高严重 + 11 中严重 + 3 个死代码挂载
- **本次不修**:低严重问题(数据标注错误、mockAI 死代码、导航 metadata、IdeaWorkspace 保存反馈等)

### 实现顺序
1. 阶段 1(高严重)→ 验证构建
2. 阶段 2(中严重)→ 验证构建
3. 阶段 3(死代码挂载)→ 验证构建
4. 阶段 4(收尾)→ 最终验证

---

## 涉及文件清单

| 文件 | 修改类型 | 涉及问题 |
|------|---------|----------|
| app/areas/[id]/page.tsx | 添加 dynamicParams | 6.1 |
| app/idea/[id]/page.tsx | 添加 dynamicParams | 6.2 |
| app/mve/[id]/page.tsx | 添加 dynamicParams | 6.3 |
| components/paper/AddPaperModal.tsx | 修复 NaN + 替换 select + 解构中间字段 + 替换 textarea | 5.1, 2.2, 2.3, 4.1, 3.3 |
| components/paper/PaperCard.tsx | 移除误导性 cursor | 1.4 |
| components/observation/ObservationCard.tsx | 修复 border-l-3 | 10.1 |
| app/page.tsx | 修复卡片可点击 + hover 下划线 + button 嵌套 + 挂载 IdeaCardMini + 挂载 ObservationInput | 1.1, 1.2, 1.5, 3.1, 3.1, 3.2 |
| app/areas/[id]/AreaDetailClient.tsx | 修复"查看全部"跳转 | 1.3 |
| app/papers/page.tsx | 读取 query 参数初始化筛选 | 1.3 |
| app/areas/page.tsx | 替换原生 select | 2.1 |
| app/idea/[id]/IdeaWorkspaceClient.tsx | 替换 textarea | 3.3 |
| app/mve/[id]/MVEResultClient.tsx | 修复初始 flash + 替换 textarea | 5.2, 3.3 |
| components/idea/CreateIdeaModal.tsx | 替换 textarea | 3.3 |
| components/idea/IdeaCardMini.tsx | 添加 'use client' + no-underline | 3.1 |
| components/observation/ObservationInput.tsx | 添加 'use client' + 修复 isAnalyzing | 3.2 |
| context/AppContext.tsx | 修复 DELETE_IDEA_CARD 级联 | 5.3, 7.1 |
| lib/mockAI.ts | 扩展中文关键词匹配 | 8.1 |
| lib/storage.ts | 升级 STORAGE_KEY 到 v13 | 4.1 |
