# 静态内容页面扩展规划（低风险 v1）

> 分支：`feature/ai-research-workflows`
> 原则：只新增静态数据 + 展示组件 + 页面，不修改现有逻辑
> 日期：2026-07-07

---

## 一、目标

新增 3 个纯静态内容页面，不修改 AppContext、storage.ts，不做任何自动化。

| 页面 | 路由 | 内容 |
|------|------|------|
| AI Research Workflows | `/workflows` | 6 个科研工作流模板（面向机器人/VLA/具身智能） |
| Learning Paths | `/learning` | 11 个学习路径（VLA/Memory/World Models 等） |
| Paper Intelligence | `/papers/intelligence` | 论文理解卡片模板 + 8 篇样例论文 |

---

## 二、Step 1：静态数据文件

### 2.1 `lib/workflows/researchWorkflows.ts`

**数据结构**：

```typescript
interface ResearchWorkflow {
  id: string;
  title: string;               // 科研任务名
  scenario: string;            // 适用场景（机器人/VLA/具身智能）
  toolCombo: string[];         // 推荐工具组合
  steps: WorkflowStep[];       // 操作步骤
  outputDestination: string;   // 输出物沉淀位置
}

interface WorkflowStep {
  order: number;
  action: string;              // 操作描述
  promptTemplate: string;      // Prompt 模板
  tips?: string;               // 额外提示
}
```

**6 个工作流**：

1. 发现新方向
2. 筛选论文
3. 快速阅读论文
4. 精读和批判性阅读
5. 复现实验
6. 论文写作与 rebuttal

### 2.2 `lib/learning/learningPaths.ts`

**数据结构**：

```typescript
interface LearningPath {
  id: string;
  title: string;               // 方向名
  whyWorthLearning: string;    // 为什么值得学
  prerequisites: string[];      // 前置知识
  levels: LearningLevel[];      // Level 0-4
  recommendedPapers: string[];  // 推荐论文
  recommendedTools: string[];   // 推荐工具
  suggestedOutput: string;      // 建议输出物
}

interface LearningLevel {
  level: number;               // 0-4
  name: string;                // 级别名
  goal: string;                // 该级别目标
  topics: string[];             // 学习主题
  milestones: string[];         // 里程碑
}
```

**11 个学习路径**：

VLA, Robot Memory, World Models, Diffusion Policy, Imitation Learning, RL for Robotics, Active Perception, 3D Vision for Robotics, Robot Evaluation and Benchmarks, Embodied AI, Safety

### 2.3 `lib/intelligence/paperIntelligence.ts`

**数据结构**：

```typescript
interface PaperIntelligence {
  id: string;
  title: string;
  area: string;
  problem: string;
  motivation: string;
  coreIdea: string;
  method: string;
  evidence: string;
  limitations: string;
  hiddenAssumptions: string;
  whyItMatters: string;
  possibleExtensions: string;
  readingPrompts: string[];     // 阅读引导问题
}
```

**8 篇样例论文**：

RT-1, RT-2, OpenVLA, pi0, pi0.5, Diffusion Policy, LIBERO, RoboMME

---

## 三、Step 2：展示组件

### 3.1 `components/workflows/WorkflowCard.tsx`

- 展示工作流标题、场景、工具组合
- 展开式步骤列表（含 Prompt 模板）
- 输出物沉淀位置
- 复用 Card、Tag、Button

### 3.2 `components/workflows/PromptTemplateCard.tsx`

- 展示 Prompt 模板文本
- 一键复制按钮（使用 navigator.clipboard）
- 复用 Card、Tag

### 3.3 `components/learning/LearningPathCard.tsx`

- 展示方向标题、为什么值得学、前置知识
- 展开 Level 0-4 详情
- 推荐论文、工具、输出物
- 复用 Card、Tag

### 3.4 `components/learning/LevelSection.tsx`

- 展示单个 Level 的目标、主题、里程碑
- 复用 Card

### 3.5 `components/intelligence/PaperIntelligenceCard.tsx`

- 展示论文理解卡片的 12 个字段
- 可展开/收起
- 阅读引导问题列表
- 复用 Card、Tag

---

## 四、Step 3：页面

### 4.1 `app/workflows/page.tsx`

- 页面标题 + 副标题
- 6 个 WorkflowCard 纵向列表
- 纯静态，无交互状态

### 4.2 `app/learning/page.tsx`

- 页面标题 + 副标题
- 11 个 LearningPathCard 网格/列表
- 纯静态

### 4.3 `app/papers/intelligence/page.tsx`

- 页面标题 + 副标题
- 8 个 PaperIntelligenceCard 列表
- 纯静态

---

## 五、Step 4：导航入口

### 5.1 `components/Navbar.tsx`

在 `workNav` 数组追加 2 项：

```typescript
{ href: '/workflows', label: '工作流', icon: Workflow },
{ href: '/learning', label: '学习', icon: GraduationCap },
```

在 `utilityNav` 追加 1 项：

```typescript
{ href: '/papers/intelligence', label: '论文智能', icon: BrainCircuit },
```

### 5.2 `components/CommandPalette.tsx`

在 `navCommands` 追加 3 项：

```typescript
{ id: 'nav-workflows', label: 'AI 研究工作流', group: '导航', icon: Workflow, action: () => router.push('/workflows') },
{ id: 'nav-learning', label: '学习路径', group: '导航', icon: GraduationCap, action: () => router.push('/learning') },
{ id: 'nav-intelligence', label: '论文智能', group: '导航', icon: BrainCircuit, action: () => router.push('/papers/intelligence') },
```

---

## 六、Step 5：构建验证

```bash
npm run build
```

若报错只修复，不新增功能。

---

## 七、约束

- 不修改 AppContext.tsx
- 不修改 storage.ts
- 不修改 lib/types.ts
- 不修改 mockAI.ts
- 不删除任何现有文件
- 不引入新依赖
- 不实现自动化逻辑
- 不接入真实 AI API
- 复用现有 Button/Card/Tag/Input/Select 组件
- 保持 Tailwind 视觉风格（bg/ink/muted/accent/accent2）
