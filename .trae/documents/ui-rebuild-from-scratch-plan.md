# Research Compass UI Rebuild: From Scratch

## Summary

从零重建 Research Compass 的 UI 层。消除所有动态路由（`/idea/[id]`、`/mve/[id]`、`/areas/[id]`），替换为6个扁平、稳定的路由。每个链接都指向稳定路径。所有 `actionPath` 指向 `/focus` 或其他扁平路由。数据模型、`AppContext` 和 localStorage 数据保持不变。

**范围**：创建 11 个文件，修改 9 个文件，删除 14 个文件。

## 当前状态分析

**存在的内容**：6 个路由（`/`、`/ideas`、`/mves`、`/papers`、`/areas`，加上 `/idea/[id]`、`/mve/[id]`、`/areas/[id]`）。`ActiveIdeaContext` 使用 `research-compass-active-idea` 键。`nextActionCalculator` 指向动态路由。导航未明确包含 `/focus`。动态路由页面（`IdeaWorkspaceClient`、`MVEResultClient`、`AreaDetailClient`）包含重型编辑表单和复杂组件。旧版 `components/focus/` 目录包含 8 个组件，专为上一个设计迭代设计。

**问题**：动态路由无法可靠打开（静态导出 + basePath 问题）。导航将 `/` 视为焦点工作区，而不是概览。`nextActionCalculator` 指向已删除的动态路由。`ActiveIdeaContext` 导航到 `/` 而不是 `/focus`。操作链接到 `/idea/[id]` 和 `/mve/[id]`，这些在重建后将不再存在。

## 建议的修改

### 1. 路由结构

| 路由 | 页面 | 文件 | 操作 |
|------|------|------|------|
| `/` | 仪表盘 | `app/page.tsx` | 重写 |
| `/focus` | 焦点工作区 | `app/focus/page.tsx` | 创建 |
| `/ideas` | 想法选择 | `app/ideas/page.tsx` | 重写 |
| `/mves` | MVE 历史 | `app/mves/page.tsx` | 重写 |
| `/papers` | 论文信号流 | `app/papers/page.tsx` | 重写 |
| `/areas` | 研究领域地图 | `app/areas/page.tsx` | 重写 |

### 2. 删除动态路由（6 个文件）

- `app/idea/[id]/page.tsx` + `IdeaWorkspaceClient.tsx`
- `app/mve/[id]/page.tsx` + `MVEResultClient.tsx`
- `app/areas/[id]/page.tsx` + `AreaDetailClient.tsx`

### 3. 删除旧的焦点组件（8 个文件）

删除整个 `components/focus/` 目录。替换为新组件。

### 4. 修改 `context/ActiveIdeaContext.tsx`

- 将 `STORAGE_KEY` 重命名为 `'research-compass-active-focus-idea-id'`
- 添加从旧键的迁移回退（`'research-compass-active-idea'`）
- 将 `setActiveIdea` 导航目标从 `'/'` 更改为 `'/focus'`
- 修复 basePath 处理：`window.location.href` 必须包含 `basePath`

### 5. 修改 `lib/nextActionCalculator.ts`

所有 `actionPath` 值从 `/idea/${idea.id}` 和 `/mve/${mve.id}` 更改为 `/focus` 或其他扁平路由。例外：`/papers` 和 `/ideas` 保持不变。

### 6. 修改导航栏

新项目：
```typescript
const navItems = [
  { href: '/', label: '概览', icon: LayoutDashboard },
  { href: '/focus', label: '聚焦', icon: Target, primary: true },
  { href: '/ideas', label: '选择方向', icon: Lightbulb },
  { href: '/papers', label: '论文', icon: FileText },
  { href: '/mves', label: '验证记录', icon: FlaskConical },
  { href: '/areas', label: '子领域', icon: LayoutGrid, iconOnly: true },
];
```

### 7. 创建 `/focus` 页面 (`app/focus/page.tsx`)

焦点工作区是核心页面。`'use client'`。wrapped in `<Suspense>`。

**无活跃想法时**：
- 空状态：“选择一个研究方向进入聚焦模式”
- 主按钮：“选择方向” -> `/ideas`

**有活跃想法时**：
- Zone A: `FocusIdeaCard` -- 标题、研究问题、假设、状态标签、分数（存活/置信/证伪）
- Zone B: `NextActionCard` -- 单个突出显示的推荐操作（标签、描述、hero 按钮）
- Zone C: `EvidencePressurePanel` -- 支持/反对/缺失证据（每列最多 3 项）
- Zone D: `MVEGateCard` -- MVE 管线时间线（无详情链接）

### 8. 重写仪表盘 (`app/page.tsx`)

- 顶部：标题 + 产品描述
- 主状态卡片：当前焦点想法概要 + “进入焦点工作区”按钮
- 次要卡片：最近信号、待处理 MVE、最有前途想法、最高风险想法
- 紧凑、无长列表、无编辑表单

### 9. 重写想法 (`app/ideas/page.tsx`)

- 过滤器：状态、搜索，加上 `?areaId=xxx` 查询参数支持
- `IdeaSelectionCard`：标题、假设（1 行）、分数、状态、MVE 计数、证据计数
- “进入聚焦模式”按钮（焦点变体）-> 调用 `setActiveIdea(id)` -> 导航到 `/focus`
- 悬挂在一个单独的 `IdeasContent` 组件中，使用 `<Suspense>`

### 10. 重写 MVEs (`app/mves/page.tsx`)

- 过滤器：状态、MVE 类型，加上 `?ideaId=xxx` 查询参数支持
- `MVEHistoryCard`：目标、关联想法标题、MVE 类型、状态、成功标准、失败模式摘要、日期
- “在焦点中打开”按钮 -> 设置活动想法 + 导航到 `/focus`
- 无详情页链接

### 11. 重写论文 (`app/papers/page.tsx`)

- `PaperSignalCard`：标题、作者、场所、阅读状态、判断、1 句摘要
- 操作按钮：编辑、生成想法、提取假设、提取空白
- “生成想法”调用 `createIdeaFromPaper` 然后 `setActiveIdea` -> 导航到 `/focus`
- 当前焦点想法的关联论文过滤器（可选切换）

### 12. 重写领域 (`app/areas/page.tsx`)

- 按类别分组：感知、学习、控制、前沿、其他
- `AreaMapCard`：名称、描述、关键词、关联想法/论文/MVE 计数
- “按领域过滤想法” -> 导航到 `/ideas?areaId=xxx`
- 无详情页链接

### 13. 新组件规格

| 组件 | 文件 | 键职责 |
|------|------|---------|
| `AppShell` | `components/AppShell.tsx` | 布局包装器 (Navbar + main) |
| `FocusIdeaCard` | `components/focus/FocusIdeaCard.tsx` | 活跃想法横幅：标题、假设、状态、区域标签 |
| `ScoreMeter` | `components/focus/ScoreMeter.tsx` | 3 个圆形 SVG 分数（存活/置信/证伪）+ 统计行 |
| `NextActionCard` | `components/focus/NextActionCard.tsx` | 突出显示的推荐操作卡片 + hero 按钮 -> `/focus` |
| `EvidencePressurePanel` | `components/focus/EvidencePressurePanel.tsx` | 支持/反对/缺失证据计数 + 最新条目 |
| `MVEGateCard` | `components/focus/MVEGateCard.tsx` | MVE 时间线（不可点击），失败显示失败原因 |
| `IdeaSelectionCard` | `components/idea/IdeaSelectionCard.tsx` | 想法列表卡片 + 焦点按钮 |
| `MVEHistoryCard` | `components/mve/MVEHistoryCard.tsx` | MVE 时间线条目（不可点击到详情） |
| `PaperSignalCard` | `components/paper/PaperSignalCard.tsx` | 论文卡片 + 信号操作按钮 |
| `AreaMapCard` | `components/area/AreaMapCard.tsx` | 领域网格卡片 -> 链接到 `/ideas?areaId=xxx` |

## 假设与决策

1. **basePath 处理**：`window.location.href` 必须使用完整路径（`/Research-Compass-for-Robotics/focus`）。Next.js 的 `router.push` 和 `<Link>` 会自动添加 basePath。
2. **存储迁移**：`ActiveIdeaContext` 将尝试从旧键读取并迁移到新键。
3. **所有操作路径指向 /focus**：NextActionCard 的 hero 按钮将用户保持在焦点页面。如果他们已经在 `/focus` 上，则不会触发页面导航（或滚动到相关部分）。
4. **无内联编辑**：焦点页面在初始重建中是只读的 + 操作执行。内联编辑推迟到后续迭代。
5. **查询参数路由**：`/ideas?areaId=xxx` 和 `/mves?ideaId=xxx` 需要页面组件中的 `<Suspense>` 边界，以避免静态导出水合不匹配。
6. **`/papers` 中的中文 UI**：现有的中文标签（“Paper Library”等）将被更新为中文。

## 实施顺序

1. **基础**：修改 `ActiveIdeaContext`（键 + 导航 + 迁移），修改 `nextActionCalculator`（操作路径）
2. **删除**：删除动态路由目录（6 个文件），删除旧的 `components/focus/`（8 个文件）
3. **导航**：修改 `Navbar.tsx`
4. **组件**：创建 10 个组件（AppShell, FocusIdeaCard, ScoreMeter, NextActionCard, EvidencePressurePanel, MVEGateCard, IdeaSelectionCard, MVEHistoryCard, PaperSignalCard, AreaMapCard）
5. **页面**：创建 `/focus`，重写 `/`, `/ideas`, `/mves`, `/papers`, `/areas`
6. **模态框**：更新 `CreateIdeaModal` 后创建导航
7. **验证**：`npm run build`，检查所有 6 个路由在静态导出中打开

## 验证步骤

1. 构建成功：`npm run build` 通过且无错误
2. 所有 6 个路由以 `/Research-Compass-for-Robotics/` 前缀打开
3. 导航栏链接正确高亮并导航
4. 在 `/ideas` 上选择一个想法 -> 导航到 `/focus` 并显示该想法
5. `/focus` 当没有活跃想法时显示空状态
6. `/mves` 可以通过焦点按钮设置关联想法为活跃
7. `/papers` 可以在不破坏页面的情况下创建想法
8. `/areas` 领域卡片链接到 `/ideas?areaId=xxx`
9. 没有页面依赖动态路由参数
10. 没有悬空引用已删除的动态路由
