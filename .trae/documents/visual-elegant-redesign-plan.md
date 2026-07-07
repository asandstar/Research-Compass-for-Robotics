# Research Compass for Robotics -- 视觉优雅重设计方案

## 概述

在现有代码架构（6 个路由、组件结构、功能逻辑）完全不变的前提下，对项目进行全面视觉升级。设计方向参考 Linear / Vercel Dashboard 的精致 SaaS 风格：微妙阴影、语义化边框、统一的 teal accent 体系、精致的排版节奏、流畅的微动效。

---

## 当前问题诊断

| 编号 | 问题 | 涉及文件 |
|------|------|----------|
| P1 | 字体声明不一致 -- tailwind config 写 InstrumentSans，实际加载 Inter | `tailwind.config.js`, `globals.css` |
| P2 | Input/Select 用 indigo focus ring，与 teal accent 主题冲突 | `Input.tsx`, `Select.tsx` |
| P3 | layout.tsx body 用 `bg-gray-50` (#f9fafb) 而非主题色 `bg` (#fafaf9) | `layout.tsx` |
| P4 | Card 组件过于扁平 -- 白底+细边框，无阴影层次 | `Card.tsx` |
| P5 | Navbar 无品牌感 -- 纯白+灰边框，无 Logo | `Navbar.tsx` |
| P6 | 所有页面 Header 千篇一律 | 6 个页面文件 |
| P7 | 无统一的 shadow/depth 系统 -- 到处硬编码 `shadow-md` | 8+ 文件 |
| P8 | globals.css 过于贫瘠 -- 无排版规范、无 CSS 变量 | `globals.css` |
| P9 | Modal 内表单元素用 indigo focus ring | `CreateIdeaModal.tsx`, `AddPaperModal.tsx` |
| P10 | Empty State 简陋 -- 仅灰色图标+文字 | 5 个页面/组件 |
| P11 | Timeline 线条视觉平淡 | `MVEGateCard.tsx`, `mves/page.tsx` |
| P12 | Papers 页残留 indigo 颜色 | `papers/page.tsx`, `AnalysisResultModal.tsx` |

---

## 实施方案

### Phase 1: 基础设施层（必须先完成，后续所有改动依赖此阶段）

#### 1.1 `tailwind.config.js` -- 主题 Token 扩展

**改动要点：**
- fontFamily.sans: `InstrumentSans` -> `Inter`（修复字体不一致）
- 新增语义色: `surface: '#ffffff'`, `border-subtle: 'rgba(0,0,0,0.06)'`, `border-default: 'rgba(0,0,0,0.09)'`, `border-strong: 'rgba(0,0,0,0.15)'`, `accent-hover: '#0f766e'`
- 新增 shadow 系统: `card`(微弱), `card-hover`(hover), `elevated`(弹出层), `navbar`(底部细线)
- 新增 type scale: `display`(30px), `h1`(24px), `h2`(18px), `h3`(16px), `body`(15px), `caption`(13px), `label`(12px)
- 新增 transition duration `fast: 150ms`

#### 1.2 `app/globals.css` -- 全局样式重写

**改动要点：**
- Google Fonts import 更新为完整 weight range
- 新增 `-webkit-font-smoothing: antialiased`
- 新增 h1-h4 全局排版规范
- 新增 `::selection` 颜色为 teal tint
- 新增自定义滚动条样式（细+圆角+低对比）
- 新增 utility class: `.page-header`, `.page-title`, `.page-subtitle`, `.card-interactive`, `.stat-number`, `.empty-state-icon`, `.timeline-line`, `.timeline-node`
- 新增 Modal 动画: `fadeIn` (overlay), `slideUp` (content)
- 新增 focus-visible 全局 teal ring

#### 1.3 `app/layout.tsx` -- Body 背景色修复

- body: `bg-gray-50` -> `bg-bg`

---

### Phase 2: 核心 UI 组件（依赖 Phase 1 的新 Token）

#### 2.1 `components/ui/Card.tsx`

- bg: `bg-white` -> `bg-surface`
- border: `border-rule` -> `border-border-subtle`
- 新增默认 `shadow-card`
- 新增 `interactive` prop: true 时添加 `card-interactive` class（含 hover shadow 效果 + cursor-pointer）
- 移除各页面中内联的 `hover:shadow-md transition-shadow cursor-pointer`，改用 `interactive` prop

#### 2.2 `components/ui/Input.tsx`

- border: `border-gray-300` -> `border-border-default`
- focus: `focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500` -> `focus:border-accent focus:ring-1 focus:ring-accent/30`
- bg: `bg-white` -> `bg-surface`
- 新增 `placeholder:text-muted/60`
- transition: `transition-colors` -> `transition-fast transition-colors`
- disabled bg: `disabled:bg-gray-100` -> `disabled:bg-bg2`

#### 2.3 `components/ui/Select.tsx`

- trigger: `border-gray-300` -> `border-border-default`, `bg-white` -> `bg-surface`
- trigger focus: `focus:ring-2 focus:ring-indigo-500` -> `focus:ring-1 focus:ring-accent/30 focus:border-accent`
- hover: `hover:border-gray-400` -> `hover:border-border-strong`
- dropdown: `border-gray-200 shadow-lg` -> `border-border-subtle shadow-elevated`
- option hover: `hover:bg-indigo-50` -> `hover:bg-accent/[0.06]`
- option selected: `bg-indigo-50 text-indigo-700` -> `bg-accent/10 text-accent`

#### 2.4 `components/ui/Textarea.tsx`

- border: `border-rule` -> `border-border-default`
- bg: `bg-bg` -> `bg-surface`
- focus ring 微调为 `focus:ring-accent/30`

#### 2.5 `components/ui/Button.tsx`

- transition: `transition-colors duration-200` -> `transition-fast transition-colors`
- primary/hero hover: `hover:bg-[#0f766e]` -> `hover:bg-accent-hover`
- hero shadow: `shadow-md` -> `shadow-card`
- ghost: `hover:bg-gray-100` -> `hover:bg-bg2`, `hover:text-gray-700` -> `hover:text-ink`
- secondary: `hover:bg-[#e7e5e4]` -> `hover:bg-rule`

#### 2.6 `components/ui/Tag.tsx`

- secondary: `bg-gray-100 text-gray-600` -> `bg-bg2 text-muted`
- 默认圆角改为 `rounded-full`（更精致）

---

### Phase 3: 导航品牌层（依赖 Phase 1）

#### 3.1 `components/Navbar.tsx` -- 完整重写

**设计方向：Linear/Vercel 风格顶栏**

- 新增品牌 Logo 区域: teal 方块 + Compass 图标 + "Research Compass" 文字
- 新增 Logo 与导航项之间的竖线分隔符
- 背景: `bg-white border-b border-gray-200` -> `bg-surface/80 backdrop-blur-md border-b border-border-subtle shadow-navbar`
  - 半透明 + backdrop-blur，滚动时玻璃效果
- 非激活态: `text-gray-600` -> `text-muted`, hover -> `text-ink hover:bg-bg2`
- 激活态: 统一为 `text-accent bg-accent/10`（移除 primary 的实心背景）
- 新增 active indicator: 底部小圆点 `w-1 h-1 rounded-full bg-accent`（Linear 风格）
- 图标尺寸: `w-4 h-4` -> `w-[18px] h-[18px]`
- 字号: `text-sm` -> `text-[13px]`
- padding: `py-2` -> `py-1.5`（更紧凑）
- 添加 `@supports` fallback for Safari backdrop-filter

---

### Phase 4: 页面级改动（依赖 Phase 1-2，可并行）

#### 4.1 `app/page.tsx` (Dashboard)

- Header: 包裹 `.page-header`，标题用 `.page-title` + `text-[1.75rem] tracking-tight`（首页稍大）
- Stats Cards: 图标放入 `w-8 h-8 rounded-lg bg-{color}/10` 彩色方块背景，数字用 `.stat-number`，label 用 `text-caption`
- Quick Nav Cards: `hover:shadow-md transition-shadow cursor-pointer` -> `<Card interactive>`

#### 4.2 `app/ideas/page.tsx`

- Header: `text-2xl font-bold` -> `.page-title`, `text-muted mt-1` -> `.page-subtitle`
- Empty State: 图标 `text-gray-300` -> `text-muted/40`，容器 `p-8` -> `py-16 px-8`

#### 4.3 `app/papers/page.tsx`

- Header + Stats: 同 Dashboard 模式
- Empty State: 同上模式
- 清理残留 indigo: `bg-indigo-50` -> `bg-accent/[0.06]`, `text-indigo-700` -> `text-accent`
- Filter 区: Input 已由 Phase 2 自动修复

#### 4.4 `app/mves/page.tsx`

- Header + Stats: 同 Dashboard 模式
- Empty State: 同上模式
- Timeline 线: `w-0.5 bg-gray-200` -> `timeline-line`（渐变线）

#### 4.5 `app/areas/page.tsx`

- Header: 同上模式
- Empty State: 同上模式
- Modal 表单: 所有 `focus:ring-2 focus:ring-accent` -> `focus:ring-1 focus:ring-accent/30`

---

### Phase 5: Modal 修复（依赖 Phase 1，可与 Phase 4 并行）

#### 5.1 `components/idea/CreateIdeaModal.tsx`

- 所有 input/textarea: `focus:ring-indigo-500` -> `focus:ring-accent focus:ring-1 focus:ring-accent/30`
- 所有 input/textarea: `border-gray-300` -> `border-border-default`
- Modal overlay: `bg-black/50` -> `bg-black/40 backdrop-blur-[2px] modal-overlay`
- Modal content: 新增 `modal-content` class
- 边框/文字色: `border-gray-100` -> `border-border-subtle`, `text-gray-700` -> `text-ink`

#### 5.2 `components/paper/AddPaperModal.tsx`

- 同 CreateIdeaModal 的所有 indigo->accent 替换
- 额外: `text-indigo-600` (AI 按钮) -> `text-accent`
- 额外: `bg-indigo-50 border-indigo-300 text-indigo-700` (area toggle) -> `bg-accent/10 border-accent/30 text-accent`
- 20+ 个表单元素全部替换

#### 5.3 `components/paper/AnalysisResultModal.tsx`

- `text-indigo-600/500` -> `text-accent`
- `bg-indigo-50` -> `bg-accent/[0.06]`
- Modal overlay/content 添加动画

---

### Phase 6: 业务组件微调（依赖 Phase 1，可与 Phase 4-5 并行）

#### 6.1 `components/focus/NextActionCard.tsx`
- `shadow-md` -> `shadow-card`, `!bg-[#f0fdfa]` -> `bg-accent/[0.04]`

#### 6.2 `components/focus/ScoreMeter.tsx`
- Gauge stroke-width: `5` -> `4`（更精致）
- 底部文字: `text-xs` -> `text-label`

#### 6.3 `components/focus/MVEGateCard.tsx`
- Timeline 线: `w-0.5 bg-gray-200` -> `timeline-line`

#### 6.4 `components/mve/MVEHistoryCard.tsx`
- Timeline node: `ring-4 ring-white` -> `ring-4 ring-bg`
- 新增 `timeline-node` class

#### 6.5 `components/idea/IdeaSelectionCard.tsx`
- Score pills: `bg-gray-100` -> `bg-bg2`

#### 6.6 `components/area/AreaMapCard.tsx`
- 内联 hover: `hover:shadow-md transition-shadow cursor-pointer` -> `<Card interactive>`
- 日期: `text-gray-400` -> `text-muted/60`

#### 6.7 `components/focus/EvidencePressurePanel.tsx`
- transition: `transition-colors` -> `transition-fast transition-colors`

---

## 完整修改文件清单（共 25 个文件）

| 阶段 | 文件 | 改动量级 |
|------|------|---------|
| 1 | `tailwind.config.js` | 中 |
| 1 | `app/globals.css` | 大 |
| 1 | `app/layout.tsx` | 小 |
| 2 | `components/ui/Card.tsx` | 中 |
| 2 | `components/ui/Input.tsx` | 小 |
| 2 | `components/ui/Select.tsx` | 中 |
| 2 | `components/ui/Textarea.tsx` | 小 |
| 2 | `components/ui/Button.tsx` | 小 |
| 2 | `components/ui/Tag.tsx` | 小 |
| 3 | `components/Navbar.tsx` | 大 |
| 4 | `app/page.tsx` | 中 |
| 4 | `app/ideas/page.tsx` | 小 |
| 4 | `app/papers/page.tsx` | 大 |
| 4 | `app/mves/page.tsx` | 中 |
| 4 | `app/areas/page.tsx` | 中 |
| 5 | `components/idea/CreateIdeaModal.tsx` | 中 |
| 5 | `components/paper/AddPaperModal.tsx` | 大 |
| 5 | `components/paper/AnalysisResultModal.tsx` | 中 |
| 6 | `components/focus/NextActionCard.tsx` | 小 |
| 6 | `components/focus/ScoreMeter.tsx` | 小 |
| 6 | `components/focus/MVEGateCard.tsx` | 小 |
| 6 | `components/mve/MVEHistoryCard.tsx` | 小 |
| 6 | `components/idea/IdeaSelectionCard.tsx` | 小 |
| 6 | `components/area/AreaMapCard.tsx` | 小 |
| 6 | `components/focus/EvidencePressurePanel.tsx` | 小 |

---

## 验证步骤

1. 全局搜索 `indigo` 确认无残留
2. 全局搜索 `gray-200`、`gray-300`、`gray-100` 确认 border 和 background 已语义化替换
3. 全局搜索 `InstrumentSans` 确认已替换为 `Inter`
4. 启动静态服务器 (`node .trae/scripts/serve-static.js`)，逐一检查 6 个页面
5. 检查 Navbar 在滚动时的 backdrop-blur 效果
6. 检查 Modal 打开/关闭动画
7. 检查 Card hover 效果
8. 检查 Input/Select 的 focus 状态
9. 检查 Empty States 视觉
10. 检查移动端响应式是否正常

## 风险与注意事项

- `backdrop-blur` 在旧版 Safari 需前缀，将在 globals.css 添加 `@supports` fallback
- Card 新增 `interactive` prop 向后兼容 -- 现有 className 中有内联 hover 的地方需清理
- 所有改动均为 CSS/Tailwind 级别，不涉及服务端功能，完全兼容 `output: 'export'`
