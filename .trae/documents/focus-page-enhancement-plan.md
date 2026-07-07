# Focus 页面功能增强与优化方案

## 概述

Focus 页面当前只能展示信息，无法直接操作。"下一步行动"的按钮（如"添加预测"）点击后只是跳回 `/focus`，没有实际功能。本方案将 Focus 页面从纯展示升级为可操作的工作区。

## 当前问题分析

| 问题 | 根因 |
|------|------|
| "添加预测"按钮无效 | `NextActionCard` 的 `onClick={() => router.push('/focus')}` 只跳转回自己 |
| "编辑假设"按钮无效 | 同上，所有 actionPath 都是 `/focus`，没有编辑面板 |
| "执行实验"按钮无效 | 同上，无实验执行界面 |
| 证据面板无法操作 | 只显示计数，无法添加/查看证据 |
| 分数无法编辑 | 只读展示，无手动调整入口 |
| MVE 管线只能看 | 无法执行/标记实验结果 |

## 实施方案

### 1. 新建 Focus 编辑面板系统

新建 `components/focus/FocusEditPanel.tsx`，一个模态/侧滑面板组件，根据 `nextAction.type` 显示不同编辑表单。

| action type | 面板内容 | 使用的 AppContext API |
|---|---|---|
| `complete_core_fields` | 编辑 researchQuestion + coreHypothesis + whyItMatters | `updateIdeaCard()` |
| `add_predictions` | 添加 condition + expectedOutcome 预测对 | `updateIdeaCard()` |
| `add_failure_conditions` | 添加失败条件文本 | `updateIdeaCard()` |
| `add_evidence` | 添加证据文本 + 选择类型（支持/反对/风险） | `addEvidence()` |
| `strengthen_falsification` | 同 add_failure_conditions | `updateIdeaCard()` |
| `execute_pending_mve` | 显示 MVE 详情 + 标记结果（通过/失败） | `updateMVEResult()` |
| `review_failure` | 显示失败分析 + 建议的更新 | `updateIdeaCard()` |
| `generate_mve` | 触发 MVE 生成（调用 generateMVE） | `generateMVE()` |

**面板设计：**
- 从右侧滑入的侧边面板（`w-full max-w-md`），而非居中 modal
- 半透明遮罩 + `modal-overlay` 动画
- 面板内 `modal-content` slideUp 动画
- 标题栏：面板标题 + 关闭按钮
- 保存按钮使用 `variant="primary"`

**文件：** `components/focus/FocusEditPanel.tsx`（新建）

### 2. 修改 NextActionCard 组件

**文件：** `components/focus/NextActionCard.tsx`

改动：
- 新增 `onAction` prop 回调
- 按钮 `onClick` 调用 `onAction(nextAction)` 而非 `router.push`
- 按钮文案根据 type 显示对应行动：
  - `add_predictions` -> "添加预测"（打开面板）
  - `complete_core_fields` -> "编辑假设"（打开面板）
  - `execute_pending_mve` -> "执行实验"（打开面板）
  - 其他类型保持现有行为

### 3. 修改 Focus 主页面

**文件：** `app/focus/page.tsx`

改动：
- 新增 `editAction` state（`NextAction | null`）
- `NextActionCard` 传入 `onAction={setEditAction}`
- 渲染 `FocusEditPanel`，传入 `isOpen={!!editAction}` + `action={editAction}` + `onClose`

### 4. 增强 EvidencePressurePanel

**文件：** `components/focus/EvidencePressurePanel.tsx`

改动：
- 每行增加点击展开功能（或展开为最近 3 条证据列表）
- 支持"快速添加证据"：点击后打开 FocusEditPanel 的证据添加模式
- 底部添加 "+ 添加证据" 小按钮

### 5. 增强 MVEGateCard

**文件：** `components/focus/MVEGateCard.tsx`

改动：
- pending 状态的 MVE 显示"标记结果"按钮
- 点击后打开 FocusEditPanel 的实验执行模式
- 底部增加"生成新实验"按钮（如果符合条件）

### 6. 增强 FocusIdeaCard

**文件：** `components/focus/FocusIdeaCard.tsx`

改动：
- 标题旁增加编辑图标按钮，点击后打开编辑面板（complete_core_fields 模式）
- 增加 `border-l-accent` 的视觉强度（已是 border-l-4）

### 7. Focus 页面底部增加快捷操作栏

**文件：** `app/focus/page.tsx`

在 MVEGateCard 下方增加一组快捷操作按钮：
- "编辑假设" -> 打开编辑面板
- "添加证据" -> 打开证据面板
- "生成实验" -> 调用 generateMVE
- 每个按钮带图标 + 文字，使用 `variant="secondary"` 或 `variant="ghost"`

## 文件改动清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `components/focus/FocusEditPanel.tsx` | 新建 | 侧滑编辑面板，支持 8 种 action 类型 |
| `components/focus/NextActionCard.tsx` | 修改 | 按钮触发编辑面板而非跳转 |
| `app/focus/page.tsx` | 修改 | 集成编辑面板 state + 快捷操作栏 |
| `components/focus/EvidencePressurePanel.tsx` | 修改 | 增加展开 + 快速添加 |
| `components/focus/MVEGateCard.tsx` | 修改 | 增加标记结果 + 生成实验 |
| `components/focus/FocusIdeaCard.tsx` | 修改 | 增加编辑入口 |

## 验证步骤

1. 选择一个 Idea 进入 Focus 页面
2. 点击"下一步行动"的按钮，验证面板打开
3. 在面板中添加一个预测（condition + expectedOutcome），保存后验证 IdeaCard 数据更新
4. 在证据面板中添加支持证据，验证计数更新
5. 标记 pending MVE 的结果为 passed/failed
6. 验证 NextAction 在操作后自动更新（如添加预测后，下一步变为"定义失败条件"）
7. 构建验证 + 预览
