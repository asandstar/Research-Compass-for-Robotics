# Research Compass 修复计划 v5

> 接续 v4。本轮聚焦剩余两项影响用户体验的问题：1) 静态导出 + 用户创建内容刷新 404；2) Modal a11y。

## 待修复问题

### A. 静态导出 + 用户创建内容刷新 404（架构性，高影响）

**根因**: `output: 'export'` 模式下 `generateStaticParams` 仅返回 mock 数据 ID。用户通过 `addPaper`/`createIdeaCard`/`generateMVE` 创建的新条目 ID 不在预渲染列表中，**客户端导航正常**（Link/router.push 工作），但**刷新页面或直接访问 URL 时 404**。

**修复方案**: 新增通用动态详情页 `/detail/[type]/[id]`，所有用户新创建的内容跳转到此页面。

### B. Modal a11y（8 处 modal，中影响）

**问题**: 所有 modal 缺 `role="dialog"` / `aria-modal="true"` / Escape 关闭处理 / 点击遮罩关闭。

**修复方案**: 为所有 8 处 modal 添加 a11y 属性和 Escape 处理。

---

## 实施方案

### 阶段 1: 创建通用动态详情页（A）

#### 1.1 新建 `app/detail/[type]/[id]/page.tsx`

```tsx
import DetailPageClient from './DetailPageClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { type: 'idea', id: 'placeholder' },
    { type: 'mve', id: 'placeholder' },
  ];
}

export default function Page({ params }: { params: { type: string; id: string } }) {
  return <DetailPageClient type={params.type} id={params.id} />;
}
```

> **关键**: `generateStaticParams` 返回至少一个占位符确保路由被构建。`dynamicParams = true` 允许客户端导航到任意路径。由于 Next.js 静态导出会为每个返回的参数生成页面，但用户创建的 ID 不会预渲染——这里依赖客户端导航和 localStorage。

#### 1.2 新建 `app/detail/[type]/[id]/DetailPageClient.tsx`

根据 `type` 路由到对应的 client 组件：
- `type === 'idea'` → 渲染 IdeaWorkspaceClient（传入 id）
- `type === 'mve'` → 渲染 MVEResultClient（传入 id）
- 其他 → 404

```tsx
'use client';

import { useParams } from 'next/navigation';
import IdeaWorkspaceClient from '../../../idea/[id]/IdeaWorkspaceClient';
import MVEResultClient from '../../../mve/[id]/MVEResultClient';

interface DetailPageClientProps {
  type: string;
  id: string;
}

export default function DetailPageClient({ type, id }: DetailPageClientProps) {
  if (type === 'idea') {
    return <IdeaWorkspaceClient id={id} />;
  }
  if (type === 'mve') {
    return <MVEResultClient id={id} />;
  }
  return (
    <div className="text-center py-20">
      <p className="text-gray-500">未知的详情页类型</p>
    </div>
  );
}
```

#### 1.3 修改创建新内容后的跳转逻辑

在以下位置将 `router.push('/idea/${id}')` 改为 `router.push('/detail/idea/${id}')`，`router.push('/mve/${id}')` 改为 `router.push('/detail/mve/${id}')`：

1. `context/AppContext.tsx` 中的 `createIdeaFromPaper` 返回值后（如果有跳转）
2. `app/areas/[id]/AreaDetailClient.tsx` 的 `handleGenerateIdea`
3. `app/papers/page.tsx` 的 `handleGenerateIdea`
4. `app/idea/[id]/IdeaWorkspaceClient.tsx` 的 `handleGenerateMVE`

**但保留 mock 数据的原始路径**: 不修改 mock 数据中的链接（如 Dashboard 中点击 mock Idea 仍跳 `/idea/xxx`）。

**更简单的策略**: 统一所有跳转到 `/detail/[type]/[id]`，mock 和新建内容一致处理，避免分叉。

#### 1.4 修改 Link 组件

在以下位置将 `<Link href="/idea/${id}">` 改为 `<Link href="/detail/idea/${id}">`，将 `<Link href="/mve/${id}">` 改为 `<Link href="/detail/mve/${id}">`：

- `app/page.tsx`（首页 Dashboard 中的 Idea/MVE 列表）
- `app/areas/[id]/AreaDetailClient.tsx`（Idea 和 MVE 列表）
- `app/areas/page.tsx`（如有）
- `app/papers/page.tsx`（如有）
- `components/idea/IdeaCardMini.tsx`
- `components/paper/PaperCard.tsx`（如有 Idea 链接）

#### 1.5 删除或保留原动态路由

**保留**: 原 `/idea/[id]` 和 `/mve/[id]` 路由保留，因为 `generateStaticParams` 仍为 mock 数据预渲染页面，提供 SEO 和首屏加载性能。

> 这样 mock 数据访问 `/idea/xxx`（预渲染，快），用户新建数据访问 `/detail/idea/xxx`（客户端渲染，支持刷新）。

### 阶段 2: Modal a11y（B）

为 8 处 modal 添加：

1. **遮罩层 div** 添加 `role="dialog"` `aria-modal="true"` `aria-labelledby="<title-id>"`
2. **标题** 添加 `id="<title-id>"`
3. **Escape 关闭**: 添加 `useEffect` 监听 `keydown` 事件
4. **点击遮罩关闭**: 在遮罩层 `onClick` 中调用 `onClose`，内部内容 `onClick={e => e.stopPropagation()}`

**受影响文件**:
1. `components/paper/AddPaperModal.tsx`
2. `components/paper/AnalysisResultModal.tsx`
3. `components/idea/CreateIdeaModal.tsx`
4. `components/idea/IdeaEvaluationModal.tsx`
5. `app/areas/[id]/AreaDetailClient.tsx`（删除确认）
6. `app/areas/page.tsx`（新增/编辑子领域）
7. `app/idea/[id]/IdeaWorkspaceClient.tsx`（补充观察）
8. `app/mve/[id]/MVEResultClient.tsx`（确认更新状态）

**实现示例**:
```tsx
// 添加 useEffect 监听 Escape
useEffect(() => {
  if (!isOpen) return;
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);

// 遮罩层
<div
  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onClick={onClose}
>
  <div
    className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
    onClick={e => e.stopPropagation()}
  >
    <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
      <h2 id="modal-title" className="text-lg font-semibold">标题</h2>
      <button onClick={onClose} aria-label="关闭">×</button>
    </div>
    {/* 内容 */}
  </div>
</div>
```

---

## 验证清单

- [ ] 用户新建 Idea 后，刷新 `/detail/idea/xxx` 页面不 404
- [ ] 用户新建 MVE 后，刷新 `/detail/mve/xxx` 页面不 404
- [ ] Mock 数据仍可通过 `/idea/xxx` 和 `/mve/xxx` 访问
- [ ] 所有 modal 按 Escape 可关闭
- [ ] 点击 modal 遮罩可关闭
- [ ] Modal 有 role="dialog" 和 aria-modal
- [ ] TypeScript 检查通过
- [ ] 构建成功

---

## 关键决策

1. **通用详情页路径**: 使用 `/detail/[type]/[id]`，清晰表达意图。
2. **保留原路由**: mock 数据仍用原路径，享受预渲染性能优势。
3. **统一跳转**: 所有 Link/router.push 统一改为 `/detail/[type]/[id]`，简化逻辑。
4. **Modal a11y 范围**: 仅添加基本 a11y（role/aria/Escape/遮罩点击），不实现 focus trap（focus trap 复杂度高，需要管理 focus 顺序）。
