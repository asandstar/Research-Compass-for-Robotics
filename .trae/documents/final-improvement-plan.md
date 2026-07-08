# 初赛 TOP300 改进计划（精简版）

## 当前评分预估

| 维度 | 当前分数 | 目标分数 | 提升幅度 |
|---|---|---|---|
| 创新性 | 7.5/10 | 8.5/10 | +10% |
| 实用性 | 8/10 | 8.5/10 | +6% |
| 完成度 | 8/10 | 8.5/10 | +6% |
| 美观度 | 8/10 | 9/10 | +12% |

---

## 改进项（按优先级排序）

### P0: 深色主题（美观度 +10%，工作量小）

**效果**：评审第一眼看到的视觉冲击，提升专业感

**实施步骤**：
1. 在 `app/globals.css` 中添加 `dark:` 前缀的 Tailwind 样式
2. 在 `components/Navbar.tsx` 添加深色模式切换按钮（使用 localStorage 持久化）
3. 修改 `components/ClientProviders.tsx` 包裹深色模式上下文

**涉及文件**：
- `app/globals.css`
- `components/Navbar.tsx`
- `components/ClientProviders.tsx`

---

### P0: 移动端深度优化（完成度 +8%，工作量中）

**效果**：确保评审在手机上也能流畅体验

**实施步骤**：
1. 检查 Dashboard 卡片在移动端的布局，改为单列显示
2. 确保所有按钮点击区域 ≥44px
3. 优化输入框在移动端的体验
4. 测试汉堡菜单在移动端的交互

**涉及文件**：
- `app/dashboard/page.tsx`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/Navbar.tsx`

---

### P1: 科研决策雷达图（创新性 +8%，工作量中）

**效果**：可视化 Idea 的三维评估，展示创新性

**实施步骤**：
1. 在 `app/focus/page.tsx` 添加 SVG 雷达图组件
2. 绑定 Idea 的 survivalScore、confidenceScore、falsificationStrength 数据
3. 添加图例说明

**涉及文件**：
- `app/focus/page.tsx`

---

### P1: 页面过渡动画（美观度 +6%，工作量小）

**效果**：页面切换更流畅，提升交互体验

**实施步骤**：
1. 在 `app/globals.css` 添加路由过渡动画
2. 在每个页面组件上应用过渡类名
3. 添加按钮点击、卡片 hover 的微动画

**涉及文件**：
- `app/globals.css`
- 各页面组件

---

### P2: 研究趋势卡片（创新性 +6%，工作量小）

**效果**：展示研究方向的热度趋势，提升专业性

**实施步骤**：
1. 在 `lib/mockData.ts` 中为每个 ResearchArea 添加趋势数据（hot/trending/stable）
2. 在 `app/areas/page.tsx` 的卡片上添加趋势标签和图标

**涉及文件**：
- `lib/mockData.ts`
- `app/areas/page.tsx`

---

### P2: 数据导出功能（完成度 +5%，工作量小）

**效果**：增强数据管理能力，提升完成度

**实施步骤**：
1. 在 `context/AppContext.tsx` 添加导出方法
2. 在 Dashboard 或设置区域添加导出按钮

**涉及文件**：
- `context/AppContext.tsx`
- `app/dashboard/page.tsx`

---

## 实施顺序

```
Step 1: 深色主题（1小时）
Step 2: 页面过渡动画（30分钟）
Step 3: 移动端优化（1.5小时）
Step 4: 科研决策雷达图（1小时）
Step 5: 研究趋势卡片（30分钟）
Step 6: 数据导出功能（30分钟）
```

总计约 **5 小时**，可在一天内完成。

---

## 风险评估

| 风险 | 应对 |
|---|---|
| 深色模式兼容性问题 | 优先测试核心页面（首页、Dashboard、Focus） |
| 雷达图渲染问题 | 使用纯 SVG 实现，不依赖第三方图表库 |
| 移动端布局问题 | 使用 Tailwind 响应式类，逐步调整 |

---

**核心策略**：优先完成 P0 级别（深色主题 + 移动端优化），这两个改进能在最短时间内带来最大的评分提升。
