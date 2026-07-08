# 静态内容页面扩展计划 v1（低风险版本）

## 计划摘要

在 `feature/ai-research-workflows` 分支上，为 Research Compass 新增 **3 个纯静态内容页面**，不引入任何 Context、不修改任何业务逻辑文件、不接入 AI API、不做任何自动化。仅新增静态数据文件 + 展示组件 + 页面 + 导航入口。

**核心约束**（来自用户明确要求）：
- 不修改 `AppContext.tsx`、`storage.ts`、`types.ts`、`mockAI.ts`
- 不实现 WorkflowContext / LearningContext / workflow executor / CitationGraph
- 不接入真实 AI API，不做自动生成/提取/执行
- 不删除任何现有文件，不大规模重构
- 复用现有 Button / Card / Tag / Input / Select 组件
- 保持当前视觉风格
- 保证 `npm run build` 通过

---

## 一、当前状态分析（Phase 1 探索结论）

### 1.1 技术栈
- Next.js 14.2.3 (App Router, `output: 'export'`, `basePath: '/Research-Compass-for-Robotics'`, `trailingSlash: true`)
- React 18 + TypeScript 5 + Tailwind 3.4.3 + lucide-react 0.378.0
- **无路径别名**，所有导入使用相对路径（如 `../../components/ui/Button`）
- 无 clsx / classnames / headlessui / shadcn 等额外 UI 库

### 1.2 现有路由（6 个页面）
- `/` (Dashboard) `/focus` `/ideas` `/papers` `/mves` `/areas`
- 全部为 `'use client'` 组件，依赖 `useApp()` 和 `useActiveIdea()`

### 1.3 Navbar 结构（`components/Navbar.tsx`）
- 三个独立数组：`coreNav`、`workNav`、`utilityNav`
- 每项字段：`{ href: string; label: string; icon: LucideIcon; primary?: boolean; iconOnly?: boolean }`
- 使用 `next/link` 的 `Link`，激活态通过 `pathname.startsWith(href)` 检测
- `utilityNav` 项使用 `iconOnly: true` 仅显示图标

### 1.4 CommandPalette 结构（`components/CommandPalette.tsx`）
- `navCommands` 数组在 `useMemo` 内定义，依赖 `router`
- 每项：`{ id: string; label: string; group: string; icon: any; action: () => void }`
- 全部使用 `router.push()` 跳转，执行后调用 `onClose()`

### 1.5 UI 组件 API（已确认）
- **Button**: `variant?: 'primary'|'secondary'|'danger'|'hero'|'ghost'|'focus'`，无 size 属性
- **Card**: `{ children, className?, interactive? }`，默认 `bg-surface border border-border-subtle rounded-lg shadow-card p-4`
- **Tag**: `{ children, color?, bgColor?, size?: 'sm'|'md', variant?: 'solid'|'outline'|'soft'|'secondary', className? }`
- **Input**: `{ type?, value?, onChange?, placeholder?, className?, onKeyPress?, disabled?, autoFocus? }`
- **Select**: `{ value, onChange, options: {value,label}[], className?, size?, maxHeight?, placeholder?, width? }`

### 1.6 Tailwind 自定义系统（`tailwind.config.js` + `app/globals.css`）
- **颜色**: `bg` `bg2` `ink` `muted` `rule` `accent`(teal) `accent-hover` `accent2`(amber) `surface` `border-subtle/default/strong`
- **字号**: `text-display/h1/h2/h3/body/caption/label`
- **阴影**: `shadow-card` `shadow-card-hover` `shadow-elevated` `shadow-navbar`
- **工具类**: `page-header` `page-title` `page-subtitle` `card-interactive` `stat-number` `empty-state-icon` `transition-fast`
- **过渡**: `transition-fast` (150ms)

### 1.7 现有页面布局模式
```tsx
'use client';
import { Card } from '../../components/ui/Card';
// ...
export default function SomePage() {
  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">标题</h1>
          <p className="page-subtitle">副标题</p>
        </div>
        {/* 可选操作按钮 */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 列表 */}
      </div>
    </div>
  );
}
```

---

## 二、实施计划（严格按 Step 1 → Step 5 顺序）

### Step 1：创建静态数据文件（3 个）

#### 1.1 `lib/workflows/researchWorkflows.ts`

**目录创建**：`lib/workflows/`（新建子目录）

**数据结构定义**：
```typescript
export interface WorkflowStep {
  title: string;          // 步骤标题
  description: string;    // 步骤描述
  toolCombination: string; // 推荐工具组合（自由文本，如 "arXiv + Google Scholar + Semantic Scholar"）
}

export interface PromptTemplate {
  name: string;           // 模板名称
  prompt: string;         // Prompt 内容（含占位符）
  outputSink: string;     // 输出物应该沉淀到哪里（如 "Paper Card", "Idea Card", "MVE"）
}

export interface ResearchWorkflow {
  id: string;             // 'discover-directions' 等
  title: string;          // '发现新方向'
  scenario: string;       // 适用场景描述
  steps: WorkflowStep[];  // 操作步骤列表（3-5 步）
  promptTemplates: PromptTemplate[]; // Prompt 模板列表（1-3 个）
  outputDestination: string; // 输出物最终沉淀位置描述
  roboticsFocus: string; // 面向机器人/VLA/具身智能的特殊说明
}
```

**6 个工作流内容**（id | title）：
1. `discover-directions` | 发现新方向
2. `filter-papers` | 筛选论文
3. `quick-read` | 快速阅读论文
4. `deep-read` | 精读和批判性阅读
5. `reproduce-experiment` | 复现实验
6. `writing-rebuttal` | 论文写作与 rebuttal

每个 workflow 包含 3-5 个 steps、1-3 个 promptTemplates，全部面向机器人/VLA/具身智能研究场景。导出 `const researchWorkflows: ResearchWorkflow[]`。

#### 1.2 `lib/learning/learningPaths.ts`

**目录创建**：`lib/learning/`（新建子目录）

**数据结构定义**：
```typescript
export interface LearningLevel {
  level: 0 | 1 | 2 | 3 | 4;  // Level 0 到 Level 4
  title: string;              // 阶段标题
  goal: string;               // 学习目标
  topics: string[];           // 关键主题列表
}

export interface LearningPath {
  id: string;                  // 'vla' 等
  name: string;                // 'VLA'
  fullName: string;           // 'Vision-Language-Action Models'
  whyWorthLearning: string;    // 为什么值得学
  prerequisites: string[];     // 前置知识列表
  levels: LearningLevel[];     // Level 0 到 Level 4（5 个阶段）
  recommendedPapers: string[]; // 推荐论文标题列表（自由文本，不依赖 Paper id）
  recommendedTools: string[];  // 推荐工具列表
  suggestedOutput: string;     // 建议输出物
}
```

**11 个学习路径**（id | name）：
1. `vla` | VLA
2. `robot-memory` | Robot Memory
3. `world-models` | World Models
4. `diffusion-policy` | Diffusion Policy
5. `imitation-learning` | Imitation Learning
6. `rl-robotics` | Reinforcement Learning for Robotics
7. `active-perception` | Active Perception
8. `3d-vision-robotics` | 3D Vision for Robotics
9. `robot-evaluation` | Robot Evaluation and Benchmarks
10. `embodied-ai` | Embodied AI
11. `safety` | Embodied AI Safety

每个 path 包含 5 个 levels（0-4）、3-5 篇推荐论文、3-5 个推荐工具。导出 `const learningPaths: LearningPath[]`。

#### 1.3 `lib/intelligence/paperIntelligence.ts`

**目录创建**：`lib/intelligence/`（新建子目录）

**数据结构定义**：
```typescript
export interface PaperIntelligence {
  id: string;                    // 'rt-1' 等
  title: string;                 // 论文标题
  area: string;                  // 所属领域（如 'VLA', 'Imitation Learning'）
  problem: string;               // 解决的问题
  motivation: string;            // 动机
  coreIdea: string;              // 核心思想
  method: string;                // 方法概述
  evidence: string;              // 证据/实验结果
  limitations: string;           // 局限性
  hiddenAssumptions: string;     // 隐藏假设
  whyItMatters: string;          // 为什么重要
  possibleExtensions: string;    // 可能的扩展方向
  readingPrompts: string[];      // 阅读时思考的提示问题列表（3-5 个）
}
```

**8 篇样例论文**（id | title）：
1. `rt-1` | RT-1
2. `rt-2` | RT-2
3. `openvla` | OpenVLA
4. `pi0` | π0 (pi0)
5. `pi05` | π0.5 (pi0.5)
6. `diffusion-policy` | Diffusion Policy
7. `libero` | LIBERO
8. `robomme` | RoboMME

每篇论文填满所有 12 个字段 + 3-5 个 readingPrompts。导出 `const paperIntelligenceList: PaperIntelligence[]`。

---

### Step 2：创建展示组件（5 个）

所有组件放在对应子目录下，复用现有 UI 组件和 Tailwind 样式系统。

#### 2.1 `components/workflows/WorkflowCard.tsx`

**目录创建**：`components/workflows/`

**Props**：
```typescript
interface WorkflowCardProps {
  workflow: ResearchWorkflow;
}
```

**渲染结构**：
- 使用 `<Card className="p-5">` 作为容器
- 顶部：标题 + 场景描述（`page-subtitle` 风格）
- 步骤区：标题"操作步骤" + steps 列表（每步显示 title + description + toolCombination）
  - 步骤之间用 `divide-y divide-border-subtle` 分隔
  - toolCombination 用 `<Tag variant="secondary" size="sm">` 包裹
- Prompt 模板区：标题"Prompt 模板" + 使用 `<PromptTemplateCard>` 子组件渲染
- 底部：roboticsFocus 说明（用 `bg-accent/5` 浅底色 + 醒目左边框 `border-l-4 border-l-accent2`）
- 最底部：outputDestination 提示（"输出物应沉淀到：xxx"）

#### 2.2 `components/workflows/PromptTemplateCard.tsx`

**目录**：`components/workflows/`

**Props**：
```typescript
interface PromptTemplateCardProps {
  template: PromptTemplate;
}
```

**渲染结构**：
- 使用 `<Card className="bg-bg2/50 border-dashed">` 虚线边框区分（用 `border-dashed` Tailwind 类）
- 顶部：name + outputSink 标签（`<Tag variant="soft" size="sm">`）
- 中部：prompt 内容用 `<pre>` 或 `<code>` 块展示（`font-mono text-caption bg-surface p-3 rounded`）
- 不需要复杂交互

#### 2.3 `components/learning/LearningPathCard.tsx`

**目录创建**：`components/learning/`

**Props**：
```typescript
interface LearningPathCardProps {
  path: LearningPath;
}
```

**渲染结构**：
- 使用 `<Card className="p-5">` 容器
- 顶部：name（大标题）+ fullName（副标题）+ area 标签
- "为什么值得学"段落（`text-body text-ink`）
- "前置知识"区：prerequisites 用 `<Tag variant="secondary" size="sm">` 列表
- Level 区：使用 `<LevelSection>` 子组件渲染 5 个 level
- 推荐论文区：recommendedPapers 用列表（`<li>` 列表项）
- 推荐工具区：recommendedTools 用 `<Tag variant="outline" size="sm">` 列表
- 底部：suggestedOutput 提示（"建议输出物：xxx"，`bg-accent/5` 浅底）

#### 2.4 `components/learning/LevelSection.tsx`

**目录**：`components/learning/`

**Props**：
```typescript
interface LevelSectionProps {
  level: LearningLevel;
}
```

**渲染结构**：
- 横向布局：左侧 Level 标号圆形（`w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold`）+ 右侧内容
- 标题：`L{level} · {title}`
- 目标：`text-body text-muted`
- 主题列表：topics 用 `<Tag variant="soft" size="sm">` 包裹
- 多个 LevelSection 在 LearningPathCard 中垂直排列，左侧可用 `timeline-line` 类做连接线

#### 2.5 `components/intelligence/PaperIntelligenceCard.tsx`

**目录创建**：`components/intelligence/`

**Props**：
```typescript
interface PaperIntelligenceCardProps {
  paper: PaperIntelligence;
}
```

**渲染结构**：
- 使用 `<Card className="p-5">` 容器
- 顶部：title + area 标签（`<Tag variant="soft" size="sm">`）
- 字段网格（2 列）：每个字段一个小区块
  - 标题（`text-label font-semibold text-muted uppercase tracking-wider`）
  - 内容（`text-body text-ink`）
  - 字段顺序：problem / motivation / coreIdea / method / evidence / limitations / hiddenAssumptions / whyItMatters / possibleExtensions
- 阅读提示区（独立 Card 子块或带分隔线）：readingPrompts 列表
  - 标题"阅读时思考"
  - prompts 用编号列表呈现

---

### Step 3：创建页面（3 个）

所有页面使用 `'use client'`（保持与现有页面一致性，且便于后续扩展搜索/筛选功能），导入数据文件和组件。

#### 3.1 `app/workflows/page.tsx`

**目录创建**：`app/workflows/`

**页面结构**：
```tsx
'use client';
import { WorkflowCard } from '../../components/workflows/WorkflowCard';
import { researchWorkflows } from '../../lib/workflows/researchWorkflows';
// 导入 lucide 图标用于 header

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">AI Research Workflows</h1>
        <p className="page-subtitle">面向机器人/VLA/具身智能研究的标准工作流，每个工作流包含推荐工具组合、操作步骤、Prompt 模板与输出沉淀指引。</p>
      </div>
      <div className="space-y-4">
        {researchWorkflows.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} />
        ))}
      </div>
    </div>
  );
}
```
- 用单列垂直排列（`space-y-4`）而非网格，因为每个 workflow 内容较多
- 不需要 `'use client'` 严格必需，但保留以保持一致性

#### 3.2 `app/learning/page.tsx`

**目录创建**：`app/learning/`

**页面结构**：
```tsx
'use client';
import { LearningPathCard } from '../../components/learning/LearningPathCard';
import { learningPaths } from '../../lib/learning/learningPaths';

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Learning Paths</h1>
        <p className="page-subtitle">从入门到前沿：机器人、VLA、具身智能等方向的系统化学习路径，每条路径包含 Level 0-4 渐进式学习规划。</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {learningPaths.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  );
}
```
- 用 2 列网格（`lg:grid-cols-2`），单列时 1 列

#### 3.3 `app/papers/intelligence/page.tsx`

**目录创建**：`app/papers/intelligence/`（嵌套目录，符合 Next.js App Router 规范）

**页面结构**：
```tsx
'use client';
import { PaperIntelligenceCard } from '../../../components/intelligence/PaperIntelligenceCard';
import { paperIntelligenceList } from '../../../lib/intelligence/paperIntelligence';

export default function PaperIntelligencePage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Paper Intelligence</h1>
        <p className="page-subtitle">论文理解卡片：用结构化字段拆解 8 篇机器人领域关键论文，从问题到隐藏假设，深度理解每篇论文。</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paperIntelligenceList.map((p) => (
          <PaperIntelligenceCard key={p.id} paper={p} />
        ))}
      </div>
    </div>
  );
}
```
- 注意导入路径多一级 `../../../`（因嵌套在 `app/papers/intelligence/`）
- 用 2 列网格

---

### Step 4：追加导航入口（2 个文件）

**只追加，不删除或修改现有项。**

#### 4.1 修改 `components/Navbar.tsx`

在 `workNav` 数组末尾追加 2 项（带文字标签，符合 `workNav` 风格）：
```tsx
const workNav = [
  { href: '/ideas', label: '选择方向', icon: Lightbulb },
  { href: '/papers', label: '论文', icon: FileText },
  { href: '/mves', label: '验证记录', icon: FlaskConical },
  // 新增 ↓
  { href: '/workflows', label: '工作流', icon: Workflow },         // lucide-react 的 Workflow 图标
  { href: '/learning', label: '学习路径', icon: GraduationCap },   // lucide-react 的 GraduationCap 图标
];
```

在 `utilityNav` 数组追加 1 项（仅图标，符合 `utilityNav` 风格）：
```tsx
const utilityNav = [
  { href: '/areas', label: '子领域', icon: LayoutGrid, iconOnly: true },
  // 新增 ↓
  { href: '/papers/intelligence', label: '论文智识', icon: BrainCircuit, iconOnly: true },  // lucide-react BrainCircuit
];
```

**需在文件顶部 import 中追加**：`Workflow, GraduationCap, BrainCircuit`（来自 `lucide-react`）

**激活态自动生效**：Navbar 的 `checkActive` 使用 `startsWith`，`/papers/intelligence` 会同时匹配 `/papers`，需注意。但因为 `checkActive` 顺序：先检查 `pathname.startsWith(href)`，如果 `/papers/intelligence` 路径下，`/papers` 也会被判定为 active。这是可接受的行为（论文子页面时论文菜单也高亮），与现有设计一致。

#### 4.2 修改 `components/CommandPalette.tsx`

在 `navCommands` 数组（`useMemo` 内）末尾追加 3 项：
```tsx
const navCommands = useMemo(() => [
  // ... 现有 6 项 ...
  { id: 'nav-workflows', label: 'AI Research Workflows', group: '导航', icon: Workflow, action: () => { router.push('/workflows'); onClose(); } },
  { id: 'nav-learning', label: 'Learning Paths', group: '导航', icon: GraduationCap, action: () => { router.push('/learning'); onClose(); } },
  { id: 'nav-intelligence', label: 'Paper Intelligence', group: '导航', icon: BrainCircuit, action: () => { router.push('/papers/intelligence'); onClose(); } },
], [router, onClose]);
```

**需在文件顶部 import 中追加**：`Workflow, GraduationCap, BrainCircuit`

---

### Step 5：构建验证

```bash
npm run build
```

**预期成功标志**：
- Next.js 静态导出无 TypeScript 错误
- 新增 3 个路由生成静态 HTML（在 `out/` 目录）
  - `out/Research-Compass-for-Robotics/workflows/index.html`
  - `out/Research-Compass-for-Robotics/learning/index.html`
  - `out/Research-Compass-for-Robotics/papers/intelligence/index.html`

**如果报错**：只修复报错，不新增功能。常见可能错误：
- 导入路径错误（检查 `../../` vs `../../../`）
- TypeScript 类型错误（检查接口字段是否完整）
- 未使用的 import（lint 警告但通常不阻塞 build）

---

## 三、文件清单总览

### 新增文件（11 个）
| 文件路径 | 类型 | 说明 |
|---|---|---|
| `lib/workflows/researchWorkflows.ts` | 数据 | 6 个研究工作流 |
| `lib/learning/learningPaths.ts` | 数据 | 11 个学习路径 |
| `lib/intelligence/paperIntelligence.ts` | 数据 | 8 篇论文理解卡片 |
| `components/workflows/WorkflowCard.tsx` | 组件 | 工作流卡片 |
| `components/workflows/PromptTemplateCard.tsx` | 组件 | Prompt 模板卡片 |
| `components/learning/LearningPathCard.tsx` | 组件 | 学习路径卡片 |
| `components/learning/LevelSection.tsx` | 组件 | 学习阶段区块 |
| `components/intelligence/PaperIntelligenceCard.tsx` | 组件 | 论文理解卡片 |
| `app/workflows/page.tsx` | 页面 | `/workflows` |
| `app/learning/page.tsx` | 页面 | `/learning` |
| `app/papers/intelligence/page.tsx` | 页面 | `/papers/intelligence` |

### 修改文件（2 个，仅追加）
| 文件路径 | 修改内容 |
|---|---|
| `components/Navbar.tsx` | 追加 3 个导航项 + 3 个 import |
| `components/CommandPalette.tsx` | 追加 3 个命令 + 3 个 import |

### 不修改的文件（关键约束）
- `context/AppContext.tsx`
- `context/ActiveIdeaContext.tsx`
- `lib/types.ts`
- `lib/storage.ts`
- `lib/mockAI.ts`
- `lib/mockData.ts`
- `lib/stateCalculator.ts`
- `lib/nextActionCalculator.ts`
- `tailwind.config.js`
- `app/globals.css`
- `next.config.js`
- 所有现有页面文件（`app/page.tsx` 等）

---

## 四、假设与决策

### 假设
1. **lucide-react 0.378.0 包含 `Workflow`、`GraduationCap`、`BrainCircuit` 图标**——已确认这三个图标在 lucide-react 早期版本就存在（`Workflow` 自 0.1.x 起，`GraduationCap` 自 0.1.x 起，`BrainCircuit` 自 0.3.x 起）。若 `BrainCircuit` 不存在，备选 `Cpu` 或 `Sparkles`。
2. **静态导出支持嵌套目录** `/papers/intelligence/`——Next.js App Router 原生支持任意嵌套目录的静态导出。
3. **`'use client'` 不影响静态导出**——现有所有页面都是 `'use client'` 且静态导出正常工作。

### 设计决策
1. **页面使用 `'use client'` 而非 Server Component**：保持与现有页面一致性，且为后续可能加入的搜索/筛选功能预留扩展性。虽然纯静态内容可以是 Server Component，但混用会增加心智负担。
2. **不引入搜索/筛选 UI**：v1 只做静态展示，降低风险。用户可在 Step 5 后再要求增加筛选。
3. **WorkflowCard 使用单列垂直布局**：因为每个 workflow 内容较多（steps + prompts + 说明），网格布局会显得拥挤。
4. **LearningPathCard 和 PaperIntelligenceCard 使用 2 列网格**：内容相对独立，2 列在桌面端可读性最好。
5. **导航项分类**：workflows 和 learning 放入 `workNav`（带文字），intelligence 放入 `utilityNav`（仅图标，因为是 papers 的子页面）。
6. **导入路径使用相对路径**：与项目现有约定一致，不配置 `@/*` 别名以避免修改 `tsconfig.json`。

---

## 五、验证步骤

### Step 5 完成后的验证清单
- [ ] `npm run build` 成功，无 TypeScript 错误
- [ ] `out/` 目录下生成 3 个新路由的 `index.html`
- [ ] 本地 `npm run dev` 后访问 `/workflows`、`/learning`、`/papers/intelligence` 正常渲染
- [ ] Navbar 中新增的 3 个入口可点击跳转
- [ ] CommandPalette 中搜索 "workflow" / "learning" / "intelligence" 能找到对应命令
- [ ] 现有 6 个页面（`/`、`/focus`、`/ideas`、`/papers`、`/mves`、`/areas`）仍正常工作
- [ ] 视觉风格与现有页面一致（颜色、字号、阴影、卡片样式）
- [ ] 不存在未使用的 import 警告

---

## 六、风险点与缓解

### 风险 1：lucide-react 图标名不存在
- **影响**：build 失败
- **缓解**：Step 4 前先用 `Read` 检查 `node_modules/lucide-react/dist/lucide-react.d.ts` 中是否有 `Workflow`、`GraduationCap`、`BrainCircuit`；若不存在，备选 `Network`、`BookOpen`、`Cpu`
- **回退方案**：使用确定存在的图标（如 `Sparkles`、`BookOpen`、`Lightbulb`）

### 风险 2：导入路径错误（嵌套目录）
- **影响**：`app/papers/intelligence/page.tsx` 需用 `../../../` 三级相对路径，容易写错
- **缓解**：在 Step 3 仔细核对每个 import 语句的相对层级

### 风险 3：静态导出对嵌套路由的处理
- **影响**：`/papers/intelligence` 与现有 `/papers` 同级目录 `app/papers/` 下并存
- **缓解**：Next.js App Router 支持 `app/papers/page.tsx` 与 `app/papers/intelligence/page.tsx` 共存，互不影响。现有 `/papers` 路由不受影响。

### 风险 4：数据量较大导致首屏渲染慢
- **影响**：11 个学习路径 + 8 篇论文 + 6 个工作流，单页可能渲染大量 DOM
- **缓解**：v1 不做分页/虚拟滚动，因为内容总量在可接受范围（预计 < 100KB HTML）。如后续体验差，再加搜索/筛选。

### 风险 5：Navbar 激活态冲突
- **影响**：访问 `/papers/intelligence` 时，`/papers` 也会高亮（因为 `startsWith` 匹配）
- **缓解**：这是可接受的行为，符合"论文智识是论文库的延伸"的语义。如用户反馈混淆，后续可在 `checkActive` 中加精确匹配逻辑。

### 风险 6：CommandPalette 搜索关键词
- **影响**：用户搜索中文"工作流"可能找不到（命令 label 是英文 "AI Research Workflows"）
- **缓解**：搜索逻辑已包含 `label.toLowerCase().includes(q)`，英文 label 已覆盖关键词。可在 label 中加中文副标题，但 v1 保持简洁。

---

## 七、执行顺序汇总（给执行器的 checklist）

```
□ Step 1.1  创建 lib/workflows/researchWorkflows.ts
□ Step 1.2  创建 lib/learning/learningPaths.ts
□ Step 1.3  创建 lib/intelligence/paperIntelligence.ts
□ Step 2.1  创建 components/workflows/WorkflowCard.tsx
□ Step 2.2  创建 components/workflows/PromptTemplateCard.tsx
□ Step 2.3  创建 components/learning/LearningPathCard.tsx
□ Step 2.4  创建 components/learning/LevelSection.tsx
□ Step 2.5  创建 components/intelligence/PaperIntelligenceCard.tsx
□ Step 3.1  创建 app/workflows/page.tsx
□ Step 3.2  创建 app/learning/page.tsx
□ Step 3.3  创建 app/papers/intelligence/page.tsx
□ Step 4.1  修改 components/Navbar.tsx（追加 3 项 + 3 import）
□ Step 4.2  修改 components/CommandPalette.tsx（追加 3 命令 + 3 import）
□ Step 5    运行 npm run build，验证通过
```
