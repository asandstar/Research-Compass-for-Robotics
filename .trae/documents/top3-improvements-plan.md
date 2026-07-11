# Top 3 优先级提升计划

> 从用户价值、投入产出比、长期健康度三个维度，选出最值得优先改进的三个方向。

---

## 🎯 优先级排序依据

| 维度 | 权重 | 说明 |
|------|------|------|
| **用户痛点强度** | 40% | 用户有多痛？不解决会不会流失？ |
| **投入产出比** | 30% | 花多少功夫？能带来多大价值？ |
| **架构可行性** | 20% | 在当前纯前端架构下能不能做？ |
| **长期价值** | 10% | 对项目长期发展有没有帮助？ |

---

## 🥇 第一优先级：数据安全保障体系

### 为什么是第一？

- **用户最大的信任问题**：用了半年的研究数据，清个缓存就没了？用户不敢深度使用
- **纯前端架构的死穴**：localStorage 容量只有 5MB，数据多了就存不下
- **没有安全感就没有付费意愿**：连数据都存不住，谁会付费？

### 当前现状

- 数据存在 `localStorage`，key 为 `research-compass-data-v14`
- 有手动 JSON 导出功能（Dashboard 右下角）
- 没有自动备份、没有恢复机制、没有容量预警
- 5MB 容量上限，论文多了很快就不够

### 改进方案

#### 1.1 存储引擎升级：localStorage → IndexedDB

- 使用 IndexedDB 替代 localStorage 作为主存储
- 容量从 5MB 提升到几百 MB（甚至 GB 级）
- 保留 localStorage 作为元数据缓存（主题偏好、活跃 Idea 等轻量数据）
- 做数据迁移：首次加载时自动从 localStorage 迁移到 IndexedDB

**涉及文件**：
- 新增 `lib/storage/indexedDB.ts` — IndexedDB 封装层
- 修改 `lib/storage.ts` — 兼容旧数据迁移
- 修改 `context/AppContext.tsx` — 初始化逻辑适配新存储

#### 1.2 自动备份机制

- **自动导出**：每次数据变更后，自动生成 JSON 备份到 IndexedDB
- **版本管理**：保留最近 10 个历史版本，用户可以回滚到任意版本
- **定时提醒**：使用超过 7 天且从未导出过，弹 Toast 提醒用户手动导出备份

**涉及文件**：
- 新增 `components/backup/BackupManager.tsx` — 备份管理组件
- 新增 `lib/backup.ts` — 备份逻辑
- 修改 `context/AppContext.tsx` — 集成备份逻辑

#### 1.3 数据导入增强

- **导入前预览**：导入 JSON 前先展示数据统计（多少篇论文、多少个 Idea），让用户确认
- **合并模式**：支持「覆盖」和「合并」两种导入模式
- **冲突处理**：合并时检测 ID 冲突，让用户选择保留哪版

**涉及文件**：
- 新增 `components/backup/ImportDialog.tsx` — 导入对话框
- 修改 `context/AppContext.tsx` — 增加 importData 选项

#### 1.4 容量指示器

- 设置页面显示已用空间 / 可用空间
- 超过 80% 时警告，超过 95% 时强提醒

**涉及文件**：
- 新增 `components/settings/StorageIndicator.tsx`

---

## 🥈 第二优先级：新手引导 / Onboarding

### 为什么是第二？

- **功能太多，入门门槛高**：10+ 个页面，新用户进来不知道先干嘛
- **没有引导 = 低留存**：用户不知道产品价值，逛一圈就走了
- **纯前端产品，获客成本高**：每一个进来的用户都要尽量留住

### 当前现状

- Dashboard 有个「快速开始」卡片（刚被我们删了 😅）
- 空状态有引导，但不够系统
- 没有首次使用引导流程
- 没有产品导览（feature tour）

### 改进方案

#### 2.1 首次使用引导流程（Welcome Wizard）

用户第一次打开时，展示一个 3-4 步的引导弹窗：

1. **欢迎页**：产品定位 + 核心价值（30 秒了解这是啥）
2. **选择身份**：本科生 / 研究生 / 研究员 / 工程师 — 对应不同的推荐路径
3. **快速设置**：是否加载示例数据？是否开启暗黑模式？
4. **第一步行动**：引导用户添加第一篇论文 / 创建第一个 Idea

**涉及文件**：
- 新增 `components/onboarding/WelcomeWizard.tsx`
- 修改 `app/page.tsx` — 首次访问时展示引导

#### 2.2 功能导览（Feature Tour）

进入关键页面时，用气泡提示介绍核心功能：

- **论文页**：「点击这里添加你的第一篇论文」
- **Idea 页**：「三维评估体系帮你判断方向值不值得做」
- **聚焦页**：「这里是你的深度工作区，所有操作围绕当前聚焦的 Idea」

支持「跳过」和「不再提示」。

**涉及文件**：
- 新增 `components/onboarding/FeatureTour.tsx`
- 修改 `app/papers/page.tsx`
- 修改 `app/ideas/page.tsx`
- 修改 `app/focus/page.tsx`

#### 2.3 空状态优化

所有空状态都要做到：
- ✅ 明确告诉用户这里是干嘛的
- ✅ 告诉用户第一步该做什么
- ✅ 有明确的行动按钮（不是干巴巴的「暂无数据」）
- ✅ 有学习资源链接（相关工作流/学习路径）

**涉及文件**：
- 优化 `components/ui/EmptyState.tsx` — 增加更多配置项
- 检查所有页面的空状态，确保都有行动引导

#### 2.4 Dashboard 「快速开始」卡片回归

之前删了的快速开始卡片，加回来但换个形式：
- 做成「进度条」样式：4 步完成首次使用
- 每完成一步就打勾
- 全部完成后卡片自动消失（或折叠）

**涉及文件**：
- 修改 `app/page.tsx` — 增加 OnboardingProgress 组件
- 新增 `components/dashboard/OnboardingProgress.tsx`

---

## 🥉 第三优先级：工程化基础建设

### 为什么是第三？

- **现在不改，以后更难改**：代码量越大，加测试的成本越高
- **没有测试 = 敢怒不敢言**：改个功能怕影响别的，不敢重构
- **团队协作的基础**：未来如果有贡献者，没有规范会很痛苦

### 当前现状

- 零测试（单元测试、E2E 测试都没有）
- ESLint 用的是 Next.js 默认配置，规则很松
- 没有 Prettier 统一代码风格
- 没有 Husky + lint-staged 提交前检查
- 没有错误边界（Error Boundary）
- 没有 Sentry 之类的错误监控

### 改进方案

#### 3.1 代码规范工具链

- **Prettier**：统一代码格式化风格
- **ESLint 增强**：加 `eslint-plugin-react`、`eslint-plugin-react-hooks`、`eslint-plugin-import`
- **Husky + lint-staged**：提交前自动 lint + format
- **TypeScript 严格模式**：开启 `strict: true`（如果没开的话）

**涉及文件**：
- 新增 `.prettierrc`、`.prettierignore`
- 修改 `.eslintrc.json`（或 `next.config.js` 里的配置）
- 修改 `package.json` — 加 scripts 和 devDependencies
- 新增 `.husky/` 目录及钩子

#### 3.2 单元测试基础建设

- 引入 **Vitest**（比 Jest 快，和 Vite 生态更搭）
- 给纯函数逻辑加测试：
  - `lib/stateCalculator.ts` — 状态计算
  - `lib/nextActionCalculator.ts` — 下一步行动推荐
  - `lib/storage.ts` — 存储工具函数
  - `lib/types.ts` 相关的类型守卫
- 配置测试覆盖率门槛（比如核心逻辑覆盖率 > 80%）

**涉及文件**：
- 新增 `vitest.config.ts`
- 新增 `__tests__/` 目录及测试文件
- 修改 `package.json` — 加 test 脚本

#### 3.3 React 错误边界

- 给全局加 Error Boundary，防止局部错误导致整个应用白屏
- 错误边界内展示友好的错误提示 + 「刷新重试」按钮
- 开发环境下展示错误详情，生产环境只展示通用提示

**涉及文件**：
- 新增 `components/ErrorBoundary.tsx`
- 修改 `app/layout.tsx` 或 `app/ClientProviders.tsx`

#### 3.4 组件文档（可选）

- 用 Storybook 建立组件库文档
- 基础 UI 组件（Button/Card/Input 等）都有文档和示例
- 方便未来的开发者快速上手

---

## 📊 三个方向对比

| 优先级 | 方向 | 预计工作量 | 用户价值 | 技术价值 | 商业价值 |
|--------|------|-----------|---------|---------|---------|
| 🥇 | 数据安全 | 中 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 🥈 | 新手引导 | 小-中 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 🥉 | 工程化 | 中-大 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 建议的实施顺序

### Phase 1：小步快跑（1-2 天）
- 2.4 Dashboard 快速开始进度条
- 2.3 空状态优化
- 3.3 错误边界

### Phase 2：核心价值（3-5 天）
- 1.1 IndexedDB 存储升级
- 1.2 自动备份机制
- 2.1 首次使用引导

### Phase 3：长期建设（持续）
- 1.3 数据导入增强
- 2.2 功能导览
- 3.1 代码规范
- 3.2 单元测试
