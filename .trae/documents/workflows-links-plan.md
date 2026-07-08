# AI Research Workflows 添加链接计划

## 需求分析

用户希望在 AI Research Workflows 页面中为每个步骤的工具组合添加可点击链接，让用户能直接跳转到相关工具（如 arXiv、PaperWithCode、Semantic Scholar 等）。

## 当前状态

**数据结构**（`lib/workflows/researchWorkflows.ts`）：
```typescript
export interface WorkflowStep {
  title: string;
  description: string;
  toolCombination: string;  // 只是字符串，如 "arXiv + PaperWithCode + Google Scholar"
}
```

**组件渲染**（`components/workflows/WorkflowCard.tsx`）：工具组合只是纯文本显示。

## 修改计划

### Step 1：修改数据接口

**文件**：`lib/workflows/researchWorkflows.ts`

新增 `ToolLink` 接口，将 `toolCombination` 从字符串改为数组：
```typescript
interface ToolLink {
  name: string;
  url: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
  tools: ToolLink[];  // 替代原来的 toolCombination
}
```

### Step 2：更新所有工作流的工具数据

**文件**：`lib/workflows/researchWorkflows.ts`

为每个步骤的工具添加官方链接，主要工具包括：
- arXiv → https://arxiv.org
- PaperWithCode → https://paperswithcode.com
- Google Scholar → https://scholar.google.com
- Semantic Scholar → https://www.semanticscholar.org
- Notion → https://www.notion.so
- GitHub → https://github.com
- Hugging Face → https://huggingface.co
- Connected Papers → https://www.connectedpapers.com
- Overleaf → https://www.overleaf.com
- Weights & Biases → https://wandb.ai

### Step 3：修改组件渲染

**文件**：`components/workflows/WorkflowCard.tsx`

将工具组合从纯文本改为可点击的标签链接，样式与 Learning Paths 页面的工具标签保持一致（accent 色边框 + 文字，hover 变浅）。

### Step 4：运行 build 验证

```bash
npm run build
```

## 文件清单

| 文件 | 修改类型 | 说明 |
|---|---|---|
| `lib/workflows/researchWorkflows.ts` | 修改 | 接口变更 + 数据更新（工具添加链接） |
| `components/workflows/WorkflowCard.tsx` | 修改 | 渲染逻辑改为可点击链接 |

## 风险点

1. **接口变更**：`toolCombination` 改为 `tools`，需要确保所有工作流数据都更新为新格式
2. **链接有效性**：确保所有工具链接都是官方且有效的
3. **样式一致性**：保持与 Learning Paths 页面工具标签样式一致

## 执行顺序

```
1. 修改 lib/workflows/researchWorkflows.ts - 接口和数据
2. 修改 components/workflows/WorkflowCard.tsx - 渲染
3. npm run build
4. git commit + push
```
