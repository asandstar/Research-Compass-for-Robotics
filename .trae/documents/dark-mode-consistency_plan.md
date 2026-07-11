# 暗黑模式一致性检查修复计划

## 问题分析

通过全面检查代码库，发现以下一致性问题：

### 1. UI 基础组件缺失暗黑模式样式

| 文件 | 问题 | 严重程度 |
|------|------|----------|
| `components/ui/Textarea.tsx` | 标签和文本框缺失 dark 模式样式 | 高 |
| `components/ui/Select.tsx` | 下拉框背景、边框、文字缺失 dark 模式 | 高 |
| `components/ui/Tag.tsx` | secondary 变体缺失 dark 模式背景 | 中 |
| `components/ui/EmptyState.tsx` | 图标背景缺失 dark 模式 | 中 |

### 2. 业务组件使用硬编码颜色而非主题变量

| 文件 | 问题 | 严重程度 |
|------|------|----------|
| `components/idea/IdeaCardMini.tsx` | 使用 `text-gray-800`、`text-gray-500`、`bg-gray-200` | 高 |
| `components/observation/ObservationCard.tsx` | 使用 `text-gray-800`、`text-gray-500` | 高 |
| `components/idea/EvidenceList.tsx` | 使用 `text-gray-500`、`text-gray