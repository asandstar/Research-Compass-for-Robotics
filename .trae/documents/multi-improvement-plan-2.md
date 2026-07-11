# 多维度改进计划 v2

## 摘要

基于用户反馈，本次计划覆盖 4 个改进方向：
1. **暗黑模式全面修复** - 修复遗漏的 `bg-*-50` 浅色块在暗黑模式下的刺眼问题
2. **科研训练游戏完善** - 实现「变量控制挑战」新游戏
3. **研究问题详情页** - 让 QuestionCard 可点击进入详情
4. **输入体验优化收尾** - 为 FocusEditPanel 的 Evidence 部分集成 InputTemplates

---

## 当前状态分析

### 已完成的铺垫工作
- `FocusEditPanel.tsx` 已从右侧抽屉重构为**居中可拖拽弹窗**（drag 实现 + `max-w-lg max-h-[85vh]`）
- `InputTemplates.tsx` 已创建，提供**快捷模板按钮 + AI 辅助生成**
- `mockAI.ts` 已添加 `mockGeneratePrediction`、`mockGenerateEvidence`、`mockGenerateFailureCondition`
- 多个组件已添加 `dark:` 变体（PaperCard、PaperIntelligenceCard、AreaMapCard、IdeaEvaluationModal、EvidencePressureGauge、ResearchTimeline、FocusEditPanel）

### 仍存在的暗黑模式遗漏
通过 `grep "bg-(red|green|blue|amber|purple|gray)-50"` 扫描，以下文件/位置**缺少 dark 变体**，在暗黑模式下会出现刺眼的浅色大块或看不清的文字：

| 文件 | 问题位置 | 影响 |
|---|---|---|
| `app/questions/page.tsx` | filterButtons 的 `bgColor`（red-50/blue-50/green-50/purple-50）| 筛选按钮背景刺眼 |
| `app/questions/page.tsx` | 统计卡片图标背景（red-50/blue-50/green-50/purple-50）| 统计区图标背景刺眼 |
| `app/games/hypothesis-testing/page.tsx` | 结果页 `bg-green-50`/`bg-red-50`、`bg-amber-50`、选项 `bg-green-50`/`bg-red-50` | 游戏结果和选项背景刺眼 |
| `app/games/page.tsx` | 游戏卡片图标 `bg-blue-50`/`bg-gray-50` | 游戏列表图标背景刺眼 |
| `app/page.tsx` | 首页多个图标背景（blue-50/green-50/purple-50/amber-50）| 首页图标背景刺眼 |
| `app/mves/page.tsx` | 状态图标背景（amber-50/green-50/red-50）| MVE 页面图标背景刺眼 |
| `app/papers/page.tsx` | 统计标签背景（purple-50/green-50/red-50）| 论文统计背景刺眼 |
| `lib/questions/researchQuestions.ts` | `QUESTION_TYPE_LABELS` 的 `bgColor` | QuestionCard 标签背景刺眼 |
| `components/focus/EvidencePressureGauge.tsx` | gauge bar `bg-green-500`/`bg-amber-500`/`bg-red-500` | 进度条颜色在 dark 下可能过亮 |
| `components/focus/MVEGateCard.tsx` | status color `bg-green-500`/`bg-red-500` | 状态色块 |
| `components/idea/IdeaEvaluationModal.tsx` | score bar `bg-green-500`/`bg-amber-500`/`bg-red-500` | 评分条 |
| `components/mve/MVEHistoryCard.tsx` | status icon bg `bg-green-500`/`bg-red-500` | 历史卡片状态色 |

### 输入优化待收尾
- `FocusEditPanel.tsx` 的 **Add Evidence** 区域（约第 391-399 行）还没有集成 `InputTemplates`
- 需要在证据 textarea 下方添加 `EVIDENCE_TEMPLATES` 快捷按钮 + AI 生成按钮

### 研究问题详情待实现
- `ResearchQuestion` 接口缺少详情字段（description、relatedPapers、keyChallenges、opportunities）
- 没有 `app/questions/[id]/page.tsx` 详情页
- `QuestionCard.tsx` 没有点击跳转逻辑

### 游戏待完善
- `app/games/page.tsx` 中「变量控制挑战」标记为 `disabled: true`
- 需要创建 `app/games/variable-control/page.tsx` 游戏页面
- 需要创建 `lib/games/variableControl.ts` 游戏数据

---

## 具体变更计划

### 1. 暗黑模式全面修复

**策略**：对所有遗漏的 `bg-*-50` 添加对应的 `dark:bg-*-950/20` 或 `dark:bg-*-950/30` 变体；对 `text-*-600` 添加 `dark:text-*-400`；对 gauge/score bar 的 `bg-*-500` 在 dark 下降为 `dark:bg-*-600` 降低饱和度。

#### 1.1 `app/questions/page.tsx`
- filterButtons 数组：每个 `bgColor` 追加 `dark:bg-*-950/30`
- 每个 `color` 追加 `dark:text-*-400`
- 统计卡片图标 div：追加 `dark:bg-*-950/30`

#### 1.2 `app/games/hypothesis-testing/page.tsx`
- 结果页 Trophy 背景 `bg-amber-50` → `bg-amber-50 dark:bg-amber-950/30`
- 结果列表项 `bg-green-50` → `bg-green-50 dark:bg-green-950/30`，`bg-red-50` → `bg-red-50 dark:bg-red-950/30`
- 选项结果 `bg-green-50` → `bg-green-50 dark:bg-green-950/30`，`bg-red-50` → `bg-red-50 dark:bg-red-950/30`
- 选项结果内部提示 `bg-green-100 text-green-800` → `bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400`
- Hint 区域 `bg-amber-50` → `bg-amber-50 dark:bg-amber-950/30`

#### 1.3 `app/games/page.tsx`
- 游戏卡片 `color` 属性中的 `bg-blue-50` → `bg-blue-50 dark:bg-blue-950/30`
- `bg-gray-50` 保持不变（disabled 状态本来就要灰暗）

#### 1.4 `app/page.tsx`
- 所有图标背景 `bg-blue-50`/`bg-green-50`/`bg-purple-50`/`bg-amber-50` 追加 `dark:bg-*-950/30`

#### 1.5 `app/mves/page.tsx`
- 状态图标背景追加 `dark:bg-*-950/30`

#### 1.6 `app/papers/page.tsx`
- 统计标签 `bg` 追加 `dark:bg-*-950/30`

#### 1.7 `lib/questions/researchQuestions.ts`
- `QUESTION_TYPE_LABELS` 的 `bgColor` 追加 `dark:bg-*-950/30`
- `color` 追加 `dark:text-*-400`

#### 1.8 `components/focus/EvidencePressureGauge.tsx`
- gauge bar `bg-green-500` → `bg-green-500 dark:bg-green-600`，`bg-amber-500` → `bg-amber-500 dark:bg-amber-600`，`bg-red-500` → `bg-red-500 dark:bg-red-600`

#### 1.9 `components/focus/MVEGateCard.tsx`
- status color `bg-green-500` → `bg-green-500 dark:bg-green-600`，`bg-red-500` → `bg-red-500 dark:bg-red-600`

#### 1.10 `components/idea/IdeaEvaluationModal.tsx`
- score bar 同上降饱和度

#### 1.11 `components/mve/MVEHistoryCard.tsx`
- status icon bg 同上降饱和度

---

### 2. 输入体验优化收尾（FocusEditPanel Evidence 部分）

#### 2.1 `components/focus/FocusEditPanel.tsx`
在 Add Evidence 区域的 `FormField`（证据内容 textarea）下方添加：
```tsx
<InputTemplates
  templates={EVIDENCE_TEMPLATES}
  onSelect={(content) => setEvidenceText(content)}
  showAIGenerate
  aiLoading={aiLoading}
  onAIGenerate={async () => {
    setAiLoading(true);
    const typeMap = { evidenceForHypothesis: 'supporting', evidenceAgainstHypothesis: 'opposing', falsificationRisks: 'missing' } as const;
    const generated = await mockGenerateEvidence(typeMap[evidenceType], idea?.coreHypothesis || '');
    setEvidenceText(generated);
    setAiLoading(false);
  }}
/>
```

---

### 3. 研究问题详情页

#### 3.1 `lib/questions/researchQuestions.ts`
- 扩展 `ResearchQuestion` 接口，新增可选字段：
  - `description?: string` - 问题背景说明
  - `keyChallenges?: string[]` - 关键挑战
  - `opportunities?: string[]` - 研究机会
  - `relatedPapers?: string[]` - 相关论文（已有，复用）
- 为所有 `gap` 类型和 `hot` 类型的问题补充 `description` 和 `keyChallenges`（至少前 8 个）

#### 3.2 `components/questions/QuestionCard.tsx`
- 导入 `Link` from `next/link`
- 将 Card 外层包裹 `<Link href={`/questions/${question.id}`} className="block no-underline">`
- 去掉右下角的 `ArrowRight` 图标（或保留作为视觉提示）
- 确保 Card 的 hover 效果正常

#### 3.3 创建 `app/questions/[id]/page.tsx`
- 接收 `params: { id: string }`
- 从 `researchQuestions` 查找对应问题
- 未找到时显示 404 状态（静态导出需要 `generateStaticParams`）
- 页面内容包含：
  - 问题文本（大标题）
  - 类型标签、难度、影响力
  - 所属领域
  - 问题描述/背景
  - 关键挑战列表
  - 研究机会列表
  - 返回按钮
- 样式使用现有设计系统（Card、Tag、page-title 等）

#### 3.4 `app/questions/page.tsx`
- 无需大改，但确认 QuestionCard 的点击交互正常

---

### 4. 科研训练游戏：变量控制挑战

#### 4.1 创建 `lib/games/variableControl.ts`
定义数据结构和题目：
```typescript
export interface VariableControlQuestion {
  id: string;
  field: string;
  scenario: string;
  experiment: string;
  variables: {
    independent: string;
    dependent: string;
    confounding: string[];
  };
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
}
```
- 设计 6 道题目，覆盖机器人视觉、RL、SLAM、控制等领域
- 每道题给出实验场景，要求识别：自变量、因变量、混杂变量，或选择正确的控制方案

#### 4.2 创建 `app/games/variable-control/page.tsx`
- 游戏流程与假设检验大师一致：
  - 随机抽取 5 题
  - 单选 + 即时反馈
  - 进度条
  - 计分和结果页
- UI 复用假设检验大师的交互模式（选项卡片、正确/错误颜色反馈、解释区域）
- 但题目内容聚焦在**变量识别**和**混杂变量控制**

#### 4.3 更新 `app/games/page.tsx`
- 将「变量控制挑战」的 `disabled: true` 改为 `false`
- `color` 改为激活状态 `bg-teal-50 text-teal-600`（并追加 dark 变体）
- `questions` 设为实际数量
- `difficulty` 设为「中级」

---

### 5. 构建验证与部署

#### 5.1 静态导出参数
- `app/questions/[id]/page.tsx` 必须实现 `generateStaticParams`，返回所有 `researchQuestions` 的 `id`
- `next.config.js` 已配置 `output: 'export'`，无需修改

#### 5.2 构建命令
```bash
npm run build
```
- 验证无 TypeScript 错误
- 验证静态页面数量正确（应增加 questions 详情页 + variable-control 游戏页）

#### 5.3 GitHub 提交
```bash
git add .
git commit -m "feat: dark mode fixes, question details, variable control game, input templates"
git push origin main
```

---

## 假设与决策

1. **暗黑模式修复范围**：仅修复用户明显感知的 `bg-*-50` 浅色块问题。gauge/score bar 的 `bg-*-500` 在 dark 下虽然亮，但属于功能性高饱和度指示色，降级到 `*-600` 即可，不需要完全改掉。
2. **研究问题详情数据**：由于数据是 mock 的，只为部分问题（特别是 gap/hot 类型）补充详情字段，不需要全部 30 个都补充。
3. **变量控制游戏复杂度**：采用与假设检验大师完全一致的交互框架（单选题 + 即时反馈），降低开发成本，保持用户体验一致性。
4. **拖拽实现**：继续使用已有的原生 mouse/touch 事件实现，不引入第三方库。
5. **静态导出约束**：所有动态路由（questions/[id]）都必须预生成参数，确保静态部署可用。

---

## 验证清单

- [ ] 暗黑模式下，questions、games、hypothesis-testing、mves、papers、page 页面的浅色块不再刺眼
- [ ] 暗黑模式下，QuestionCard 标签文字清晰可见
- [ ] FocusEditPanel Evidence 区域有快捷模板和 AI 生成按钮
- [ ] 点击 QuestionCard 可跳转到详情页，详情页展示完整信息
- [ ] 变量控制挑战游戏可正常进入、答题、查看结果
- [ ] 游戏列表页「变量控制挑战」不再是灰色禁用状态
- [ ] `npm run build` 成功，无错误
- [ ] 静态页面数量正确（新增 questions 详情页 + variable-control 游戏页）
- [ ] GitHub Actions 部署成功
