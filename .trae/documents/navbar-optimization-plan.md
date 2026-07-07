# 导航栏优化方案

## 概述

基于用户反馈，对导航栏进行三方面优化：视觉精致度提升、布局/交互优化、功能增强。保持现有的 teal accent 主题和 Design Token 体系不变。

---

## 当前状态分析

现有 Navbar 已具备：品牌 Logo (Compass icon + 文字)、backdrop-blur 玻璃效果、teal accent 激活态、底部小圆点指示器、shadow-navbar。

**存在的问题：**
1. **视觉**：6 个导航项平铺，缺少层次感；当前聚焦 Idea 无上下文提示；活跃状态指示不够突出
2. **布局**：导航项都在左侧堆叠，右侧完全空白，空间浪费；子领域(iconOnly)被挤在末尾容易被忽略
3. **功能**：没有快捷搜索入口；没有当前聚焦 Idea 的上下文显示；没有面包屑或页面位置提示

---

## 实施方案

### 1. 视觉精致度提升

**文件：** `components/Navbar.tsx`

#### 1.1 当前激活导航项强化

将当前激活态从 `text-accent bg-accent/10`（过于微妙）改为更有存在感的方案：
- 背景增加一层微妙渐变：`bg-gradient-to-b from-accent/10 to-accent/5`
- 底部指示器从小圆点改为 2px 宽的短线：`h-0.5 w-4 rounded-full bg-accent`（底部居中）
- 文字增加 `text-[13.5px]`（激活时字号微调大 0.5px）

#### 1.2 导航分组

将 6 个导航项分为两组，中间加分隔符：
- **核心组**：概览 + 聚焦
- **工作台组**：选择方向 + 论文 + 验证记录
- 子领域保持 iconOnly
- 组间用 `w-px h-4 bg-border-subtle` 分隔

#### 1.3 聚焦项特殊标识

"聚焦" 是核心工作区，当有 activeIdea 时，在导航项右侧显示一个小圆点 badge（amber 色），表示当前有活跃聚焦。需要从 ActiveIdeaContext 读取状态。

### 2. 布局/交互优化

#### 2.1 右侧增加操作区

当前布局是左侧 Logo + 导航项，右侧空白。优化为：

```
[Logo | Divider | 核心导航 | Separator | 工作台导航 | ... |  Spacer  | 搜索 | 当前聚焦提示]
```

- 导航项保持左侧
- 右侧放置：快捷搜索按钮 + 当前聚焦 Idea 缩略提示

#### 2.2 快捷搜索按钮

在导航栏右侧放置一个 `⌘K` 搜索按钮：
- 显示 Search 图标 + "搜索..." placeholder + `⌘K` 快捷键标签
- 点击后打开全局搜索面板（Command Palette 模式）
- 样式：`bg-bg2 border border-border-subtle rounded-lg px-3 py-1.5 text-[13px]`
- 快捷键标签：`bg-surface border border-border-subtle rounded px-1.5 py-0.5 text-[11px] text-muted font-mono`

#### 2.3 当前聚焦 Idea 提示

在搜索按钮左边，显示当前聚焦 Idea 的缩略信息（仅在有 activeIdea 时）：
- 样式：一个小 pill，包含 Target icon + Idea 标题（line-clamp-1, max-w-[200px]）
- 点击跳转到 /focus
- 颜色：`bg-accent/10 text-accent`

### 3. 功能增强

#### 3.1 Command Palette (全局搜索)

**新文件：** `components/Navbar.tsx` 内联 + `components/CommandPalette.tsx`

在 Navbar 中添加 Command Panel 功能：
- 按 `⌘K` 或点击搜索按钮打开
- 浮层覆盖在页面内容上方（类似 Linear/Vercel 的 Command Palette）
- 搜索内容：
  - 导航页面（概览、聚焦、选择方向、论文、验证记录、子领域）
  - 当前 Idea 列表（可快速切换聚焦）
  - 当前 Paper 列表
  - 当前 Area 列表
- 样式：居中弹出的 modal，宽度 `max-w-lg`，带 `shadow-elevated`
- 动画：复用 `modal-overlay` + `modal-content`
- 无匹配结果时显示友好提示

#### 3.2 滚动时导航栏行为优化

当前已经是 `sticky top-0`，保持不变。但增加一个微妙效果：
- 当页面滚动超过 10px 时，导航栏阴影从 `shadow-navbar`（1px）增强为 `shadow-card`（微妙 3D 感）
- 使用 `useEffect` + scroll listener 实现

### 4. 文件改动清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `components/Navbar.tsx` | 重写 | 新布局(左导航+右操作区)、分组、搜索按钮、聚焦提示、Command Panel 触发 |
| `components/CommandPalette.tsx` | 新建 | 全局命令面板组件（搜索+导航+切换Idea） |
| `app/ClientProviders.tsx` | 小改 | 添加 Command Palette provider 或在 Navbar 中内联管理 |
| `app/globals.css` | 小改 | 添加 Command Panel 相关动画样式、滚动阴影过渡 |
| `tailwind.config.js` | 无改动 | 使用现有 token 即可 |

### 5. 详细实现规格

#### `components/Navbar.tsx` 新布局

```
<nav> sticky top-0 z-50 backdrop-blur
  <div> max-w-7xl mx-auto
    <div> flex items-center h-14

      {/* 左侧: Logo + 导航 */}
      <Logo />                    // w-7 h-7 Compass + "Research Compass"
      <Divider />                 // w-px h-5
      <NavGroup>                  // flex gap-1
        <NavItem href="/" />      // 概览
        <NavItem href="/focus" primary /> // 聚焦 (有 activeIdea 时显示 amber badge)
      </NavGroup>
      <Separator />                // w-px h-4 (分组分隔)
      <NavGroup>                  // flex gap-1
        <NavItem href="/ideas" />  // 选择方向
        <NavItem href="/papers" /> // 论文
        <NavItem href="/mves" />  // 验证记录
      </NavGroup>
      <NavItem iconOnly href="/areas" /> // 子领域

      {/* 右侧: 弹性空间 + 操作区 */}
      <div flex-1 />               // spacer

      {/* 当前聚焦提示 (条件渲染) */}
      <FocusPill />               // Target icon + idea title, max-w-[200px]

      {/* 快捷搜索 */}
      <SearchTrigger />           // Search icon + "搜索..." + ⌘K tag

    </div>
  </div>
</nav>
```

#### `components/CommandPalette.tsx`

- Props: `isOpen`, `onClose`
- 从 `useApp()` 获取 ideaCards, papers, researchAreas
- 从 `useActiveIdea()` 获取 activeIdeaId, setActiveIdea
- 搜索逻辑：filter by title/name match
- 分组显示：导航 / Ideas / 论文 / 子领域
- 选中后执行动作（导航到对应页面 / 切换聚焦 Idea）
- `Esc` 或点击 overlay 关闭
- 键盘上下箭头导航，Enter 选中

#### `app/ClientProviders.tsx`

- 在 `<Navbar />` 后面添加 `<CommandPalette />`
- 用一个全局 state (或 context) 管理 isOpen

### 6. 注意事项

- Command Palette 需要监听全局键盘事件 `⌘K` / `Ctrl+K`，在 `useEffect` 中添加/移除 listener
- Command Palette 打开时需要阻止页面滚动 (`overflow: hidden` on body)
- 搜索框需要 `autoFocus`
- 所有改动使用现有 Design Token（不新增 token）
- 保持静态导出兼容（`output: 'export'`）
- 移动端：搜索按钮和聚焦提示在小屏下隐藏或简化

### 7. 验证步骤

1. 启动预览，检查导航栏新布局（分组、间距、右侧操作区）
2. 检查激活态的视觉强化效果
3. 检查聚焦项的 amber badge
4. 点击搜索按钮 / 按 ⌘K 打开 Command Palette
5. 在 Command Palette 中搜索页面名、Idea、Paper
6. 通过 Command Palette 切换聚焦 Idea
7. 滚动页面检查阴影增强效果
8. 检查移动端响应式表现
