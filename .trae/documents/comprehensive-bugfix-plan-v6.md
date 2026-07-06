# Research Compass 修复计划 v6：404 问题 + 导航重构

> 解决用户创建内容刷新 404，同时重构导航体验。

## 问题分析

### A. 404 问题（严重）

**根因**：静态导出模式下，用户创建的 Idea/MVE ID 不在 `generateStaticParams` 返回列表中，刷新时 GitHub Pages 返回 404。

**解决方案**：使用 SPA 模式——配置 GitHub Pages 将所有 404 请求重定向到 `index.html`，由 Next.js 客户端路由处理。

### B. 导航重构（体验优化）

**当前问题**：
- 导航栏只有 3 个入口，缺少 Idea 和 MVE 的直接访问
- Research Areas 页面缺少分类筛选和搜索
- Idea 和 MVE 的列表视图缺失

## 实施方案

### 阶段 1：修复 404 问题（SPA 模式）

#### 1.1 创建 `public/404.html`

GitHub Pages 在返回 404 时会使用 `public/404.html`。我们在其中添加 JavaScript 将请求重定向到 `index.html`，并保留原路径以便 Next.js 客户端路由处理。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // 保留原路径，让 Next.js 客户端路由处理
      window.location.href = window.location.origin + '/Research-Compass-for-Robotics/' + window.location.pathname;
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>
```

#### 1.2 更新 `next.config.js`

添加 `trailingSlash: true` 确保所有 URL 一致，便于 404 重定向处理。

### 阶段 2：导航栏重构

#### 2.1 扩展导航栏（Navbar.tsx）

新增 2 个导航项：
- **Ideas**：跳转到 Idea 列表页（需要新建）
- **MVEs**：跳转到 MVE 列表页（需要新建）

导航项：
```tsx
const navItems = [
  { href: '/', label: 'Dashboard', icon: Compass },
  { href: '/areas', label: 'Research Areas', icon: LayoutGrid },
  { href: '/papers', label: 'Paper Library', icon: FileText },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/mves', label: 'MVEs', icon: FlaskConical },
];
```

#### 2.2 新建 Idea 列表页（`app/ideas/page.tsx`）

展示所有 IdeaCard，支持筛选（状态、研究领域）和搜索。

#### 2.3 新建 MVE 列表页（`app/mves/page.tsx`）

展示所有 MVE，支持筛选（状态）和搜索。

### 阶段 3：Research Areas 页面增强

#### 3.1 添加分类筛选

在 Research Areas 页面添加分类筛选器（感知、规划、控制等）。

#### 3.2 添加搜索功能

添加关键词搜索框，支持按名称、描述、关键词搜索。

### 阶段 4：IdeaCard 和 MVE 功能增强

#### 4.1 IdeaWorkspaceClient 增强

- 添加状态历史记录
- 添加评论/备注功能
- 添加标签管理

#### 4.2 MVEResultClient 增强

- 添加实验步骤记录
- 添加数据收集表单
- 添加结果可视化（简单图表）

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `public/404.html` | 新建 | 404 重定向到 index.html |
| `next.config.js` | 修改 | 添加 trailingSlash: true |
| `components/Navbar.tsx` | 修改 | 扩展导航项 |
| `app/ideas/page.tsx` | 新建 | Idea 列表页 |
| `app/mves/page.tsx` | 新建 | MVE 列表页 |
| `app/areas/page.tsx` | 修改 | 添加分类筛选和搜索 |
| `app/idea/[id]/IdeaWorkspaceClient.tsx` | 修改 | 增强功能 |
| `app/mve/[id]/MVEResultClient.tsx` | 修改 | 增强功能 |

## 验证清单

- [ ] 用户新建 Idea 后刷新页面不再 404
- [ ] 用户新建 MVE 后刷新页面不再 404
- [ ] 导航栏包含 5 个入口
- [ ] Idea 列表页可筛选和搜索
- [ ] MVE 列表页可筛选和搜索
- [ ] Research Areas 页面有分类筛选
- [ ] TypeScript 检查通过
- [ ] 构建成功

## 风险提示

1. **404 重定向可能有短暂闪烁**：用户刷新时会先看到 GitHub Pages 默认 404 页面，然后才重定向。可以通过自定义 404.html 样式缓解。
2. **trailingSlash 可能影响现有链接**：需要确保所有链接使用一致的格式。
