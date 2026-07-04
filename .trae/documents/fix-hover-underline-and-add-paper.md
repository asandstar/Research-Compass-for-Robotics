# 修复悬浮下划线和加文献入口问题

## 问题总结

### 问题1：卡片悬浮时所有文字都加下划线（体验奇怪）

**根源**：[app/globals.css](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a4660edfef87617ce722f8e/app/globals.css#L26-L28) 中全局设置了 `a:hover { text-decoration: underline }`，所有 `<a>` 标签 hover 时都会加下划线。

**受影响的卡片式 Link（整张卡片包在 Link 里）**：
1. `app/areas/page.tsx` - 子领域卡片网格（`Link` + `block group`）
2. `app/page.tsx` - Dashboard 子领域概览卡片（`Link` 直接包 div）
3. `app/page.tsx` - Dashboard 活跃 Ideas 卡片（`Link` 直接包 div）
4. `app/areas/[id]/AreaDetailClient.tsx` - 子领域详情页的 Idea 列表（`Link` + `block`）
5. `app/areas/[id]/AreaDetailClient.tsx` - 子领域详情页的 MVE 列表（`Link` + `block`）

**修复方案**：
- 全局 `a:hover` 保留（文字链接正常显示下划线）
- 给所有卡片式 Link 添加 `no-underline hover:no-underline` 类，明确禁用下划线
- 改用其他 hover 反馈（阴影、背景色变化），这些已通过 `group-hover`、`hover:shadow-md`、`hover:bg-gray-50` 等实现

### 问题2："有些地方加文献的功能没法点开真正做到加文献"

**分析**：经过测试，Paper Library 页面的"添加论文"按钮可以正常弹出 AddPaperModal。用户说的可能是：

1. **Dashboard 快速开始第2步**"添加论文并写总结" — 这是一个 `Link`，点击后跳转到 `/papers` 页面，而不是直接弹出添加论文弹窗。用户可能期望点击后直接打开添加弹窗。

2. **Idea Workspace 中"添加论文证据"** — EvidenceList 组件支持手动添加文字证据，但不支持直接选择/关联已有的论文。

最可能的是第1点：用户在 Dashboard 上看到"添加论文并写总结"，点了之后跳转到 Paper Library 页面，而不是直接弹出添加论文的表单，觉得"没法真正做到加文献"。

**修复方案**：
- 在 Dashboard 页面添加 AddPaperModal，让"快速开始"中的"添加论文并写总结"改为直接弹出添加论文弹窗
- 或者保留跳转，但加一个更明显的"添加论文"按钮在 Dashboard 上

采用方案：在 Dashboard 的"快速开始"第2步旁边加一个"+"按钮，点击直接弹出 AddPaperModal；同时保留整行的跳转链接。

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `app/globals.css` | 不变（保留全局 a:hover underline） |
| `app/areas/page.tsx` | Link 加 `no-underline hover:no-underline` |
| `app/page.tsx` | 所有卡片式 Link 加 `no-underline hover:no-underline`；新增 AddPaperModal 及状态；快速开始第2步加直接添加按钮 |
| `app/areas/[id]/AreaDetailClient.tsx` | 卡片式 Link（Idea列表、MVE列表）加 `no-underline hover:no-underline` |

## 验证步骤

1. 运行 `npm run build` 确认构建通过
2. 在 Research Areas 页面悬浮子领域卡片，确认文字没有下划线，只有阴影变化
3. 在 Dashboard 悬浮子领域卡片和活跃 Idea 卡片，确认没有下划线
4. 在子领域详情页悬浮 Idea/MVE 卡片，确认没有下划线
5. 在 Dashboard 点击快速开始第2步的"+"按钮，确认直接弹出 AddPaperModal
6. 文字链接（如"查看全部"、"arXiv"、导航栏链接）hover 仍然有下划线
