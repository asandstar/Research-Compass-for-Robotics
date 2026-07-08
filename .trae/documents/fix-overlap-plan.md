# 组件遮挡问题修复计划

## 一、问题分析

### 1.1 当前问题

从截图可以看到，论文智能页面（`/papers/intelligence`）中的选择复选框与论文标题重叠：
- 复选框使用 `absolute top-3 left-3 z-10` 定位在卡片外部
- 卡片内边距为 `p-5`（20px）
- 标题从卡片顶部开始，导致复选框覆盖在标题上

### 1.2 根本原因

**文件**: `app/papers/intelligence/page.tsx`（第 157-170 行）

```tsx
<div key={p.id} className="relative">
  <button
    onClick={() => toggleSelect(p.id)}
    className={`absolute top-3 left-3 z-10 w-6 h-6 rounded border-2 ...`}
  >
    {/* checkbox */}
  </button>
  <PaperIntelligenceCard paper={p} />
</div>
```

复选框位于卡片外部的 `relative` 容器内，但卡片内部的标题没有留出足够的左边距。

### 1.3 需要检查的其他组件

搜索项目中是否有类似的绝对定位复选框/选择器模式：
- Idea 列表页面的选择卡片
- 论文列表页面的选择功能
- 其他列表页面的选择功能

## 二、修复方案

### 2.1 方案一：将复选框移到卡片内部（推荐）

修改 `PaperIntelligenceCard` 组件，添加 `onSelect` 和 `isSelected` 属性，将复选框集成到卡片内部的 header 区域。

**优点**:
- 布局更稳定，不会出现重叠
- 复选框与卡片内容自然对齐
- 更好的响应式表现

**修改文件**:
1. `components/intelligence/PaperIntelligenceCard.tsx` - 添加选择功能
2. `app/papers/intelligence/page.tsx` - 移除外部复选框

### 2.2 方案二：调整卡片内边距

在卡片左侧添加额外的内边距，但这会影响所有使用该卡片的页面。

## 三、检查其他页面

搜索项目中所有使用绝对定位选择器的地方：

```bash
grep -r "absolute.*top.*left" app/ components/ --include="*.tsx" | grep -i "select\|check"
```

## 四、步骤

1. 修改 `PaperIntelligenceCard.tsx`，添加选择功能
2. 修改 `app/papers/intelligence/page.tsx`，移除外部复选框
3. 搜索并检查其他可能存在重叠问题的页面
4. 运行构建验证
