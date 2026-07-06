# Research Compass 综合修复计划 v3

> 本计划整合原 v2 计划未完成项 + 本轮新发现的问题,按严重程度分阶段实施。
> 用户已批准 v2 计划的修复范围(高严重 + 中严重全部修复),v3 在此基础上补充新发现的严重/高/中严重问题。

## 背景

本轮通过 4 个并行搜索代理全面检查了代码库,发现除 v2 计划未完成的 7 项外,还存在 **2 项严重 bug**(包括首页 TDZ 崩溃)、**4 项高严重问题**、**5 项中严重问题**。本计划整合所有待修复项,共 5 个阶段。

---

## 待修复问题清单

### 原 v2 计划未完成项(已批准)

| ID | 问题 | 文件 | 严重程度 |
|---|---|---|---|
| V2-3.1 | DELETE_PAPER 未级联清理 IdeaCard.sourcePaperIds(悬空引用) | context/AppContext.tsx 行 199-203 | 高 |
| V2-3.5 | 缺 DELETE_AREA action(用户无法删除误建子领域) | context/AppContext.tsx、lib/types.ts | 高 |
| V2-4.1 | button 嵌套在 Link 内(HTML 无效嵌套) | app/areas/page.tsx 行 86-147 | 高 |
| V2-4.2 | 缺 metadata 导出(SEO 失效) | app/layout.tsx | 高 |
| V2-4.3 | 动态路由组件 hydration 闪烁(数据未就绪显示 404) | AreaDetailClient、IdeaWorkspaceClient、MVEResultClient | 高 |
| V2-4.4 | 提交按钮在 form 外 + as any 类型 hack | components/paper/AddPaperModal.tsx 行 576-585 | 中 |
| V2-4.6 | 图标按钮缺 aria-label | AddPaperModal、AreaDetailClient、MVEResultClient、papers/page.tsx | 中 |
| V2-5.1 | TypeScript + 构建验证 | - | 验证 |

### 本轮新发现 - 严重(Critical)

| ID | 问题 | 文件 | 影响 |
|---|---|---|---|
| N1 | **首页 TDZ 崩溃**:`activeIdeaCards` 在行 30 被引用,行 37 才声明 | app/page.tsx 行 30 vs 37 | **首页白屏崩溃**,构建可能失败 |
| N2 | MVEResultClient useEffect 依赖 `state.mves`,会覆盖用户正在输入的本地编辑 | app/mve/[id]/MVEResultClient.tsx 行 35 | 用户输入数据丢失 |

### 本轮新发现 - 高(High)

| ID | 问题 | 文件 | 影响 |
|---|---|---|---|
| N3 | IdeaWorkspaceClient 8 个文本字段 onChange 只 setIdeaCard 不 updateIdeaCard,切换页面/生成 MVE 前未保存会丢失 | app/idea/[id]/IdeaWorkspaceClient.tsx 行 159-282 | 用户编辑静默丢失 |
| N4 | getResearchAreaById 未过滤 isHidden,返回已隐藏区域,详情页可直接访问 | context/AppContext.tsx 行 552-554 | 软删除失效 |
| N5 | AreaDetailClient 无删除 ResearchArea 的 UI 入口(配合 V2-3.5) | app/areas/[id]/AreaDetailClient.tsx | deleteArea 函数无 UI 调用 |
| N6 | PaperCard `{length && (...)}` 当 length 为 0 时渲染数字 "0" | components/paper/PaperCard.tsx 行 186/198/210/222 | UI 显示孤零零的 "0" |

### 本轮新发现 - 中(Medium)

| ID | 问题 | 文件 | 影响 |
|---|---|---|---|
| N7 | 5 处 async 函数无 try/catch,rejection 未处理 | AreaDetailClient、papers/page.tsx、ObservationInput、CreateIdeaModal、AddPaperModal | 用户无错误反馈 |
| N8 | 缺 app/not-found.tsx 自定义 404 页面 | app/not-found.tsx(缺失) | GitHub Pages 上 404 体验差 |
| N9 | storage.ts 未为 legacy ResearchArea 设置默认 isHidden | lib/storage.ts | legacy 数据可能全部隐藏 |
| N10 | AreaDetailClient `params.id as string` 不安全(未处理数组情况) | app/areas/[id]/AreaDetailClient.tsx 行 19 | 类型断言风险 |
| N11 | deploy.yml 用 `npm install` 而非 `npm ci` | .github/workflows/deploy.yml 行 25 | CI 可复现性 |

---

## 实施方案

### 阶段 1:严重 bug 立即修复(N1 + N2)

> 这两项会导致首页白屏和用户数据丢失,必须最先修复。

#### 1.1 修复 app/page.tsx TDZ 崩溃(N1)

**文件**: `app/page.tsx`

**问题**: 行 30 引用 `activeIdeaCards`,行 37 才声明,违反 TDZ。

**修复**: 将 `activeIdeaCards` 声明(行 37-39)移到 `firstActiveIdea`(行 30)之前。

```tsx
// 修复后顺序:
const activeIdeaCards = state.ideaCards.filter(card =>
  card.status !== 'abandoned'
).slice(0, 5);
const firstActiveIdea = activeIdeaCards[0];
// ... 其他变量
```

#### 1.2 修复 MVEResultClient useEffect 覆盖本地编辑(N2)

**文件**: `app/mve/[id]/MVEResultClient.tsx` 行 35

**问题**: `useEffect` 依赖 `state.mves`,任何对 mves 数组的变更(包括本组件 `updateMVEResult` 触发的 dispatch)都会覆盖用户正在输入的 `resultStatus`/`resultNotes`。

**修复**: 依赖改为 `[id]`,与 IdeaWorkspaceClient 保持一致策略。

```tsx
// 修复前:
useEffect(() => { ... }, [id, state.mves]);

// 修复后:
useEffect(() => { ... }, [id]);
```

---

### 阶段 2:原 v2 计划未完成的高严重项(V2-3.1 + V2-3.5 + V2-4.1 + N5)

#### 2.1 修复 DELETE_PAPER 级联清理(V2-3.1)

**文件**: `context/AppContext.tsx` 行 199-203

**修复**: 参照 DELETE_IDEA_CARD 模式,添加 IdeaCard.sourcePaperIds 清理。

```tsx
case 'DELETE_PAPER': {
  const targetId = action.payload;
  return {
    ...state,
    papers: state.papers.filter(paper => paper.id !== targetId),
    ideaCards: deduplicateById(state.ideaCards.map(card => ({
      ...card,
      sourcePaperIds: card.sourcePaperIds.filter(pid => pid !== targetId),
    }))),
  };
}
```

#### 2.2 添加 DELETE_AREA action + 软删除(V2-3.5)

**文件**: `context/AppContext.tsx`、`lib/types.ts`(无需改,ResearchArea.isHidden 已存在)

**修复**:
1. 在 Action 类型联合中添加 `{ type: 'DELETE_AREA'; payload: string }`
2. 添加 reducer case(软删除 `isHidden: true`)
3. 在 AppContextType 接口添加 `deleteArea: (id: string) => void`
4. 实现 deleteArea 函数并暴露

```tsx
// Action 类型(行 43 后添加):
| { type: 'DELETE_AREA'; payload: string }

// reducer(在 UPDATE_RESEARCH_AREA 后添加):
case 'DELETE_AREA': {
  const targetId = action.payload;
  return {
    ...state,
    researchAreas: deduplicateById(state.researchAreas.map(area =>
      area.id === targetId ? { ...area, isHidden: true, updatedAt: new Date().toISOString() } : area
    )),
  };
}

// AppContextType 接口添加:
deleteArea: (id: string) => void;

// 函数实现:
const deleteArea = (id: string) => {
  dispatch({ type: 'DELETE_AREA', payload: id });
};

// Provider value 添加 deleteArea
```

#### 2.3 修复 getResearchAreaById 过滤 isHidden(N4)

**文件**: `context/AppContext.tsx` 行 552-554

**修复**: 添加 `!area.isHidden` 条件。

```tsx
const getResearchAreaById = (id: string): ResearchArea | undefined => {
  return state.researchAreas.find(area => area.id === id && !area.isHidden);
};
```

> 注意:getPapersByAreaId、getIdeasByAreaId、getMvesByAreaId 不需要改,因为调用方已通过 visibleAreas 过滤。但 getResearchAreaById 用于详情页直接访问,必须过滤。

#### 2.4 修复 app/areas/page.tsx button 嵌套 Link(V2-4.1)

**文件**: `app/areas/page.tsx` 行 86-147

**问题**: `<button>` 嵌套在 `<Link>` 内,HTML 无效嵌套,`e.preventDefault()` 是 hack。

**修复**: 将 Card 整体作为 Link,编辑按钮移出 Link,改为绝对定位浮在 Card 右上角。

```tsx
// 修复后结构:
<div key={area.id} className="relative group">
  <Link href={`/areas/${area.id}`} className="no-underline hover:no-underline block">
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-4 space-y-3">
        {/* ... 卡片内容,不含 button ... */}
      </div>
    </Card>
  </Link>
  <button
    onClick={() => openEdit(area)}
    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
    aria-label="编辑子领域"
  >
    <Edit3 className="w-4 h-4" />
  </button>
</div>
```

#### 2.5 在 AreaDetailClient 添加删除按钮 UI(N5)

**文件**: `app/areas/[id]/AreaDetailClient.tsx`

**修复**: 在页面顶部操作区添加"删除"按钮,调用 deleteArea 并弹出确认对话框。

```tsx
// 添加 state:
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const { deleteArea } = useApp();

// JSX 在现有按钮组旁添加:
<Button variant="secondary" onClick={() => setShowDeleteConfirm(true)}>
  删除子领域
</Button>

// 确认对话框:
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
      <h3 className="text-lg font-semibold mb-2">确认删除</h3>
      <p className="text-sm text-gray-600 mb-4">
        删除后子领域将被隐藏,关联的论文和 Idea 不会被删除。此操作不可撤销。
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
        <Button onClick={() => { deleteArea(areaId); router.push('/areas'); }}>确认删除</Button>
      </div>
    </div>
  </div>
)}
```

---

### 阶段 3:高严重问题(N3 + N6)

#### 3.1 修复 IdeaWorkspaceClient 文本字段未持久化(N3)

**文件**: `app/idea/[id]/IdeaWorkspaceClient.tsx` 行 159-282

**问题**: 8 个文本字段 onChange 只调用 `setIdeaCard`,不调用 `updateIdeaCard`,用户切换页面/生成 MVE 前未保存会丢失。

**修复方案**: 采用 debounce 自动保存。添加 isDirty 标记,在生成 MVE / AI 评估 / 路由离开前自动保存。

**具体修改**:

1. 添加 isDirty 状态和防抖保存 effect:
```tsx
const [isDirty, setIsDirty] = useState(false);

// 防抖自动保存(2 秒无操作后保存)
useEffect(() => {
  if (!isDirty || !ideaCard) return;
  const timer = setTimeout(() => {
    updateIdeaCard(ideaCard);
    setIsDirty(false);
  }, 2000);
  return () => clearTimeout(timer);
}, [isDirty, ideaCard]);

// 路由离开前保存
useEffect(() => {
  const handleBeforeUnload = () => {
    if (isDirty && ideaCard) {
      updateIdeaCard(ideaCard);
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty, ideaCard]);
```

2. 修改所有文本字段 onChange,改为调用一个统一的 handleFieldChange:
```tsx
const handleFieldChange = (field: keyof IdeaCard, value: string) => {
  setIdeaCard(prev => prev ? { ...prev, [field]: value } : prev);
  setIsDirty(true);
};

// 各文本框 onChange:
onChange={(e) => handleFieldChange('title', e.target.value)}
onChange={(e) => handleFieldChange('researchQuestion', e.target.value)}
// ... 其他 6 个字段同理
```

3. 在 handleGenerateMVE 和 handleEvaluate 开头添加自动保存:
```tsx
const handleGenerateMVE = async () => {
  try {
    setErrorMessage('');
    // 自动保存未保存的编辑
    if (isDirty && ideaCard) {
      updateIdeaCard(ideaCard);
      setIsDirty(false);
    }
    const mve = await generateMVE(ideaCard.id);
    router.push(`/mve/${mve.id}`);
  } catch (error) {
    console.error('Failed to generate MVE:', error);
    setErrorMessage('生成 MVE 失败,请重试');
  }
};
```

4. 在顶部操作区显示"未保存"提示:
```tsx
{isDirty && (
  <span className="text-xs text-amber-600">未保存</span>
)}
```

#### 3.2 修复 PaperCard 渲染数字 "0"(N6)

**文件**: `components/paper/PaperCard.tsx` 行 186/198/210/222

**问题**: `{paper.evidence?.tasks?.length && (...)}` 当 length 为 0 时,`0 && (...)` 返回 `0`,React 会渲染数字 "0"。

**修复**: 改为 `{paper.evidence?.tasks?.length > 0 && (...)}`。

```tsx
// 修复前(4 处):
{paper.evidence?.tasks?.length && (...)}
{paper.evidence?.baselines?.length && (...)}
{paper.evidence?.metrics?.length && (...)}
{paper.evidence?.keyResults?.length && (...)}

// 修复后(4 处):
{paper.evidence?.tasks?.length > 0 && (...)}
{paper.evidence?.baselines?.length > 0 && (...)}
{paper.evidence?.metrics?.length > 0 && (...)}
{paper.evidence?.keyResults?.length > 0 && (...)}
```

---

### 阶段 4:中严重问题(V2-4.2 + V2-4.3 + V2-4.4 + V2-4.6 + N7-N11)

#### 4.1 添加 app/layout.tsx metadata(V2-4.2)

**文件**: `app/layout.tsx`

**修复**: 添加 metadata 导出。

```tsx
import type { Metadata } from 'next';
import { ClientProviders } from './ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research Compass for Robotics - 机器人科研方向管理工作台',
  description: '从子领域探索到论文阅读,从灵感捕捉到最小可行实验验证——帮你系统判断机器人科研方向值不值得走。',
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

#### 4.2 修复动态路由组件 hydration 闪烁(V2-4.3)

**文件**: `AreaDetailClient.tsx`、`IdeaWorkspaceClient.tsx`、`MVEResultClient.tsx`

**问题**: AppContext 初始化 useEffect 在组件挂载后才 dispatch INIT_DATA,首次渲染时 state 为空,组件显示 404。

**修复方案**: 在 AppContext 添加 `isInitialized` 状态,INIT_DATA dispatch 时设为 true;各动态路由组件在 `!isInitialized` 时显示 loading 而非 404。

**AppContext.tsx 修改**:
```tsx
// AppState 接口添加:
isInitialized: boolean;

// 初始 state(行 343-355)添加:
isInitialized: false,

// INIT_DATA reducer(行 70-78)添加:
case 'INIT_DATA':
  return {
    ...state,
    observations: deduplicateById(action.payload.observations),
    // ... 其他
    isInitialized: true,  // 新增
  };

// AppContextType 接口暴露(可选,各组件通过 state.isInitialized 读取)
```

**AreaDetailClient.tsx 修改**:
```tsx
const { state, getResearchAreaById, ... } = useApp();
const area = getResearchAreaById(areaId);

if (!state.isInitialized) {
  return <div className="text-center py-20 text-gray-500">加载中...</div>;
}

if (!area) {
  return <div className="text-center py-20">...404...</div>;
}
```

**IdeaWorkspaceClient.tsx 修改**:
```tsx
const { state, getIdeaCardById, ... } = useApp();
const [ideaCard, setIdeaCard] = useState(getIdeaCardById(id));

// 添加 effect 响应 isInitialized 变化:
useEffect(() => {
  if (state.isInitialized) {
    setIdeaCard(getIdeaCardById(id));
  }
}, [id, state.isInitialized]);

if (!state.isInitialized) {
  return <div className="text-center py-20 text-gray-500">加载中...</div>;
}

if (!ideaCard) {
  return <div>...404...</div>;
}
```

**MVEResultClient.tsx 修改**:
```tsx
const { state, getMVEById, ... } = useApp();

if (!state.isInitialized) {
  return <div className="text-center py-20 text-gray-500">加载中...</div>;
}

if (!mve) {
  return <div>...404...</div>;
}
```

#### 4.3 修复 AddPaperModal 按钮位置 + as any(V2-4.4)

**文件**: `components/paper/AddPaperModal.tsx` 行 576-585

**修复**: 将按钮组移入 `<form>` 内,移除 `as any`。

```tsx
// 修复前(行 576-585):
    </form>
    <div className="flex justify-end gap-3 p-5 border-t border-gray-100 flex-shrink-0">
      <Button variant="secondary" type="button" onClick={onClose}>取消</Button>
      <Button type="submit" onClick={handleSubmit as any}>
        {editingPaper ? '保存修改' : '添加论文'}
      </Button>
    </div>

// 修复后:
      <div className="flex justify-end gap-3 p-5 border-t border-gray-100 flex-shrink-0">
        <Button variant="secondary" type="button" onClick={onClose}>取消</Button>
        <Button type="submit">
          {editingPaper ? '保存修改' : '添加论文'}
        </Button>
      </div>
    </form>
```

> 注意:form 的 onSubmit 已绑定 handleSubmit,提交按钮 type="submit" 会自动触发,无需 onClick。

#### 4.4 添加 a11y aria-label(V2-4.6)

**文件和位置**:
- `components/paper/AddPaperModal.tsx` 行 223-225: 关闭按钮添加 `aria-label="关闭"`
- `app/areas/[id]/AreaDetailClient.tsx` 行 49-51: 返回按钮添加 `aria-label="返回"`
- `app/mve/[id]/MVEResultClient.tsx` 行 75-77: 返回按钮添加 `aria-label="返回"`
- `app/papers/page.tsx` 行 108、170-172: SVG 添加 `aria-hidden="true"`
- `app/areas/page.tsx` 行 99-104: 编辑按钮添加 `aria-label="编辑子领域"`(已在 2.4 中处理)

#### 4.5 修复 5 处 async 函数无 try/catch(N7)

**文件和位置**:

1. **AreaDetailClient.tsx** handleGenerateIdea(行 24-27):
```tsx
const handleGenerateIdea = async (paperId: string) => {
  try {
    const idea = await createIdeaFromPaper(paperId);
    router.push(`/idea/${idea.id}`);
  } catch (error) {
    console.error('Failed to generate idea:', error);
    alert('生成 Idea 失败,请重试');
  }
};
```

2. **papers/page.tsx** handleGenerateIdea(行 82-85): 同上模式。

3. **ObservationInput.tsx** handleSubmit(行 13-18):
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!content.trim()) return;
  try {
    await addObservation(content.trim());
    setContent('');
  } catch (error) {
    console.error('Failed to add observation:', error);
    alert('添加观察失败,请重试');
  }
};
```

4. **CreateIdeaModal.tsx** handleSubmit(行 26-40): 同上模式,添加 try/catch。

5. **AddPaperModal.tsx** handleParseArxiv 和 handleGenerateSummary(行 132-176): 添加 try/catch。

> 注:使用 `alert` 是 MVP 阶段最简单的错误反馈方式,后续可升级为 toast。

#### 4.6 创建 app/not-found.tsx(N8)

**文件**: `app/not-found.tsx`(新建)

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <div className="text-lg font-semibold text-gray-800 mb-2">页面不存在</div>
        <p className="text-sm text-gray-500 mb-4">您访问的页面可能已被删除或地址有误。</p>
        <Link href="/" className="text-indigo-600 hover:underline">
          返回首页
        </Link>
      </div>
    </div>
  );
}
```

> 注:由于 ClientProviders 在 layout.tsx 中全局包裹,not-found.tsx 会自动继承 Navbar 和样式。

#### 4.7 修复 storage.ts legacy ResearchArea isHidden 迁移(N9)

**文件**: `lib/storage.ts`

**修复**: 在 loadFromStorage 中对 ResearchArea 做默认值迁移,类似 addDefaultIdeaFields。

```tsx
function addDefaultAreaFields(area: any): ResearchArea {
  return {
    ...area,
    isHidden: area.isHidden ?? false,  // 默认 false
  };
}

// 在 loadFromStorage 中应用:
researchAreas: (parsed.researchAreas as any[]).map(addDefaultAreaFields),
```

#### 4.8 修复 AreaDetailClient params.id 类型断言(N10)

**文件**: `app/areas/[id]/AreaDetailClient.tsx` 行 19

```tsx
// 修复前:
const areaId = params.id as string;

// 修复后:
const areaId = Array.isArray(params.id) ? params.id[0] : params.id;
```

> 注:同样修改 IdeaWorkspaceClient.tsx 和 MVEResultClient.tsx 中的 params.id 处理。

#### 4.9 修复 deploy.yml npm install → npm ci(N11)

**文件**: `.github/workflows/deploy.yml` 行 25

```yaml
# 修复前:
- run: npm install

# 修复后:
- run: npm ci
```

---

### 阶段 5:验证(V2-5.1)

#### 5.1 TypeScript 类型检查

```bash
npx tsc --noEmit
```

#### 5.2 构建验证

```bash
npm run build
```

> 注意:修复 N1(TDZ 崩溃)后,构建应能通过。修复前构建可能失败。

#### 5.3 手动验证清单

- [ ] 首页能正常渲染(不白屏)
- [ ] MVE 详情页编辑 resultNotes 不被覆盖
- [ ] Idea Workspace 编辑文本字段后,切换页面再回来数据仍在
- [ ] 删除 Paper 后,关联 Idea 的 sourcePaperIds 不再包含该 Paper id
- [ ] 删除 ResearchArea 后,从列表消失,但关联 Paper/Idea 仍存在
- [ ] 直接访问已删除的 ResearchArea URL 显示 404
- [ ] 各动态路由首次访问不闪烁 404
- [ ] PaperCard 在 evidence 字段为空数组时不显示 "0"
- [ ] 访问不存在的路径显示自定义 404 页面

---

## 不在本次修复范围内(低严重,后续迭代)

以下问题严重程度低,工作量大,留待后续迭代:

- 全部 Modal 的 focus trap / role="dialog" / Escape 处理(7 处 Modal)
- 全部表单的 htmlFor/id 关联(约 44 处 label)
- 14 处 as any 类型转换(除 AddPaperModal 行 582 已修复外)
- app/page.tsx 行 116 href="#" 死链
- PaperCard.tsx 图标按钮用 title 而非 aria-label
- MVEResultClient / AreaDetailClient loading 骨架屏(已有简单 loading 文本)
- Select 组件不支持 label prop
- ObservationInput 空 label + CSS 隐藏的 hack

---

## 实施顺序与依赖

```
阶段 1(N1+N2)→ 阶段 2(V2-3.1+3.5+4.1+N5+N4)→ 阶段 3(N3+N6)→ 阶段 4(中严重)→ 阶段 5(验证)
```

- 阶段 1 必须最先(严重 bug)
- 阶段 2 的 V2-3.5(DELETE_AREA)和 N5(UI 入口)需一起实施
- 阶段 2 的 N4(getResearchAreaById 过滤)依赖 V2-3.5
- 阶段 3 的 N3(IdeaWorkspace 持久化)独立
- 阶段 4 的 4.2(hydration)依赖 AppContext 添加 isInitialized,影响 3 个组件
- 阶段 5 验证所有修复

---

## 关键决策记录

1. **N3 修复方案选择**:采用 debounce 自动保存(2 秒)+ 路由离开前保存,而非每个 onChange 立即保存(性能考虑)。同时在生成 MVE/评估前强制保存,避免静默错误。

2. **N4 修复范围**:只修改 getResearchAreaById,不改 getPapersByAreaId 等(调用方已通过 visibleAreas 过滤)。

3. **N7 错误反馈方式**:使用 `alert` 而非 toast 组件(MVP 阶段最简,IdeaWorkspaceClient 已有 errorMessage 状态作为更优方案的参考)。

4. **V2-4.3 hydration 修复方案**:添加 isInitialized 状态,而非使用 useSyncExternalStore(改动小,与现有架构一致)。

5. **N5 删除确认对话框**:简单实现,不引入 focus trap(留待后续 a11y 完整改造)。
