# 暗黑模式字体修复 + 导航栏冗余修复计划

## 摘要

修复两个问题：
1. **暗黑模式字体颜色全面修复** - 大量 `text-ink` 和 `text-muted` 缺少 dark 变体，导致暗色背景下文字看不清
2. **导航栏重复"聚焦"** - activeIdea 标题和"聚焦"导航项都指向 `/focus`，造成视觉冗余

---

## 问题分析

### 1. 暗黑模式字体问题
当前项目使用自定义颜色变量 `text-ink`（#292524）和 `text-muted`（#78716c），在浅色模式下正常，但在暗黑模式下：
- `text-ink`（深灰色 #292524）在暗色背景（#1c1917）上几乎看不见
- `text-muted`（灰色 #78716c）在暗色背景上对比度不足

**已定义但未充分使用的 dark 颜色**：
- `dark.ink` = `#e7e5e4`（浅灰色，适合暗色背景上的正文）
- `dark.muted` = `#a8a29e`（中灰色，适合暗色背景上的辅助文字）

**核心问题**：大量组件只使用了 `text-ink` 和 `text-muted`，没有添加对应的 `dark:text-dark-ink` 和 `dark:text-dark-muted`。

### 2. 导航栏冗余问题
从截图看，导航栏显示：
- `聚焦`（coreNav 中的 Target 图标）
- `基于RT-2: Vision-Language...`（activeIdea 标题，第114-122行）

两者都指向 `/focus`，造成视觉冗余。

---

## 修复方案

### 1. 导航栏冗余修复

**修改文件**：`components/Navbar.tsx`

**方案**：隐藏 activeIdea 标题的显示，保留"聚焦"导航项。因为：
- "聚焦"导航项已经清晰标识了当前状态（有小圆点指示 activeIdea）
- activeIdea 标题过长时会挤压其他导航项

**具体修改**：注释或删除第114-122行的 activeIdea Pill 代码块。

---

### 2. 暗黑模式字体修复

**策略**：为所有 `text-ink` 添加 `dark:text-dark-ink`，为所有 `text-muted` 添加 `dark:text-dark-muted`。

#### 2.1 全局 CSS 修复（最有效方案）
在 `app/globals.css` 中添加全局 dark 样式规则：
```css
.dark .text-ink { color: #e7e5e4; }
.dark .text-muted { color: #a8a29e; }
```

这种方式可以一次性修复所有现有和未来的 `text-ink`/`text-muted` 使用，无需逐个文件修改。

#### 2.2 补充 Tailwind 配置（可选，增强一致性）
在 `tailwind.config.js` 的 `dark` 颜色对象中添加：
```javascript
accent: '#2dd4bf',
'accent-hover': '#14b8a6',
accent2: '#f59e0b',
```

---

### 3. 证据压力卡片背景色优化

**问题**：从截图看，证据压力卡片中的绿色/红色/琥珀色背景块在暗黑模式下过于刺眼，文字也看不清。

**修改文件**：`components/focus/EvidencePressureGauge.tsx`

**方案**：将 `dark:bg-green-950/30` 改为更深的背景，并调整文字颜色对比度：
- `bg-green-50 dark:bg-green-950/20`（降低不透明度）
- `text-green-700 dark:text-green-400` → `text-green-700 dark:text-green-300`（提高文字亮度）

---

### 4. 组件级别修复（补充全局 CSS 未覆盖的情况）

以下组件使用了特殊的颜色组合，需要单独检查：

| 文件 | 问题 | 修复方案 |
|---|---|---|
| `components/intelligence/PaperIntelligenceCard.tsx` | 卡片内文字颜色 | 确保 `text-ink` 有 dark 变体 |
| `components/workflows/PromptTemplateCard.tsx` | 代码块背景和文字 | 添加 dark 变体 |
| `components/idea/IdeaSelectionCard.tsx` | 卡片标题和描述 | 添加 dark 变体 |
| `components/paper/PaperSignalCard.tsx` | 卡片标题 | 添加 dark 变体 |
| `components/area/AreaMapCard.tsx` | 卡片标题和描述 | 添加 dark 变体 |
| `components/workflows/WorkflowCard.tsx` | 步骤编号背景 | 添加 dark 变体 |
| `components/idea/CreateIdeaModal.tsx` | 表单标签 | 添加 dark 变体 |
| `components/paper/AddPaperModal.tsx` | 表单标签 | 添加 dark 变体 |
| `components/CommandPalette.tsx` | 搜索框和结果 | 添加 dark 变体 |

---

## 实施步骤

### 步骤 1：全局 CSS 修复（优先级最高）
修改 `app/globals.css`，在 `.dark` 样式块中添加：
```css
.dark .text-ink { color: #e7e5e4; }
.dark .text-muted { color: #a8a29e; }
.dark .text-accent { color: #2dd4bf; }
.dark .text-accent-hover { color: #14b8a6; }
```

### 步骤 2：导航栏冗余修复
修改 `components/Navbar.tsx`，删除 activeIdea Pill（第114-122行）。

### 步骤 3：证据压力卡片优化
修改 `components/focus/EvidencePressureGauge.tsx`，调整背景色和文字色。

### 步骤 4：Tailwind 配置增强
修改 `tailwind.config.js`，补充 dark 模式的 accent 颜色。

### 步骤 5：组件级别补充修复
检查并修复上述列出的组件中全局 CSS 未覆盖的特殊情况。

---

## 验证步骤

1. **暗黑模式切换测试**：
   - 打开任意页面，切换到暗黑模式
   - 检查所有文字是否清晰可读
   - 检查卡片背景色是否和谐

2. **导航栏检查**：
   - 确认只有一个"聚焦"入口
   - 确认 activeIdea 状态通过导航项的小圆点正确显示

3. **构建验证**：
   - `npm run build` 确保无错误

---

## 风险评估

- **全局 CSS 修复**：可能影响现有手动添加了 dark 变体的组件，但不会破坏功能，只是可能产生重复样式（无害）
- **导航栏修改**：删除 activeIdea Pill 后，用户仍可通过"聚焦"导航项访问聚焦页面，功能不受影响
