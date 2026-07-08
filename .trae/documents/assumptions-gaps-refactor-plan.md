# 假设提取与缺口分析重构计划

## 问题分析

当前 `mockExtractAssumptions` 和 `mockExtractGaps` 存在以下问题：
- **硬编码模板**：假设几乎完全固定，只根据 keyword 判断是否有传感器/视觉/学习
- **随机生成**：缺口从 5 个模板随机取 3 个，与论文内容无关
- **误导用户**：用户以为是真实分析，实际是通用模板，可能产生错误认知

用户反馈：**"不是真实的"**，希望改为**思考引导**而非自动生成结果。

## 解决方案

### 核心思路
将"假设提取"和"缺口分析"改为**思考框架+提示问题**，整合到 Paper Intelligence 卡片中，引导用户自行思考而非给出答案。

### 具体改动

#### Step 1: 扩展 PaperIntelligence 数据结构

在 `lib/intelligence/paperIntelligence.ts` 中添加两个新字段：

```typescript
export interface PaperIntelligence {
  // ...existing fields
  assumptionThinkingPrompts?: string[];  // 假设思考提示
  gapThinkingPrompts?: string[];         // 缺口探索方向
}
```

为每篇论文预写思考引导内容（如"这篇论文可能隐藏哪些假设？"、"从泛化能力角度可能发现什么缺口？"等），而非固定模板。

#### Step 2: 修改 PaperIntelligenceCard 组件

在 `components/intelligence/PaperIntelligenceCard.tsx` 中：
- 添加"假设思考"和"缺口探索"两个新区块（与"阅读时思考"类似）
- 使用不同的样式区分（如用不同的左边框颜色）
- 内容从 `paper.assumptionThinkingPrompts` 和 `paper.gapThinkingPrompts` 读取

#### Step 3: 移除误导性的功能

- 删除 `lib/mockAI.ts` 中的 `mockExtractAssumptions` 和 `mockExtractGaps` 函数
- 删除 `components/paper/AnalysisResultModal.tsx` 组件
- 检查并移除相关调用入口（如 papers 页面的按钮）

#### Step 4: 为 8 篇论文添加思考引导内容

为 paperIntelligence.ts 中的每篇论文添加定制化的思考提示：
- RT-1: "为什么选择离散化动作？假设了什么？"
- π0: "flow matching 的假设是什么？与 diffusion 的区别？"
- LIBERO: "lifelong learning 的假设是什么？真实场景是否成立？"
- 等等

---

## 涉及文件

| 文件 | 操作 |
|---|---|
| `lib/intelligence/paperIntelligence.ts` | 添加 assumptionThinkingPrompts/gapThinkingPrompts 字段 |
| `components/intelligence/PaperIntelligenceCard.tsx` | 添加思考引导区块渲染 |
| `lib/mockAI.ts` | 删除 mockExtractAssumptions/mockExtractGaps 函数 |
| `components/paper/AnalysisResultModal.tsx` | 删除组件 |
| `app/papers/page.tsx` | 移除假设提取/缺口分析按钮入口 |

## 验证步骤

1. `npm run build` 确保编译通过
2. 检查 Paper Intelligence 页面是否正常显示思考引导区块
3. 确认没有残留的假设提取/缺口分析入口

## 设计原则

- **诚实透明**：不假装 AI 生成答案，而是引导用户思考
- **论文定制**：每篇论文的思考提示根据其内容定制，而非通用模板
- **视觉区分**：假设思考用蓝色边框，缺口探索用橙色边框，与阅读提示的紫色区分