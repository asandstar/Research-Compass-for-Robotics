# 综合改进计划

## 一、当前状态分析

### 1.1 暗黑模式问题
从截图可以看到，暗黑模式下证据区域（支持/反对/缺失）使用了浅色背景（`bg-green-50`、`bg-red-50`、`bg-amber-50`），导致文字几乎看不清。同时这些彩色背景在暗黑模式下显得过于突兀/显眼。

**涉及文件**：
- `components/focus/FocusEditPanel.tsx` - 证据类型选择按钮背景
- `components/focus/EvidencePressureGauge.tsx` - 证据分布统计背景
- `components/intelligence/PaperIntelligenceCard.tsx` - 局限性/假设/扩展区块背景
- `components/paper/PaperCard.tsx` - 论文详情区块背景
- `components/idea/IdeaEvaluationModal.tsx` - 评分标签背景
- `components/focus/ResearchTimeline.tsx` - 时间线节点背景
- `components/area/AreaMapCard.tsx` - 趋势标签背景

### 1.2 科研训练游戏
目前只有1个游戏（假设检验大师），还有2个"即将上线"。用户希望增加新游戏。

### 1.3 研究问题详情
目前 QuestionCard 不可点击，没有详情页。

### 1.4 弹窗布局
FocusEditPanel 使用右侧滑出面板（`flex justify-end` + `max-w-md` + `h-full`），用户希望改为居中模态框，支持拖拽。

### 1.5 输入体验
手动输入内容太多不方便，需要提供模板和AI辅助。

---

## 二、改进方案

### 改进1：暗黑模式全面修复

**问题**：多个组件使用了固定浅色背景（`bg-*-50`），在暗黑模式下文字对比度不足且过于显眼。

**方案**：
1. 在 `globals.css` 中添加暗黑模式下 `bg-*-50` 的适配样式
2. 在 `tailwind.config.js` 中添加语义化的深色颜色变量
3. 修改各组件中的彩色背景，使用带有 `dark:` 前缀的适配样式

**关键修改**：
- 证据区域背景：`bg-green-50` → `bg-green-50 dark:bg-green-950/30`
- 反对区域背景：`bg-red-50` → `bg-red-50 dark:bg-red-950/30`
- 风险区域背景：`bg-amber-50` → `bg-amber-50 dark:bg-amber-950/30`
- 论文智识区块：`bg-red-50/40` → `bg-red-50/40 dark:bg-red-950/20`
- 时间线节点背景、趋势标签等类似处理

**文件清单**：
1. `app/globals.css` - 添加暗黑模式下的背景色适配
2. `components/focus/FocusEditPanel.tsx` - 修复证据类型按钮背景
3. `components/focus/EvidencePressureGauge.tsx` - 修复证据分布背景
4. `components/intelligence/PaperIntelligenceCard.tsx` - 修复各区块背景
5. `components/paper/PaperCard.tsx` - 修复论文详情区块背景
6. `components/idea/IdeaEvaluationModal.tsx` - 修复评分标签背景
7. `components/focus/ResearchTimeline.tsx` - 修复时间线节点背景
8. `components/area/AreaMapCard.tsx` - 修复趋势标签背景

---

### 改进2：新增科研训练游戏 - 变量控制挑战

**游戏设计**：
- **名称**：变量控制挑战
- **玩法**：展示一个实验场景描述，玩家需要识别出独立变量、因变量、控制变量和混杂变量
- **题目数量**：6-8道
- **计分**：每题4个空，答对一个得1分

**数据结构**：
```typescript
interface VariableControlQuestion {
  id: string;
  scenario: string;           // 实验场景描述
  independentVariable: string; // 独立变量
  dependentVariable: string;   // 因变量
  controlVariables: string[];  // 控制变量
  confoundingVariables: string[]; // 混杂变量
  explanation: string;         // 解析
}
```

**文件清单**：
1. `lib/games/variableControl.ts` - 游戏题库数据
2. `app/games/variable-control/page.tsx` - 游戏页面
3. `app/games/page.tsx` - 更新游戏列表，移除"即将上线"状态

---

### 改进3：研究问题详情页

**设计**：
- 点击问题卡片后进入详情页 `/questions/[id]`
- 详情页展示：问题完整描述、相关领域、难度/影响标注、推荐阅读、相关问题推荐
- 添加"添加到我的研究"按钮（localStorage 记录用户关注的问题）

**文件清单**：
1. `app/questions/[id]/page.tsx` - 问题详情页
2. `components/questions/QuestionCard.tsx` - 添加点击跳转

---

### 改进4：弹窗居中 + 拖拽

**方案**：
1. 将 FocusEditPanel 从右侧滑出改为居中模态框
2. 使用 `@dnd-kit/core` 或原生实现拖拽功能
3. 保持原有功能和动画

**关键修改**：
- 容器样式：`fixed inset-0 z-[100] flex justify-end` → `fixed inset-0 z-[100] flex items-center justify-center`
- 面板样式：`w-full max-w-md h-full` → `w-full max-w-lg max-h-[85vh] rounded-xl`
- 添加拖拽头部（Header 区域可拖拽）

**文件清单**：
1. `components/focus/FocusEditPanel.tsx` - 修改布局为居中+拖拽

---

### 改进5：输入优化 - 模板 + AI辅助

**方案**：
1. **输入模板**：在 textarea 下方添加常用模板快捷按钮，点击自动填充
2. **AI辅助生成**：输入简要描述后，点击"AI生成"按钮，调用 mockAI 生成完整内容

**适用场景**：
- 添加预测：条件/预期结果模板
- 添加证据：证据描述模板
- 添加失败条件：失败条件模板
- 创建Idea：各字段模板

**文件清单**：
1. `components/ui/InputTemplates.tsx` - 可复用的模板按钮组件
2. `components/focus/FocusEditPanel.tsx` - 集成模板和AI辅助
3. `lib/mockAI.ts` - 添加辅助生成函数（基于模板，不接入真实API）

---

## 三、实施顺序

1. **暗黑模式修复**（高优先级，影响所有页面）
2. **弹窗居中+拖拽**（高优先级，改善核心交互）
3. **输入优化**（中优先级，配合弹窗改进）
4. **研究问题详情页**（中优先级）
5. **新增科研游戏**（低优先级，锦上添花）

## 四、风险与考虑

1. **暗黑模式**：需要全面检查所有使用 `bg-*-50` 的地方，避免遗漏
2. **拖拽功能**：不使用额外库，用原生实现减少依赖
3. **输入模板**：保持简单，不引入复杂的状态管理
4. **构建验证**：每完成一个改进就运行 `npm run build` 验证
