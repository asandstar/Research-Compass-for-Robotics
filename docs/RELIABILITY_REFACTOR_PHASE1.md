# 可靠性重构 Phase 1 报告

## 概述

本阶段专注于修复核心数据可靠性问题，包括：彻底停止虚构论文信息、修复 Idea/Evidence/MVE 状态同步、修复最新 MVE 判断、建立统一数据规范化入口、增加基础工程验证。

## 修改文件列表

### 核心库文件
- `lib/mockAI.ts` — 删除 ARXIV_PAPER_TEMPLATES 虚构模板，重写 mockFetchArxivPaper 仅返回链接解析结果
- `lib/stateCalculator.ts` — 重写状态计算逻辑，新增 getLatestMVE/getLatestCompletedMVE/getNextPendingMVE
- `lib/storage.ts` — 新增 normalizeStoredData 统一数据规范化入口 + DataRepairReport
- `lib/id.ts` — 新增统一 ID 生成（crypto.randomUUID + fallback）

### 类型定义
- `lib/types.ts` — Paper 新增 metadataStatus / verificationStatus 字段

### 组件
- `components/paper/AddPaperModal.tsx` — 修改 arXiv 解析为链接识别，添加手动填写提示

### 状态管理
- `context/AppContext.tsx` — 所有修改 Idea 的 reducer 调用统一计算函数，删除 CREATE_MVE 状态强制覆盖

### 工程配置
- `package.json` — 新增 typecheck/test/test:run/validate 脚本
- `eslint.config.js` — 新增 ESLint flat config
- `.eslintrc.json` — 已废弃（使用 flat config）
- `vitest.config.ts` — Vitest 配置
- `.github/workflows/deploy.yml` — CI 新增 typecheck/lint/test:run 步骤

### 测试文件
- `lib/mockAI.test.ts` — arXiv 解析功能测试
- `lib/stateCalculator.test.ts` — 状态计算逻辑测试
- `lib/storage.test.ts` — 数据规范化测试

## 每个 Bug 的根因与修复方式

### 1. arXiv 虚构数据问题

**根因**：`mockFetchArxivPaper` 使用 `ARXIV_PAPER_TEMPLATES` + `hashString` 根据 arXiv ID 哈希值生成虚构的标题、作者、venue、实验结果、方法和贡献，用户可能误以为是真实解析结果。

**修复方式**：
- 完全删除 `ARXIV_PAPER_TEMPLATES` 及所有基于模板的论文元信息生成逻辑
- `mockFetchArxivPaper` 现在仅返回链接解析结果（arxivId、arxivUrl、pdfUrl）
- 新增 `metadataStatus: 'unavailable'` 和 `verificationStatus: 'unverified'` 标记
- AddPaperModal 中添加明确提示，告知用户需手动填写论文内容

### 2. Idea 状态同步错误

**根因**：多个 reducer 分支（ADD_EVIDENCE、UPDATE_IDEA_CARD、CREATE_MVE、UPDATE_MVE_RESULT）分别处理 Idea 更新，部分分支只更新了原始数据字段，未触发分数和状态重算，导致分数陈旧、状态不一致。

**修复方式**：
- 统一使用 `updateIdeaCardWithCalculatedState` 纯函数作为计算入口
- ADD_EVIDENCE：添加证据后立即重新计算 survivalScore、confidenceScore、falsificationStrength、status、updatedAt
- UPDATE_IDEA_CARD：用户保存 Idea 后重新计算所有派生状态
- CREATE_MVE：删除强制 `status: 'active'` 覆盖，由统一计算函数决定状态
- UPDATE_MVE_RESULT：MVE 结果变更后通过统一计算函数更新 Idea

### 3. pending MVE 错误加分

**根因**：`calculateSurvivalScore` 中 pending MVE 贡献了 +5 分，这意味着仅设计实验（尚未执行）就会提高 Idea 的存活度，语义不合理。

**修复方式**：
- pending MVE 贡献改为 0 分
- 仅 passed MVE 增加存活度（+15/个）
- failed MVE 降低存活度（-20/个）
- 同时修复了 `calculateConfidenceScore` 中 `falsificationStrength` 权重问题：从直接加原值（0-100）改为乘以 0.1，避免 Confidence Score 虚高

### 4. 最新 MVE 判断错误

**根因**：依赖数组插入顺序判断"最新 MVE"，而数组顺序可能因各种操作改变，不具备时间语义可靠性。

**修复方式**：
- 新增 `getLatestMVE(ideaId, mves)`：按 `createdAt` 降序，返回时间最新的 MVE
- 新增 `getLatestCompletedMVE(ideaId, mves)`：仅包含 passed/failed，按 createdAt 降序
- 新增 `getNextPendingMVE(ideaId, mves)`：返回创建时间最早的 pending MVE（用于"下一个要执行的实验"）
- 修改所有依赖最新 MVE 的逻辑，统一使用上述工具函数

### 5. 数据引用完整性问题

**根因**：缺少统一的数据规范化入口，localStorage 加载、IndexedDB 加载、备份恢复走不同路径，可能存在无效引用（孤立 MVE、无效 Paper 引用、无效 Area 引用、无效关系等）。

**修复方式**：
- 新增 `normalizeStoredData(rawData)` 作为统一规范化入口
- 新增 `DataRepairReport` 记录修复操作数量
- 规范化流程包括：旧字段迁移、默认字段补充、重复 ID 去除、MVE.ideaCardId 校验、Idea.sourcePaperIds 校验、Idea/Paper.areaIds 校验、Paper.inspiredIdeaIds 校验、IdeaRelationship 两端校验
- 所有数据加载和恢复路径均经过同一规范化入口

## 数据迁移说明

### Paper 新增字段
- `metadataStatus?: 'manual' | 'available' | 'unavailable'`
- `verificationStatus?: 'verified' | 'unverified'`

### 默认值规则
- 用户手动创建的论文：`metadataStatus: 'manual'`
- 仅解析出 arXiv URL：`metadataStatus: 'unavailable'`
- 旧数据：默认 `metadataStatus: 'manual'`
- 旧数据：默认 `verificationStatus: 'unverified'`

### 兼容性
- 旧 localStorage 数据可正常加载，自动补充默认字段
- 旧 IndexedDB 数据可正常加载
- 旧备份数据可正常恢复，自动修复无效引用

## 分数变化说明

### Survival Score（存活度）
- **之前**：pending MVE +5 分，passed +10，failed -15
- **现在**：pending MVE +0 分，passed +15，failed -20
- **理由**：创建实验只表示设计了验证方案，实验尚未执行时不应提高支持程度

### Confidence Score（置信度）
- **之前**：`score += card.falsificationStrength`（直接加入 0-100 的原值）
- **现在**：`score += card.falsificationStrength * 0.1`
- **理由**：Falsification Strength 是独立维度（证伪潜力），不应直接以原值加入置信度。乘以 0.1 保留微弱正相关，同时避免虚高。

### Falsification Strength（证伪强度）
- 计算逻辑保持不变
- 仍作为独立维度在 UI 中显示
- 完整语义重构留到第二阶段

## 测试结果

### 测试概况
- 测试文件：4 个（lib/mockAI.test.ts、lib/stateCalculator.test.ts、lib/storage.test.ts、context/appReducer.test.ts）
- 测试用例：76 个
- 全部通过 ✅

### 测试覆盖
1. **parseArxivUrl** — abs URL、pdf URL、pdf with .pdf 后缀、非 arXiv URL、旧风格 ID
2. **arXiv 解析不返回虚构数据** — 不生成标题、不生成实验结果、返回正确 metadata status
3. **ADD_EVIDENCE 后重新计算分数** — 支持/反对证据均触发分数更新
4. **CREATE_MVE 不强制覆盖 Idea 状态** — 状态由计算函数决定
5. **pending MVE 不提高 Survival Score** — pending 贡献为 0
6. **最新 MVE 按 createdAt 判断** — getLatestMVE/getLatestCompletedMVE
7. **getNextPendingMVE 返回最早待执行实验** — 按创建时间升序
8. **备份数据经过 normalizeStoredData** — 空数据、有效数据、修复场景
9. **孤立 MVE 被识别并修复** — ideaCardId 不存在的 MVE 被移除
10. **删除 Paper 后引用清理** — Idea.sourcePaperIds 中引用被移除
11. **删除 Idea 后关联数据清理** — MVE、Relationship、inspiredIdeaIds 清理
12. **旧 Paper 数据获得 metadataStatus 默认值** — 自动补充 manual/unverified

## 工程验证结果

| 命令 | 状态 |
|------|------|
| `npm run typecheck` | ✅ 通过 |
| `npm run lint` | ✅ 通过 |
| `npm run test:run` | ✅ 通过（76 tests） |
| `npm run build` | ✅ 通过 |
| `npm run validate` | ✅ 全部通过 |

### CI 流程
GitHub Actions 部署前依次执行：
1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test:run`
5. `npm run build`

只有全部通过后才部署。

## 与原计划的差异

1. **ESLint 配置**：ESLint v10 flat config 与 Next.js 14 的 `next lint` 不兼容，已降级为 ESLint 8 + eslint-config-next 14.2 + `.eslintrc.json`（详见"提交前审计"章节）
2. **ID 统一**：已创建 `lib/id.ts`，但部分旧的 `generateId` 调用（如 mockAI 中的内部函数）保留以减少改动范围，核心业务创建路径已统一

## 尚未处理的问题（留到后续阶段）

1. Confidence Score 与 Falsification Strength 的完整语义重构
2. 回收站/软删除功能
3. 跨标签页同步
4. PWA 支持
5. 数据导入功能
6. Zustand 状态管理迁移
7. 更多测试覆盖（组件测试、E2E 测试）
8. Toast 通知与数据规范化的集成（已在审计阶段完成）

---

## 提交前审计

本章节记录第一阶段可靠性重构在提交前的审计与补修内容。审计基于 9 个维度进行：改动范围、备份恢复提示、Legacy Mock 遗留数据、ESLint 配置、测试调用链覆盖、arXiv URL 边界、完整验证、CI 工作流、技术债。

### 1. 补修内容

审计阶段共补修 4 项问题：

| 补修项 | 问题 | 修复方式 |
|--------|------|----------|
| 备份恢复报告不可见 | `restoreBackup` 仅 console 输出，用户无法感知修复 | 改为返回 `Promise<DataRepairReport>`，由 BackupManager 通过 Toast 显示摘要 |
| 旧版 arXiv Mock 遗留数据 | 旧 `ARXIV_PAPER_TEMPLATES` 生成的虚构论文仍保存在用户存储中 | 新增 `detectLegacyMockPaper` 保守检测，标记 `dataProvenance: 'legacy_mock'`，不删除数据 |
| ESLint 配置过度放宽 | flat config 关闭 11+ 核心规则，lint 形式化通过 | 降级为 ESLint 8 + eslint-config-next 14.2，恢复标准规则集 |
| 测试未覆盖 reducer 调用链 | 仅测试纯计算函数，未测试 ADD_EVIDENCE 等 reducer 分支 | 将 reducer 提取至 `context/appReducer.ts`，新增 `context/appReducer.test.ts` 直接测试 reducer |

### 2. Legacy Mock 数据处理策略

**问题**：第一阶段删除了 `ARXIV_PAPER_TEMPLATES` 阻止未来生成虚构信息，但旧版本已生成的模拟论文仍保存在用户 localStorage/IndexedDB 中，包含虚构标题、作者、实验结果。

**策略**：保守检测 + 标记 + 不删除。

- **检测函数** `detectLegacyMockPaper(paper: Partial<Paper>): boolean`
  - 必须同时匹配：(a) 标题在已知旧模板标题集合 `LEGACY_MOCK_TITLES`（18 条）中；(b) `evidence.keyResults` 包含全部 3 条旧模板固定实验结果字符串（`性能提升15-20%`、`推理速度提升2-3倍`、`泛化能力增强`）
  - 不使用模糊匹配，不误伤用户手动录入的论文
- **新增字段** `dataProvenance?: 'manual' | 'link_only' | 'legacy_mock' | 'demo'`
  - `manual`：用户新手动录入
  - `link_only`：仅识别 arXiv 链接
  - `legacy_mock`：命中旧模板
  - `demo`：项目内置示例论文
- **迁移行为**：命中后设置 `metadataStatus: 'unavailable'`、`verificationStatus: 'unverified'`、`dataProvenance: 'legacy_mock'`，**不删除任何字段内容**
- **UI 提示**：PaperCard 在 compact 和 full 视图中对 `legacy_mock` 显示："该记录可能来自旧版模拟解析，请核验论文信息。"
- **幂等性**：重复执行迁移结果一致（已验证）

### 3. 备份恢复提示实现

**实现方式**：AppContext 不直接依赖 ToastContext（保持 Provider 层级清洁），而是将 `DataRepairReport` 作为返回值传递给调用方。

```
BackupManager (ToastContext 内)
  └─ await restoreBackup(id) → DataRepairReport
       └─ AppContext.restoreBackup()
            └─ normalizeStoredData() → { data, report }
```

- `restoreBackup` 签名改为 `Promise<DataRepairReport>`
- BackupManager 调用后判断 `isRepairReportEmpty(report)`：
  - 非空：显示 `备份已恢复，并修复 N 条无效引用、移除 M 个孤立实验。`
  - 空：显示 `备份恢复成功`
- AppContext 保持纯粹，不引入 Toast 依赖

### 4. ESLint 配置和规则集

**问题**：原 ESLint v10 flat config 关闭了 `no-unused-vars`、`react-hooks/rules-of-hooks`、`@typescript-eslint/no-explicit-any` 等 11+ 核心规则，导致 lint 形式化通过。

**修复**：降级为 ESLint 8 + eslint-config-next 14.2 兼容组合。

| 包 | 版本 |
|----|------|
| eslint | ^8.57.1 |
| eslint-config-next | ^14.2.3 |
| @typescript-eslint/eslint-plugin | ^7.2.0 |
| @typescript-eslint/parser | ^7.2.0 |

**配置文件** `.eslintrc.json`：

```json
{
  "extends": "next/core-web-vitals",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@next/next/no-img-element": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-const": "warn",
    "no-empty": "warn"
  }
}
```

**启用的规则集**（来自 `next/core-web-vitals`）：
- TypeScript 语法解析（通过 @typescript-eslint/parser）
- React Hooks 规则（`react-hooks/rules-of-hooks`、`react-hooks/exhaustive-deps`）
- 未使用变量（`@typescript-eslint/no-unused-vars`: warn）
- 无效 Promise 使用（`no-return-await` 等）
- React 和 Next.js 常见问题（`@next/next/*` 规则集）

**关闭/降级的规则及原因**：
- `@next/next/no-img-element: off` — 静态导出场景下 `<img>` 性能影响可忽略
- `@typescript-eslint/no-explicit-any: off` — MVP 阶段允许 any，后续收紧
- `@typescript-eslint/no-unused-vars: warn`、`prefer-const: warn`、`no-empty: warn` — 降为警告而非 error，保留可见性

**lint 脚本**：`next lint`（Next.js 14 内置，使用 `.eslintrc.json`）。CI 在 build 前独立执行 lint，失败即终止部署。

### 5. 测试是否覆盖 reducer 调用链

**重构**：将 reducer 和 Action 类型从 `AppContext.tsx` 内部提取到 `context/appReducer.ts`，使 reducer 可被直接测试，无需 React Context 或组件挂载。

**新增测试文件** `context/appReducer.test.ts` 覆盖：

| Reducer Action | 验证项 |
|----------------|--------|
| `ADD_EVIDENCE` | Evidence 被加入；survivalScore/confidenceScore 重算；status 可能更新；updatedAt 更新 |
| `UPDATE_IDEA_CARD` | 添加 prediction/failureCondition/confounder 后 falsificationStrength 更新；confidenceScore 更新；status 用最新数据计算 |
| `CREATE_MVE` | 原为 promising 的 Idea 不被强制改为 active；pending MVE 不增加 Survival Score；MVE 被正确加入 |
| `UPDATE_MVE_RESULT` | pending→passed 后重算；pending→failed 后重算；对应 Idea 正确更新 |
| `DELETE_PAPER` | Idea.sourcePaperIds 中引用被清理 |
| `DELETE_IDEA_CARD` | MVE、Relationship、Paper.inspiredIdeaIds 级联清理 |
| `DELETE_AREA` | Paper.areaIds 和 Idea.areaIds 中引用被清理 |

**备份恢复测试**（`lib/storage.test.ts`）：验证旧数据经过 normalizeStoredData、孤立 MVE 被移除、无效引用被修复、返回正确 DataRepairReport。

### 6. arXiv URL 边界测试

`lib/mockAI.test.ts` 新增 9 个边界用例：

| 输入 | 期望 |
|------|------|
| `https://arxiv.org/abs/2607.12345v2` | arxivId 含 v2 |
| `https://arxiv.org/pdf/2607.12345v2.pdf` | arxivId 含 v2，不含 .pdf |
| `https://arxiv.org/pdf/2607.12345.pdf` | arxivId 不含 .pdf |
| `http://arxiv.org/abs/2607.12345` | 正常解析 |
| `arxiv.org/abs/2607.12345`（无协议） | 正常解析 |
| `https://example.com/2607.12345` | 返回空 |
| 空字符串 | 返回空 |
| 非法字符串 | 返回空 |
| 任意输入 | 不抛出异常 |

### 7. 完整验证结果

**环境**：Node v22.23.1、npm 10.9.8

| 命令 | 结果 |
|------|------|
| `npm ci` | ✅ 通过 |
| `npm run typecheck` | ✅ 通过，无错误 |
| `npm run lint` | ✅ 通过，约 50 条 warning |
| `npm run test:run` | ✅ 4 文件 76 用例全部通过 |
| `npm run build` | ✅ 生成 46 个静态页面 |
| `npm run validate` | ✅ 全部通过 |

**lint warning 概况**（均为真实问题，非抑制）：
- 未使用变量（`@typescript-eslint/no-unused-vars`）
- `prefer-const`（可改为 const 的变量）
- `no-empty`（空代码块）
- `react-hooks/exhaustive-deps`（useEffect 依赖项）

这些 warning 不阻塞构建，但已在审计中记录。后续阶段应逐步清理。

**CI 工作流顺序**（`.github/workflows/deploy.yml`）：
```
npm ci → npm run typecheck → npm run lint → npm run test:run → npm run build → deploy
```
每步独立 step，任一失败即阻止部署。

### 8. 仍然存在的技术债

1. lint warning 约 50 条（未使用变量、prefer-const、exhaustive-deps），需逐步清理
2. Confidence Score 与 Falsification Strength 的完整语义重构（留第二阶段）
3. `lib/id.ts` 已统一核心路径，但 mockAI 内部仍有旧 `generateId` 调用
4. 组件测试和 E2E 测试缺失（当前仅覆盖 lib 和 reducer 层）
5. 回收站/软删除功能未实现
6. 跨标签页同步未实现
7. PWA 支持未实现

### 9. 本次准备提交的文件列表

**修改文件（14）**：
- `.github/workflows/deploy.yml`
- `README.md`
- `components/backup/BackupManager.tsx`
- `components/paper/AddPaperModal.tsx`
- `components/paper/PaperCard.tsx`
- `context/AppContext.tsx`
- `lib/mockAI.ts`
- `lib/nextActionCalculator.ts`
- `lib/stateCalculator.ts`
- `lib/storage.ts`
- `lib/types.ts`
- `next.config.js`
- `package-lock.json`
- `package.json`

**新增文件（9）**：
- `.eslintrc.json`
- `context/appReducer.ts`
- `context/appReducer.test.ts`
- `docs/RELIABILITY_REFACTOR_PHASE1.md`
- `lib/id.ts`
- `lib/mockAI.test.ts`
- `lib/stateCalculator.test.ts`
- `lib/storage.test.ts`
- `vitest.config.ts`

**排除文件（1）**：
- `SYSTEM_ARCHITECTURE.md` — 与可靠性重构无关的独立文档，不纳入本次提交
