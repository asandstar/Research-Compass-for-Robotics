# Research Compass 综合修复计划 v4

> 接续 v3 计划。v3 阶段 1-3 + 阶段 4 的 AppContext isInitialized 基础设施已完成；本轮聚焦 **v3 阶段 4 剩余 9 项** + **本轮新发现的 4 项高/中严重问题**。

## 背景

通过 4 个并行搜索代理 + Read 验证，确认 v3 计划已完成 9 项修复（N1 TDZ、N2 MVE useEffect、V2-3.1 DELETE_PAPER 级联、V2-3.5 DELETE_AREA、N4 getResearchAreaById 过滤、V2-4.1 button 嵌套、N5 删除 UI、N10 AreaDetailClient params.id、N3 IdeaWorkspace 持久化、N6 PaperCard 部分 `{length && ...}`、AppContext isInitialized 状态）。

本轮发现 v3 阶段 4 仍有 9 项未完成，同时发现 4 项 v3 未覆盖的新问题（含 2 项 High）。

---

## 待修复问题清单

### A. v3 阶段 4 剩余项（已批准范围内）

| ID | 问题 | 文件 | 严重程度 |
|---|---|---|---|
| V3-4.1 | 缺 metadata 导出 | app/layout.tsx | 中 |
| V3-4.2 | 三个动态路由组件未应用 isInitialized loading（首次渲染显示 404 闪烁）| AreaDetailClient、IdeaWorkspaceClient、MVEResultClient | 高 |
| V3-4.3 | AddPaperModal 提交按钮在 form 外 + `as any` + 关闭按钮缺 aria-label | components/paper/AddPaperModal.tsx 行 578-585, 223, 117 | 中 |
| V3-4.4 | MVEResultClient 返回按钮缺 aria-label + papers/page.tsx SVG 缺 aria-hidden | MVEResultClient 行 78、papers/page.tsx 行 170 | 中 |
| V3-4.5 | 4 处 async 函数缺 try/catch（papers/page、ObservationInput、CreateIdeaModal、AddPaperModal）| 详见具体位置 | 高 |
| V3-4.6 | 缺 app/not-found.tsx 自定义 404 | app/not-found.tsx（缺失）| 中 |
| V3-4.7 | storage.ts 缺 addDefaultAreaFields 迁移函数 | lib/storage.ts | 中 |
| V3-4.8 | deploy.yml 用 `npm install` 而非 `npm ci` | .github/workflows/deploy.yml 行 25 | 低 |
| V3-4.9 | 检查 MVEResultClient params.id 安全处理 | app/mve/[id]/page.tsx | 低 |

### B. 本轮新发现 - High

| ID | 问题 | 文件 | 影响 |
|---|---|---|---|
| N12 | PaperCard 还有 3 处遗漏的 `{length && (...)}` 渲染数字 "0"：assumptions(行 238)、questionsToVerify(行 273)、evidence 概括判断(行 179-182) | components/paper/PaperCard.tsx | 新论文/空数据时 UI 显示孤零零的 "0" |
| N13 | MVEResultClient 编辑 resultNotes/resultStatus 后切换页面/后退会丢失（与 v3-N3 修复的 IdeaWorkspace 同类问题，但 MVE 未做自动保存）| app/mve/[id]/MVEResultClient.tsx 行 283-299 | 用户实验记录静默丢失 |

### C. 本轮新发现 - Medium

| ID | 问题 | 文件 | 影响 |
|---|---|---|---|
| N14 | DELETE_AREA 未级联清理关联 Paper.areaIds / IdeaCard.areaIds，导致 PaperCard 显示已删除子领域名称 | context/AppContext.tsx 行 193-201 + 3 处 getAreaName | 数据一致性 |
| N15 | AppContext Provider value 未 memoized，每次 state 变化（如 isAnalyzing 切换）所有消费者重渲染；同时使 IdeaWorkspaceClient debounce effect 依赖 updateIdeaCard 引用变化，可能导致 2 秒定时器频繁重置而无法触发 | context/AppContext.tsx 行 741-774 | 性能 + 自动保存可能失效 |

### 不在本次修复范围内（架构/低优先级）

- **静态导出 + 用户创建内容刷新 404**：`output: 'export'` + `generateStaticParams` 仅返回 mock ID，用户创建的新 Idea/MVE/Paper 详情页刷新会 404。`dynamicParams = true` 已允许客户端导航，刷新页面 404 是已知架构限制，需要 catch-all 路由或 SSR，不在本轮范围。
- Modal `role="dialog"` / `aria-modal` / focus trap / Escape 处理（v3 明确不修复）
- 全部表单 `htmlFor`/`id` 关联（约 44 处，v3 明确不修复）
- 14 处 `as any` 类型转换中除 AddPaperModal 行 582 外的其余项（v3 明确不修复）
- app/page.tsx 行 116 `href="#"` 死链（v3 明确不修复）
- PaperCard 图标按钮用 `title` 而非 `aria-label`（v3 标注为低优先级）
- ObservationCard/Button 缺 `'use client'`（无实际问题）
- 派生数据 useMemo 优化（性能影响可忽略）
- mockAI.ts 内 `sort()` 修改原数组（局部变量无影响）

---

## 实施方案

### 阶段 1: High 严重问题优先修复（V3-4.2 + V3-4.5 + N12 + N13）

> 这些会导致 UI 显示异常或用户数据丢失，优先修复。

#### 1.1 应用 isInitialized loading 到三个动态路由组件（V3-4.2）

**文件**: 
- `app/areas/[id]/AreaDetailClient.tsx`
- `app/idea/[id]/IdeaWorkspaceClient.tsx`
- `app/mve/[id]/MVEResultClient.tsx`

**修复**: 在 `if (!area/mve/ideaCard)` 检查之前添加 loading 状态。

AreaDetailClient.tsx（在 `if (!area)` 之前）:
```tsx
if (!state.isInitialized) {
  return <div className="text-center py-20 text-gray-500">加载中...</div>;
}
```

IdeaWorkspaceClient.tsx:
```tsx
// useEffect 增加 isInitialized 依赖（仅在初始化完成后同步 ideaCard）
useEffect(() => {
  if (state.isInitialized) {
    setIdeaCard(getIdeaCardById(id));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id, state.isInitialized]);

if (!state.isInitialized) {
  return <div className="text-center py-20 text-gray-500">加载中...</div>;
}
```

MVEResultClient.tsx:
```tsx
if (!state.isInitialized) {
  return <div className="text-center py-20 text-gray-500">加载中...</div>;
}
```

#### 1.2 添加 4 处 async 函数 try/catch（V3-4.5）

**文件和位置**:

1. **`app/papers/page.tsx` 行 82-85** handleGenerateIdea:
```tsx
const handleGenerateIdea = async (paperId: string) => {
  try {
    const idea = await createIdeaFromPaper(paperId);
    router.push(`/idea/${idea.id}`);
  } catch (error) {
    console.error('Failed to generate idea:', error);
    alert('生成 Idea 失败，请重试');
  }
};
```

2. **`components/observation/ObservationInput.tsx` 行 13-18** handleSubmit:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!content.trim()) return;
  try {
    await addObservation(content.trim());
    setContent('');
  } catch (error) {
    console.error('Failed to add observation:', error);
    alert('添加观察失败，请重试');
  }
};
```

3. **`components/idea/CreateIdeaModal.tsx` 行 26-40** handleSubmit:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const areaIds = preselectedAreaId ? [preselectedAreaId] : [];
    const idea = await createIdeaCard(...);
    setFormData({ title: '', researchQuestion: '', coreHypothesis: '', whyItMatters: '' });
    onClose();
    onCreated?.(idea.id);
  } catch (error) {
    console.error('Failed to create idea:', error);
    alert('创建 Idea 失败，请重试');
  }
};
```

4. **`components/paper/AddPaperModal.tsx` 行 132-176** handleParseArxiv + handleGenerateSummary:
```tsx
const handleParseArxiv = async () => {
  if (!formData.arxivUrl) return;
  try {
    const result = await fetchArxivPaper(formData.arxivUrl);
    if (result) { setFormData(prev => ({ ...prev, ... })); }
  } catch (error) {
    console.error('Failed to parse arxiv:', error);
    alert('解析 arXiv 失败，请重试');
  }
};

const handleGenerateSummary = async () => {
  try {
    const summary = await generateOneSentenceSummary({ ... });
    setFormData(prev => ({ ...prev, oneSentenceSummary: summary }));
  } catch (error) {
    console.error('Failed to generate summary:', error);
    alert('生成总结失败，请重试');
  }
};
```

#### 1.3 修复 PaperCard 剩余 3 处渲染 "0"（N12）

**文件**: `components/paper/PaperCard.tsx`

```tsx
// 行 179-182 修复（evidence 概括判断，使用 Boolean 显式转换）:
{(Boolean(paper.evidence?.tasks?.length) ||
  Boolean(paper.evidence?.baselines?.length) ||
  Boolean(paper.evidence?.metrics?.length) ||
  Boolean(paper.evidence?.keyResults?.length)) && (

// 行 238 修复:
{paper.assumptions?.length > 0 && (

// 行 273 修复:
{paper.questionsToVerify?.length > 0 && (
```

#### 1.4 MVEResultClient 添加 debounce 自动保存（N13）

**文件**: `app/mve/[id]/MVEResultClient.tsx`

参照 IdeaWorkspaceClient 的方案：

```tsx
const [isDirty, setIsDirty] = useState(false);

// 修改 resultStatus / resultNotes 的 onChange：
// 1. setResultStatus(...) + setIsDirty(true)
// 2. setResultNotes(...) + setIsDirty(true)

// 防抖自动保存（2 秒）
useEffect(() => {
  if (!isDirty || !mve) return;
  const timer = setTimeout(() => {
    updateMVEResult(mve.id, resultStatus, resultNotes);
    setIsDirty(false);
  }, 2000);
  return () => clearTimeout(timer);
}, [isDirty, mve, resultStatus, resultNotes, updateMVEResult]);

// 路由离开前保存
useEffect(() => {
  const handleBeforeUnload = () => {
    if (isDirty && mve) {
      updateMVEResult(mve.id, resultStatus, resultNotes);
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty, mve, resultStatus, resultNotes, updateMVEResult]);

// handleConfirm 开头强制保存：
const handleConfirm = () => {
  updateMVEResult(mve.id, resultStatus, resultNotes);
  setShowConfirm(false);
  setIsDirty(false);
};

// 顶部操作区显示"未保存"提示
{isDirty && (<span className="text-xs text-amber-600">未保存</span>)}
```

> 注意：MVEResultClient 的 resultStatus/resultNotes 是独立的 useState，不是 ideaCard 对象，所以 debounce effect 依赖数组包含 `resultStatus` 和 `resultNotes`（不同于 IdeaWorkspaceClient 依赖 `ideaCard`）。

---

### 阶段 2: Medium 严重问题（V3-4.1 + V3-4.3 + V3-4.4 + V3-4.6 + V3-4.7 + N14 + N15）

#### 2.1 添加 app/layout.tsx metadata（V3-4.1）

```tsx
import type { Metadata } from 'next';
import { ClientProviders } from './ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research Compass for Robotics - 机器人科研方向管理工作台',
  description: '从子领域探索到论文阅读，从灵感捕捉到最小可行实验验证——帮你系统判断机器人科研方向值不值得走。',
  openGraph: {
    title: 'Research Compass for Robotics',
    description: '机器人科研方向管理工作台',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ... 原有结构不变
}
```

#### 2.2 修复 AddPaperModal 按钮位置 + as any + aria-label（V3-4.3）

**文件**: `components/paper/AddPaperModal.tsx`

1. **行 578-585**: 将按钮组移入 `<form>` 内（在 `</form>` 之前），移除 `as any`：
```tsx
// 修复前结构:
        </form>
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 flex-shrink-0">
          <Button variant="secondary" type="button" onClick={onClose}>取消</Button>
          <Button type="submit" onClick={handleSubmit as any}>
            {editingPaper ? '保存修改' : '添加论文'}
          </Button>
        </div>

// 修复后结构（按钮移入 form 内，form 的 onSubmit 已绑定 handleSubmit，提交按钮 type="submit" 会自动触发）:
          <div className="flex justify-end gap-3 p-5 border-t border-gray-100 flex-shrink-0">
            <Button variant="secondary" type="button" onClick={onClose}>取消</Button>
            <Button type="submit">
              {editingPaper ? '保存修改' : '添加论文'}
            </Button>
          </div>
        </form>
```

2. **行 223**: 关闭按钮添加 `aria-label="关闭"`:
```tsx
<button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="关闭">
```

3. **行 117**: 移除 `let updates: any`，使用 `Record<string, string>`：
```tsx
const updates: Record<string, string> = { [field]: value };
```

#### 2.3 添加 aria-label 和 aria-hidden（V3-4.4）

**文件和位置**:
- `app/mve/[id]/MVEResultClient.tsx` 行 78: `<button onClick={() => router.back()} ... aria-label="返回">`
- `app/papers/page.tsx` 行 170: `<svg ... aria-hidden="true">`
- `components/idea/CreateIdeaModal.tsx` 行 49: `<button onClick={onClose} ... aria-label="关闭">`
- `components/paper/AnalysisResultModal.tsx` 行 54: `<button onClick={onClose} ... aria-label="关闭">`
- `components/idea/EvidenceList.tsx` 行 53-58: 删除证据按钮添加 `aria-label="删除证据"`

#### 2.4 创建 app/not-found.tsx（V3-4.6）

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <div className="text-lg font-semibold text-gray-800 mb-2">页面不存在</div>
        <p className="text-sm text-gray-500 mb-4">您访问的页面可能已被删除或地址有误。</p>
        <Link href="/" className="text-indigo-600 hover:underline">返回首页</Link>
      </div>
    </div>
  );
}
```

> ClientProviders 在 layout.tsx 中全局包裹，not-found.tsx 会自动继承 Navbar 和样式。

#### 2.5 storage.ts 添加 addDefaultAreaFields 迁移（V3-4.7）

**文件**: `lib/storage.ts`

```tsx
function addDefaultAreaFields(area: any): ResearchArea {
  return {
    ...area,
    isHidden: area.isHidden ?? false,
  };
}

// 在 loadFromStorage 中应用（行 89-91 和 129）：
const researchAreas: ResearchArea[] = hasStorageKey
  ? deduplicateById(rawResearchAreas.map(addDefaultAreaFields))
  : [...mockResearchAreas];

// legacy 迁移分支（行 129）：
researchAreas: deduplicateById(((parsed.researchAreas || []) as any[]).filter(a => a && a.id).map(addDefaultAreaFields)),
```

#### 2.6 修复 DELETE_AREA 级联清理（N14）

**文件**: `context/AppContext.tsx` 行 193-201

```tsx
case 'DELETE_AREA': {
  const targetId = action.payload;
  return {
    ...state,
    researchAreas: deduplicateById(state.researchAreas.map(area =>
      area.id === targetId ? { ...area, isHidden: true, updatedAt: new Date().toISOString() } : area
    )),
    // 级联清理 Paper.areaIds（移除被删除的 areaId）
    papers: deduplicateById(state.papers.map(paper => ({
      ...paper,
      areaIds: paper.areaIds.filter(aid => aid !== targetId),
    }))),
    // 级联清理 IdeaCard.areaIds
    ideaCards: deduplicateById(state.ideaCards.map(card => ({
      ...card,
      areaIds: card.areaIds.filter(aid => aid !== targetId),
    }))),
  };
}
```

> 注：不级联清理 MVE，因为 MVE 通过 ideaCardId 关联，不直接关联 ResearchArea。

#### 2.7 AppContext Provider value 添加 useMemo（N15）

**文件**: `context/AppContext.tsx` 行 741-774

用 `useMemo` 包裹 value 对象，避免每次渲染都创建新引用，导致所有消费者不必要重渲染，同时修复 IdeaWorkspaceClient debounce effect 因 updateIdeaCard 引用变化而失效的问题。

```tsx
import { createContext, useContext, useReducer, useEffect, useRef, useMemo, useCallback, ReactNode } from 'react';

// 所有函数用 useCallback 包裹（避免每次渲染新引用）：
const addObservation = useCallback(async (content: string) => { ... }, [state.observations]);
const createIdeaCard = useCallback(async (...) => { ... }, [state.observations]);
const updateIdeaCard = useCallback((ideaCard: IdeaCard) => { ... }, []);
// ... 其余函数同理

// value 用 useMemo 包裹：
const value = useMemo<AppContextType>(() => ({
  state,
  addObservation,
  createIdeaCard,
  updateIdeaCard,
  // ... 所有函数
}), [state]);
```

> **范围控制**: 为避免改动过大，本轮只对 `updateIdeaCard`、`updateMVEResult`、`deleteArea`、`addResearchArea`、`updateResearchArea`、`addPaper`、`updatePaper`、`deletePaper`、`deleteIdeaCard`、`addEvidence`、`getResearchAreaById`、`getIdeaCardById`、`getMVEById`、`getObservationsByIds`、`getPaperById`、`getPapersByAreaId`、`getIdeasByAreaId`、`getMvesByAreaId` 这些**不依赖 state 内容**或**仅依赖 state 引用**的函数用 `useCallback` 包裹（依赖数组为 `[state]` 或 `[]`）。依赖具体 state 字段的 async 函数（addObservation/createIdeaCard/generateMVE 等）暂时保留 inline 实现，因为它们依赖 `state.observations` 等具体字段。

实际上更简单且安全的方案：**仅 useMemo 包裹 value，依赖 `[state]`**，函数仍为 inline。这样每次 state 引用变化时 value 才重新创建。虽然函数引用仍会变，但避免了 loading 状态切换（isAnalyzing 等）导致的重渲染——因为 loading 状态变化也会触发 state 引用变化，所以这个简化方案**对 debounce 问题无效**。

**最终方案**：仅对 debounce effect 依赖的 `updateIdeaCard` 用 useCallback 包裹（依赖 `[]`，因为 dispatch 是稳定的），从依赖数组移除 updateIdeaCard 的根因。其余函数保留现状。这是最小改动、最精准的修复。

```tsx
// updateIdeaCard 改为：
const updateIdeaCard = useCallback((ideaCard: IdeaCard) => {
  dispatch({ type: 'UPDATE_IDEA_CARD', payload: { ...ideaCard, updatedAt: new Date().toISOString() } });
}, []);

// updateMVEResult 同理（N13 的 debounce 也会用到）:
const updateMVEResult = useCallback((id: string, resultStatus: MVE['resultStatus'], resultNotes: string) => {
  dispatch({ type: 'UPDATE_MVE_RESULT', payload: { id, resultStatus, resultNotes } });
}, []);

// Provider value 用 useMemo 包裹（依赖 [state] + 被引用的 useCallback 函数）:
const value = useMemo<AppContextType>(() => ({
  state,
  addObservation, // 仍 inline
  createIdeaCard,  // 仍 inline
  updateIdeaCard,  // useCallback
  deleteIdeaCard,  // useCallback
  updateMVEResult, // useCallback
  // ... 其余
}), [state, /* inline 函数引用随 state 变化 */]);
```

> 由于 inline 函数仍随 state 变化产生新引用，useMemo 实际只在所有依赖不变时跳过 value 重建——inline 函数引用每次变化都会使 useMemo 失效。**所以最终最简方案**：仅 useCallback 包裹 `updateIdeaCard` 和 `updateMVEResult`（这两个被 debounce effect 依赖），不动 value 包裹。这能直接修复 N15 的核心症状（debounce 失效），改动最小。

**最终最简方案（采纳）**:
1. `updateIdeaCard` 和 `updateMVEResult` 用 `useCallback([], )` 包裹
2. 其余保持现状
3. IdeaWorkspaceClient 和 MVEResultClient 的 debounce effect 依赖数组保留 `updateIdeaCard`/`updateMVEResult`（现在引用稳定，不会重置定时器）

---

### 阶段 3: 低严重 + 验证（V3-4.8 + V3-4.9 + V3-5）

#### 3.1 deploy.yml npm install → npm ci（V3-4.8）

```yaml
# .github/workflows/deploy.yml 行 25
- run: npm ci
```

#### 3.2 MVEResultClient params.id 确认（V3-4.9）

`app/mve/[id]/page.tsx` 行 10-11 已经是 `params: { id: string }` 类型签名，Next.js 单段动态路由保证 `params.id` 为 string。无需修改，仅确认。

#### 3.3 TypeScript 类型检查 + 构建验证

```bash
npx tsc --noEmit
npm run build
```

#### 3.4 手动验证清单

- [ ] 首页能正常渲染（不白屏）
- [ ] MVE 详情页编辑 resultNotes 不被覆盖（v3-N2 已修复）
- [ ] MVE 详情页编辑后切换页面/后退数据仍在（N13 新增）
- [ ] Idea Workspace 编辑文本字段后，切换页面再回来数据仍在（v3-N3 已修复）
- [ ] 三个动态路由首次访问不闪烁 404（V3-4.2）
- [ ] 删除 Paper 后，关联 Idea 的 sourcePaperIds 不再包含该 Paper id（v3-V2-3.1 已修复）
- [ ] 删除 ResearchArea 后，从列表消失，关联 Paper/Idea 不再显示该子领域标签（N14 新增）
- [ ] 直接访问已删除的 ResearchArea URL 显示 404（v3-N4 已修复）
- [ ] PaperCard 在 evidence/assumptions/questionsToVerify 为空数组时不显示 "0"（N12 新增）
- [ ] 访问不存在的路径显示自定义 404 页面（V3-4.6）
- [ ] 各 modal 关闭按钮有 aria-label（V3-4.4）
- [ ] AddPaperModal 提交按钮在 form 内，Enter 键可提交（V3-4.3）

---

## 实施顺序与依赖

```
阶段 1（High）→ 阶段 2（Medium）→ 阶段 3（Low + 验证）
```

- 阶段 1 的 1.4（MVEResultClient 自动保存）依赖阶段 2 的 2.7（updateMVEResult useCallback）——但为避免循环依赖，1.4 先实现 debounce 逻辑，2.7 再包裹 useCallback。两阶段顺序实施无冲突。
- 阶段 2 的 2.6（DELETE_AREA 级联）独立，不依赖其他修复。
- 阶段 2 的 2.7（useCallback）影响 IdeaWorkspaceClient 和 MVEResultClient 的 debounce effect，但只在依赖数组中保留函数引用即可，组件代码无需改动。

---

## 关键决策记录

1. **N12 修复方式**: 使用 `> 0` 比较而非 `Boolean()` 包裹（与 v3-N6 已修复的 4 处保持一致风格）。evidence 概括判断（行 179-182）用 `Boolean()` 包裹因为涉及多个 `||` 操作。

2. **N13 MVEResultClient 自动保存**: 复用 IdeaWorkspaceClient 的 debounce 模式（2 秒 + beforeunload + 强制保存），保持一致性。resultStatus/resultNotes 是独立 useState，effect 依赖数组相应调整。

3. **N14 DELETE_AREA 级联**: 选择级联清理 Paper.areaIds 和 IdeaCard.areaIds（方案 A），而非在 getAreaName 中过滤 isHidden（方案 B）。方案 A 数据一致性更强，且与 DELETE_PAPER 的级联清理模式一致。

4. **N15 useCallback 范围**: 仅包裹 `updateIdeaCard` 和 `updateMVEResult`（被 debounce effect 依赖），不包裹所有函数（避免改动过大）。这是精准修复，直接解决 debounce 失效症状。

5. **静态导出 404 架构问题**: 明确不在本轮范围。`dynamicParams = true` 已允许客户端导航，刷新页面 404 是已知限制。

6. **V3-4.9**: 经确认 MVEResultClient 通过 props 接收 `id: string`（page.tsx 已解构），无需安全处理。仅记录确认结果。
