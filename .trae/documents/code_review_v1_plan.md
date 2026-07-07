# Research Compass v1.0 代码审查报告与修复计划

> 审查时间：2026-07-07
> 审查范围：全部页面、组件、上下文、工具函数

---

## 一、审查结论

经过全面代码审查，共发现 **5 个问题**：
- 🔴 严重：1 个（404 刷新后无法跳转回原页面）
- 🟡 中等：2 个（跳转逻辑错误、全页刷新）
- 🟢 轻微：2 个（路径不一致、冗余代码）

**TypeScript 类型检查**：✅ 通过（0 errors）
**Next.js 构建**：待验证

---

## 二、问题详细列表

### 🔴 问题 1：404 SPA Fallback 不工作（严重）

**问题描述**：
刷新任何子页面（如 `/focus`、`/ideas`、`/papers`）后，GitHub Pages 返回 404.html，该页面将用户重定向到 `/?r=<original_path>`，但首页 `app/page.tsx` 没有处理 `?r=` 查询参数的逻辑，导致用户永远停留在首页，无法回到原来的页面。

**影响范围**：
- 所有子页面刷新后无法回到原页面
- 严重影响用户体验，特别是刷新 404 问题

**根因分析**：
`public/404.html` 第 18 行：
```js
window.location.href = window.location.origin + basePath + '/?r=' + encodeURIComponent(path + query);
```
但首页 `app/page.tsx` 中完全没有读取 `?r=` 参数并进行客户端跳转的代码。

**修复方案**：
在 `app/page.tsx` 中添加 useEffect，读取 `?r=` 参数并使用 `router.push()` 跳转到对应路径。需要使用 `useSearchParams`。

**涉及文件**：
- `app/page.tsx`

---

### 🟡 问题 2：Dashboard 活跃 Ideas 点击跳转逻辑错误（中等）

**问题描述**：
Dashboard 的"活跃 Ideas"列表中，点击某个 Idea 卡片会跳转到 `/focus`，但**不会将该 Idea 设置为 activeIdea**。这意味着：
- 如果之前已有 activeIdea，会显示之前的 Idea 而不是用户点击的那个
- 如果没有 activeIdea，会显示空状态，用户完全不知道发生了什么

**影响范围**：
- Dashboard → 活跃 Ideas 卡片的点击交互
- 用户期望：点击哪个 Idea 就进入哪个 Idea 的聚焦页面

**根因分析**：
`app/page.tsx` 第 268-271 行：
```tsx
<Link
  key={idea.id}
  href="/focus"
  ...
>
```
只是一个简单的 Link 跳转，没有调用 `setActiveIdea(idea.id)`。

**修复方案**：
将 Link 改为 button，点击时调用 `setActiveIdea(idea.id)`（该函数内部会跳转到 /focus）。

**涉及文件**：
- `app/page.tsx`

---

### 🟡 问题 3：setActiveIdea 使用 window.location.href 导致全页刷新（中等）

**问题描述**：
`ActiveIdeaContext.tsx` 中的 `setActiveIdea` 函数使用 `window.location.href` 进行跳转，导致整个页面刷新，而不是 Next.js 的客户端导航。这会：
- 丢失所有 React 状态
- 重新加载所有资源
- 产生明显的白屏闪烁
- 用户体验差

**影响范围**：
- 所有设置 activeIdea 的地方：
  - Ideas 页面点击"聚焦此方向"
  - MVE 历史点击"在聚焦中查看"
  - CommandPalette 点击 Idea
  - 论文页面"生成想法"后
  - Dashboard 活跃 Ideas（修复问题 2 后也会受影响）

**根因分析**：
`context/ActiveIdeaContext.tsx` 第 51 行：
```ts
window.location.href = `${BASE_PATH}/focus`;
```
没有使用 Next.js 的 `useRouter`。

**修复方案**：
在 `ActiveIdeaProvider` 中使用 `useRouter`，将 `window.location.href` 替换为 `router.push('/focus')`。

**涉及文件**：
- `context/ActiveIdeaContext.tsx`

---

### 🟢 问题 4：链接路径尾斜杠不一致（轻微）

**问题描述**：
代码中有些链接带尾斜杠，有些不带，不一致：

| 带尾斜杠 | 不带尾斜杠 |
|----------|------------|
| `/focus/` (page.tsx L83) | `/focus` (Navbar, CommandPalette) |
| `/ideas/` (page.tsx L101) | `/ideas` (Navbar, CommandPalette) |

**影响范围**：
- 不影响功能，Next.js 会自动处理
- 但代码风格不统一

**修复方案**：
统一去掉尾斜杠，保持与 Navbar/CommandPalette 一致。

**涉及文件**：
- `app/page.tsx`（2 处）
- `app/ideas/page.tsx`（1 处）
- `app/mves/page.tsx`（1 处）
- `app/papers/page.tsx`（1 处）

---

### 🟢 问题 5：papers 页面内联定义 Microscope 组件（轻微）

**问题描述**：
`app/papers/page.tsx` 第 581-587 行内联定义了一个 `Microscope` SVG 组件，但 lucide-react 中已经有这个图标了。

**影响范围**：
- 代码冗余
- 增加维护成本

**修复方案**：
从 lucide-react 导入 `Microscope`，删除内联定义。

**涉及文件**：
- `app/papers/page.tsx`

---

## 三、修复计划

### 步骤 1：修复 404 SPA Fallback（高优先级）

**文件**：`app/page.tsx`

**修改内容**：
1. 导入 `useSearchParams` 和 `useRouter`
2. 添加 useEffect，读取 `?r=` 参数
3. 如果存在 `r` 参数，使用 `router.push(r)` 跳转到对应路径
4. 需要用 Suspense 包裹或使用 Client Component

**注意事项**：
- `useSearchParams` 只能在 Client Component 中使用
- 当前 `app/page.tsx` 已经是 `'use client'`，所以没问题
- 需要处理 basePath，但 Next.js 的 router 会自动处理

---

### 步骤 2：修复 Dashboard Ideas 点击跳转（高优先级）

**文件**：`app/page.tsx`

**修改内容**：
1. 导入 `useActiveIdea`
2. 将活跃 Ideas 的 `Link` 组件改为 `button` 或可点击的 div
3. 点击时调用 `setActiveIdea(idea.id)`

**注意事项**：
- 保持视觉样式不变（hover 效果等）
- `setActiveIdea` 内部会处理跳转

---

### 步骤 3：修复 setActiveIdea 全页刷新（中优先级）

**文件**：`context/ActiveIdeaContext.tsx`

**修改内容**：
1. 导入 `useRouter` from `next/navigation`
2. 在 Provider 组件中调用 `useRouter()`
3. 将 `window.location.href = \`${BASE_PATH}/focus\`` 替换为 `router.push('/focus')`
4. 删除 `BASE_PATH` 常量（不再需要）

**注意事项**：
- `useRouter` 是客户端 hook，Provider 已经是 Client Component，没问题
- Next.js 的 router.push 会自动处理 basePath

---

### 步骤 4：统一链接路径（低优先级）

**文件**：
- `app/page.tsx`
- `app/ideas/page.tsx`
- `app/mves/page.tsx`
- `app/papers/page.tsx`

**修改内容**：
- 去掉所有 Link href 的尾斜杠
- `/focus/` → `/focus`
- `/ideas/` → `/ideas`
- `/papers/` → `/papers`
- `/mves/` → `/mves`

---

### 步骤 5：清理冗余 Microscope 组件（低优先级）

**文件**：`app/papers/page.tsx`

**修改内容**：
1. 在顶部 import 中添加 `Microscope`
2. 删除底部的内联 `Microscope` 函数组件

---

### 步骤 6：验证

**验证内容**：
1. TypeScript 类型检查：`npx tsc --noEmit`
2. Next.js 构建：`npm run build`
3. 手动测试（如果有开发服务器）：
   - 刷新 `/focus` 页面 → 应正确重定向回 /focus
   - 点击 Dashboard 的 Idea → 应进入该 Idea 的聚焦页面
   - 切换 Idea → 应无全页刷新

---

## 四、当前项目架构概览

### 4.1 页面路由（v1.0 新版）

```
/                        → Dashboard 概览
/focus                   → 聚焦工作区（核心工作页面）
/ideas                   → 选择研究方向（Idea 列表）
/papers                  → 论文信号流
/mves                    → 验证记录（MVE 历史）
/areas                   → 研究领域地图
```

**重要变化**：
- 旧版的 `/idea/[id]`、`/mve/[id]`、`/detail/[type]/[id]`、`/areas/[id]` **已被移除**
- 现在所有深度工作都在 `/focus` 页面完成，通过 `activeIdeaId` 上下文切换
- 这是一个**重大架构变更**：从多页面改为单页面聚焦模式

### 4.2 核心上下文

| Context | 作用 | 持久化 |
|---------|------|--------|
| `AppContext` | 所有数据（observations, ideas, mves, papers, areas） | localStorage |
| `ActiveIdeaContext` | 当前聚焦的 Idea ID | localStorage (单独的 key) |

### 4.3 组件结构

```
components/
├── Navbar.tsx                 # 顶部导航（含 CommandPalette 触发）
├── CommandPalette.tsx         # ⌘K 命令面板
├── AppShell.tsx               # （未使用？）
├── ui/                        # 原子组件
│   ├── Button, Card, Input, Select, Tag, Textarea
├── focus/                     # 聚焦工作区组件
│   ├── FocusIdeaCard.tsx      # Idea 标题卡片
│   ├── ScoreMeter.tsx         # 评分仪表盘
│   ├── EvidencePressurePanel.tsx  # 证据压力面板
│   ├── NextActionCard.tsx     # 下一步行动建议
│   ├── MVEGateCard.tsx        # MVE 入口卡片
│   └── FocusEditPanel.tsx     # 侧边编辑面板
├── idea/
│   ├── IdeaSelectionCard.tsx  # Idea 选择卡片（/ideas 页面用）
│   ├── IdeaCardMini.tsx       # 迷你卡片（旧版，可能未使用）
│   ├── CreateIdeaModal.tsx    # 新建 Idea 弹窗
│   ├── EvidenceList.tsx       # 证据列表
│   └── IdeaEvaluationModal.tsx # AI 评估弹窗
├── mve/
│   └── MVEHistoryCard.tsx     # MVE 历史卡片
├── paper/
│   ├── AddPaperModal.tsx      # 添加论文弹窗
│   ├── AnalysisResultModal.tsx # 分析结果弹窗
│   ├── PaperCard.tsx          # 论文卡片（旧版，可能未使用）
│   └── PaperSignalCard.tsx    # 论文信号卡片（可能未使用）
├── observation/
│   ├── ObservationInput.tsx   # 观察输入
│   └── ObservationCard.tsx    # 观察卡片
└── area/
    └── AreaMapCard.tsx        # 领域地图卡片
```

### 4.4 可能未使用的组件

以下组件可能是旧版遗留，当前页面未引用：
- `components/AppShell.tsx`
- `components/idea/IdeaCardMini.tsx`
- `components/paper/PaperCard.tsx`
- `components/paper/PaperSignalCard.tsx`

建议后续清理。

---

## 五、其他观察

### 5.1 架构优点

1. **聚焦模式设计优秀**：单页面聚焦工作区的设计符合深度工作理念
2. **上下文分离合理**：AppContext 存数据，ActiveIdeaContext 存 UI 状态
3. **侧边编辑面板模式**：FocusEditPanel 的设计模式很好，保持上下文不中断
4. **CommandPalette**：⌘K 快捷操作提升效率

### 5.2 潜在改进点

1. **IdeaGraph 数据有但无 UI**：`ideaRelationships` 已在 AppState 中定义，但没有任何 UI 展示
2. **缺少 Idea 删除 UI**：有 `deleteIdeaCard` 方法，但用户界面上找不到删除按钮
3. **缺少 Idea 恢复功能**：有 `revived` 状态，但没有 UI 将 rejected 的 Idea 恢复
4. **Observation 输入入口可能缺失**：Dashboard 没有看到 ObservationInput 组件（检查一下）

---

## 六、修复优先级总结

| 优先级 | 问题 | 预估工作量 |
|--------|------|-----------|
| 🔴 P0 | 404 SPA Fallback 不工作 | 小 |
| 🟡 P1 | Dashboard Ideas 点击跳转错误 | 小 |
| 🟡 P1 | setActiveIdea 全页刷新 | 小 |
| 🟢 P2 | 链接路径不一致 | 极小 |
| 🟢 P2 | 冗余 Microscope 组件 | 极小 |

**建议**：优先修复 P0 和 P1 问题，P2 可以顺手一起修了。
