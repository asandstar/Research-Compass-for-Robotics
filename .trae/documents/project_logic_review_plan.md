# 项目逻辑审查与修复计划

## 总结

经过对项目所有核心文件的全面审查，发现了以下需要修复的功能逻辑问题，按严重程度分级。

## 当前状态分析

### 高严重度问题（功能缺失/逻辑错误）

#### 1. Ideas 页面"新建 Idea"按钮功能未实现
- **文件**: `app/ideas/page.tsx:72`
- **问题**: `<Button onClick={() => { /* TODO: Create new idea */ }}>` 只有一个空注释，点击无任何反应
- **修复**: 复用 `CreateIdeaModal` 组件，与 AreaDetailClient 中的"新增 Idea"按钮保持一致

#### 2. Dashboard "活跃 Idea" 卡片跳转逻辑不合理
- **文件**: `app/page.tsx:115`
- **问题**: 点击"活跃 Idea"跳转到 `/detail/idea/${firstActiveIdea.id}`，即第一个活跃 Idea 的详情页，而不是 Idea 列表页。用户期望点击统计卡片看到列表，而不是被强制跳到某一条
- **修复**: 改为跳转到 `/ideas` 页面，与"子领域"和"论文"卡片行为一致

#### 3. Dashboard "待验证 MVE" 卡片跳转不合适
- **文件**: `app/page.tsx:128`
- **问题**: 同上，点击跳转到第一个 MVE 详情页，没有 MVE 时卡片禁用但仍然可见
- **修复**: 改为跳转到 `/mves` 页面；当 pendingMVEs === 0 时不显示 pointer-events-none

#### 4. IdeaWorkspaceClient 编辑状态同步 bug
- **文件**: `app/idea/[id]/IdeaWorkspaceClient.tsx:32-37`
- **问题**: useEffect 依赖 `state.isInitialized`，但任何 dispatch 都可能导致 `isInitialized` 不变而其他 state 改变，此时 useEffect 不会重新运行，导致本地编辑的内容（如 handleFieldChange）在用户同时编辑多个字段时，可能被过期的 state 覆盖。另外，`getIdeaCardById` 每次渲染都返回最新 state 的引用，但本地 ideaCard state 不会同步更新
- **修复**: 当 isDirty=true 时，跳过 useEffect 的 state 同步，避免覆盖用户正在编辑的内容

### 中严重度问题（体验/数据一致性）

#### 5. MVEResultClient 切换结果状态时没有自动保存提示
- **文件**: `app/mve/[id]/MVEResultClient.tsx`
- **问题**: 用户切换 resultStatus radio 后，需要手动点"保存结果"按钮才会生效。但 resultStatus 变更会通过 debounce 在2秒后自动保存，而"保存结果"按钮又会触发确认弹窗。这两条路径的逻辑冲突：用户可能以为要手动保存，实际上已经自动保存了
- **修复**: 统一逻辑——resultStatus 变更时也标记 isDirty=true，依赖现有的 debounce 自动保存机制。"保存结果"按钮直接执行保存（不弹确认框），仅当状态变为 passed/failed 时才弹确认框

#### 6. CreateIdeaModal 重复的 early return
- **文件**: `components/idea/CreateIdeaModal.tsx:24,58`
- **问题**: `if (!isOpen) return null` 出现了两次（第24行和第58行），第一次在 useEffect 之前，第二次在 useEffect 之后，逻辑冗余
- **修复**: 删除第24行的重复检查，保留第58行的

#### 7. DELETE_PAPER 缺少级联清理 inspiredIdeaIds
- **文件**: `context/AppContext.tsx:237-247`
- **问题**: 删除 Paper 时清理了 ideaCards 的 sourcePaperIds，但没有清理其他 papers 的 inspiredIdeaIds（当关联的 idea 被删除时）。不过更直接的问题是：删除 Paper 后，该 Paper 关联的 Idea 仍然存在，但 Idea 中的 `sourcePaperIds` 已被清理。然而，其他 Paper 的 `inspiredIdeaIds` 仍包含已删除 Idea 的 ID
- **修复**: 在 DELETE_PAPER 中，除了清理 sourcePaperIds，还需从其他 paper 的 inspiredIdeaIds 中移除由于该 paper 删除而产生的孤立引用（即该 paper 的 inspiredIdeaIds 中引用的 idea 如果不再有 sourcePaperIds，无需处理，因为 idea 本身仍在）。当前逻辑已够用，无需额外修改

#### 8. ObservationCard 和 IdeaCardMini 使用了自定义 CSS 类名（非 Tailwind）
- **文件**: `components/observation/ObservationCard.tsx:27`, `components/idea/IdeaCardMini.tsx:21`
- **问题**: 使用了 `border-rule`, `text-muted`, `text-ink`, `bg-bg2`, `text-accent`, `border-accent` 等自定义 Tailwind 类名，但项目中可能没有配置这些类名。如果 Tailwind 配置中没有定义这些 extend，则样式不会生效
- **修复**: 将自定义类名替换为标准 Tailwind 类名，确保样式正确渲染

#### 9. ObservationInput 使用 `Textarea` 组件但传入 `className` 选择器 hack
- **文件**: `components/observation/ObservationInput.tsx:37`
- **问题**: `className="[&_label]:hidden"` 依赖于 Textarea 组件内部渲染一个 `<label>` 元素。如果 Textarea 组件不渲染 label，则此选择器无效
- **修复**: 检查 Textarea 组件实现，如果 label="" 时不渲染 label，则移除该 className；否则保持

### 低严重度问题（优化/改进）

#### 10. MVEResultClient 本地定义了 resultLabels 重复常量
- **文件**: `app/mve/[id]/MVEResultClient.tsx` 约第80行
- **问题**: 本地定义了 `resultLabels` 对象，与 `lib/types.ts` 中的 `MVE_RESULT_LABELS` 完全重复
- **修复**: 从 types.ts 导入 MVE_RESULT_LABELS 替换本地定义

#### 11. Ideas 页面统计卡片中"研究中"统计逻辑不一致
- **文件**: `app/ideas/page.tsx:60`
- **问题**: `stats.active` 的定义是"非 abandoned 且非 promising"，但卡片标签写的是"研究中"，语义不匹配。Dashboard 中"活跃 Idea"也是同样的过滤逻辑
- **修复**: 将标签从"研究中"改为"活跃 Idea"或调整统计逻辑

#### 12. AreaDetailClient 已读/在读统计包含 deep_reading
- **文件**: `app/areas/[id]/AreaDetailClient.tsx:104`
- **问题**: `papers.filter(p => p.readingStatus === 'reviewed' || p.readingStatus === 'deep_reading').length` 统计的是"已复盘+精读中"，但卡片标签是"已读/在读"，语义模糊
- **修复**: 改为更明确的统计——"已复盘"为已读，"精读中"为在读，分开显示或调整标签

## 修改计划

### 步骤 1: 修复 Ideas 页面"新建 Idea"按钮
- 在 `app/ideas/page.tsx` 中引入 `CreateIdeaModal` 组件
- 添加 `showCreateIdea` state 和 `router`
- 点击按钮打开 CreateIdeaModal，创建成功后跳转到 Idea 详情页
- 参照 `app/areas/[id]/AreaDetailClient.tsx` 中的实现模式

### 步骤 2: 修复 Dashboard 统计卡片跳转
- `app/page.tsx`: "活跃 Idea" 卡片改为跳转 `/ideas`
- `app/page.tsx`: "待验证 MVE" 卡片改为跳转 `/mves`，移除 pointer-events-none 逻辑

### 步骤 3: 修复 IdeaWorkspaceClient 编辑状态同步
- 在 useEffect 中增加 `isDirty` 守卫：当 isDirty=true 时不从 state 同步 ideaCard

### 步骤 4: 修复 CreateIdeaModal 重复 early return
- 删除 `components/idea/CreateIdeaModal.tsx` 第24行的重复 `if (!isOpen) return null`

### 步骤 5: 修复 MVEResultClient 本地 resultLabels 重复
- 从 `lib/types.ts` 导入 `MVE_RESULT_LABELS`
- 替换本地 `resultLabels` 对象为 `MVE_RESULT_LABELS`

### 步骤 6: 修复自定义 CSS 类名
- `ObservationCard.tsx`: 将 `bg-bg2` → `bg-gray-50`, `text-muted` → `text-gray-500`, `text-ink` → `text-gray-800`, `text-accent` → `text-indigo-600`, `border-rule` → `border-gray-200`, `border-accent` → `border-indigo-300`
- `IdeaCardMini.tsx`: 同上替换

### 步骤 7: 修复 Ideas 页面统计标签
- `app/ideas/page.tsx`: 将"研究中"标签改为"活跃"以匹配统计逻辑

### 步骤 8: 验证构建
- 运行 `npm run build` 确认无类型错误和构建失败

## 假设与决策

1. **不做大幅重构**: 只修复功能逻辑问题，不改变整体架构
2. **ObservationInput 的 Textarea className hack**: 需要检查 Textarea 组件实现再决定是否移除
3. **MVEResultClient 保存逻辑**: 保持现有的 debounce 自动保存 + 手动保存双路径，仅确保逻辑一致
4. **DELETE_PAPER 级联**: 当前逻辑已足够，不做额外修改

## 验证步骤

1. `npm run build` 通过
2. 点击 Ideas 页面"新建 Idea"按钮，能打开模态框并成功创建
3. Dashboard 统计卡片跳转到正确的列表页
4. IdeaWorkspaceClient 编辑时不会意外覆盖用户输入
5. 自定义 CSS 类名替换后页面样式正常
