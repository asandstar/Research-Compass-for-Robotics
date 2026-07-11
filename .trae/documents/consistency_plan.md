# 项目一致性全面检查修复计划

## 项目概览

这是一个名为 **Research Compass** 的机器人科研方向管理工作台，采用 Next.js 14 + Tailwind CSS 构建。项目包含以下核心功能模块：

| 模块 | 路径 | 功能描述 |
|------|------|----------|
| 概览 | `/` | 仪表盘、统计数据、快捷入口 |
| 聚焦 | `/focus` | 深度工作区、假设管理、证据评估 |
| 方向 | `/ideas` | Idea 列表、创建和管理 |
| 论文 | `/papers` | 论文管理、阅读状态 |
| 验证 | `/mves` | 最小可行实验管理 |
| 工作流 | `/workflows` | 科研流程指导 |
| 学习 | `/learning` | 学习路径 |
| 问题 | `/questions` | 研究问题库 |
| 子领域 | `/areas` | 研究领域地图 |
| 游戏 | `/games` | 科研训练游戏 |

---

## 问题分析

### 一、功能冗余问题

#### 1.1 导航结构混乱

**问题**：导航栏包含三组导航（coreNav、workNav、utilityNav），但分组逻辑不清晰，部分功能重叠。

| 导航组 | 内容 | 问题 |
|--------|------|------|
| coreNav | 概览、聚焦 | OK |
| workNav | 选择方向、论文、验证记录、工作流、学习路径 | 与 utilityNav 有重叠 |
| utilityNav | 子领域、研究问题、论文智识、科研游戏 | 图标形式不易识别 |

**影响**：用户难以快速找到所需功能，学习成本高。

#### 1.2 Dashboard 信息过载

**问题**：首页包含了过多信息板块：
- Hero Section（宣传语）
- Active Focus Card（活跃聚焦）
- Core Capabilities（三大能力）
- Stats（四个统计数字）
- Subfield Overview（子领域概览）
- Recent Papers（最近论文）
- Active Ideas（活跃 Ideas）
- Quick Start Guide（快速开始）
- Pending MVEs（待验证实验）
- Data Export（数据导出）

**影响**：用户进入首页时信息太多，难以聚焦核心任务。

#### 1.3 页面功能重叠

**问题**：
- `/focus` 和 `/ideas` 在展示 Idea 信息上有重叠
- Dashboard 的"活跃 Ideas"与 `/ideas` 页面功能重复

---

### 二、样式一致性问题

#### 2.1 硬编码颜色（严重）

大量组件使用了 Tailwind 的 `text-gray-*` 和 `bg-gray-*` 系列颜色，而非项目自定义的主题变量：

| 文件 | 硬编码颜色 | 影响 |
|------|-----------|------|
| `PaperCard.tsx` | `text-gray-900`, `text-gray-500`, `text-gray-700`, `border-gray-50`, `border-gray-100` | 暗黑模式下不可读 |
| `IdeaCardMini.tsx` | `text-gray-800`, `text-gray-500`, `bg-gray-200` | 暗黑模式下不可读 |
| `ObservationCard.tsx` | `text-gray-800`, `text-gray-500` | 暗黑模式下不可读 |
| `EvidenceList.tsx` | `text-gray-500`, `text-gray-700`, `bg-white/50` | 暗黑模式下不可读 |
| `AppShell.tsx` | `bg-bg` | 没有暗黑模式 |

#### 2.2 基础组件缺少暗黑模式

| 文件 | 问题 |
|------|------|
| `Textarea.tsx` | 标签和文本框缺少 `dark:` 样式 |
| `Select.tsx` | 下拉框背景、边框、文字缺少 `dark:` 样式 |
| `Tag.tsx` | secondary 变体缺少 `dark:bg-dark-bg2` |
| `EmptyState.tsx` | 图标背景缺少 `dark:bg-dark-bg2` |

#### 2.3 组件 hover 状态不一致

**问题**：不同组件的 hover 效果使用了不同的模式：

| 组件 | Hover 样式 |
|------|-----------|
| Card（hoverable） | `hover:-translate-y-0.5 hover:shadow-md` |
| NavLink | `hover:bg-bg2 hover:text-ink` |
| PaperCard（compact） | 无 hover 效果 |
| IdeaCardMini | `hover:border-accent/40 hover:shadow-card-hover` |

---

### 三、排版布局风格问题

#### 3.1 页面标题模式不统一

**问题**：不同页面使用不同的标题模式：

| 页面 | 标题方式 |
|------|---------|
| Dashboard | 无统一标题，直接内容 |
| Focus | 使用 Card + h3 |
| Ideas | 使用 `page-header` 模式 |
| Papers | 使用 `page-header` 模式 |
| MVEs | 使用 `page-header` 模式 |

#### 3.2 卡片头部设计不统一

**问题**：包含列表的卡片头部设计不一致：

| 组件 | 头部样式 |
|------|---------|
| Dashboard 子领域概览 | 左侧图标+标题，右侧"查看全部"链接 |
| Dashboard 最近论文 | 左侧图标+标题，右侧"查看全部"链接 |
| Dashboard 活跃 Ideas | 左侧图标+标题，右侧"全部"链接 |
| Focus MVEGateCard | 左侧图标+标题，右侧条件性按钮 |

#### 3.3 间距系统不一致

**问题**：页面内组件间距使用不一致：

| 页面/组件 | 间距 |
|-----------|------|
| Dashboard | `space-y-6` |
| Focus | `space-y-6` |
| Ideas | `space-y-4` |
| Papers | `space-y-4` |

---

## 修复方案

### 第一步：功能结构优化

#### 1.1 重构导航结构

**目标**：简化导航，减少认知负担

**方案**：
- 将导航分为三层：核心导航、工作导航、工具导航
- 使用图标 + 文字的方式，确保移动端也清晰可见
- 删除重复的导航项

#### 1.2 精简 Dashboard

**目标**：突出核心功能，减少信息过载

**方案**：
- 保留：Hero、Active Focus、核心能力卡片、统计数字
- 合并：子领域概览和活跃 Ideas 合并为一个区域
- 移除：最近论文（可在论文页面查看）、快速开始（改为首次使用引导）
- 移动：待验证实验提醒、数据导出到侧边栏

#### 1.3 消除页面功能重叠

**方案**：
- Dashboard 的"活跃 Ideas"只显示状态和快速切换，详情引导到 `/ideas`
- `/focus` 页面专注于当前聚焦的 Idea 深度管理

---

### 第二步：样式一致性修复

#### 2.1 替换硬编码颜色

**规则**：
- `text-gray-900` → `text-ink dark:text-dark-ink`
- `text-gray-800` → `text-ink dark:text-dark-ink`
- `text-gray-700` → `text-ink dark:text-dark-ink`
- `text-gray-600` → `text-ink dark:text-dark-ink`
- `text-gray-500` → `text-muted`
- `text-gray-400` → `text-muted/70`
- `bg-gray-200` → `bg-rule dark:bg-dark-rule`
- `bg-gray-100` → `bg-bg2 dark:bg-dark-bg2`
- `bg-gray-50` → `bg-bg2/50 dark:bg-dark-bg2/50`
- `border-gray-50` → `border-border-subtle`
- `border-gray-100` → `border-border-subtle dark:border-dark-border-subtle`
- `bg-white/50` → `bg-surface/50 dark:bg-dark-surface/50`

**涉及文件**：
- `PaperCard.tsx`
- `IdeaCardMini.tsx`
- `ObservationCard.tsx`
- `EvidenceList.tsx`
- `AppShell.tsx`

#### 2.2 补充基础组件暗黑模式

**涉及文件**：
- `Textarea.tsx`：添加 `dark:text-dark-ink`, `dark:bg-dark-surface`, `dark:border-dark-border-default`
- `Select.tsx`：添加 `dark:bg-dark-surface`, `dark:border-dark-border-subtle`, `dark:text-dark-ink`, `dark:hover:bg-dark-bg2`
- `Tag.tsx`：secondary 变体添加 `dark:bg-dark-bg2`
- `EmptyState.tsx`：图标背景添加 `dark:bg-dark-bg2`

#### 2.3 统一 hover 状态

**方案**：
- 卡片类组件：统一使用 `hover:border-accent/40 hover:shadow-card-hover`
- 按钮类组件：统一使用 `hover:bg-accent/[0.06] hover:text-accent`
- 列表项：统一使用 `hover:bg-bg2/50`

---

### 第三步：排版布局风格统一

#### 3.1 统一页面标题模式

**方案**：所有页面使用标准的 `page-header` 模式：

```tsx
<div className="page-header">
  <h1 className="page-title">页面标题</h1>
  <p className="page-subtitle">页面描述</p>
</div>
```

#### 3.2 统一卡片头部设计

**方案**：列表类卡片使用统一的头部模式：

```tsx
<div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-accent" />
    <h2 className="font-semibold text-ink text-sm">卡片标题</h2>
  </div>
  <Link href="/path" className="text-caption text-muted hover:text-accent transition-fast">
    查看全部 <ChevronRight className="w-3 h-3" />
  </Link>
</div>
```

#### 3.3 统一间距系统

**方案**：
- 页面级间距统一使用 `space-y-6`
- 卡片内间距统一使用 `p-5`
- 表单元素间距统一使用 `space-y-4`

---

## 实施步骤

### 第一阶段：基础样式修复（优先级高）

1. 替换所有硬编码颜色为主题变量
2. 补充基础组件的暗黑模式样式
3. 修复 AppShell 的背景色

### 第二阶段：布局风格统一（优先级中）

1. 统一页面标题模式
2. 统一卡片头部设计
3. 统一间距系统

### 第三阶段：功能结构优化（优先级中）

1. 重构导航结构
2. 精简 Dashboard
3. 消除页面功能重叠

### 第四阶段：细节打磨（优先级低）

1. 统一 hover 状态
2. 优化移动端体验
3. 完善过渡动画

---

## 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 样式修改影响全局 | 中 | 先修改核心组件，逐步扩展 |
| 导航结构变更影响用户习惯 | 低 | 保持核心导航位置不变 |
| Dashboard 精简影响信息获取 | 低 | 保留核心信息，提供快捷跳转 |

---

## 预期效果

修复后，产品将具备以下特点：

1. **视觉一致性**：所有页面使用统一的设计语言
2. **功能清晰**：导航结构清晰，用户能快速找到所需功能
3. **专业感**：排版布局规范，符合产品级标准
4. **完整的暗黑模式**：所有组件在暗黑模式下正常显示
5. **响应式**：移动端和桌面端体验一致