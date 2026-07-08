# 内容可信核验与修正计划

## 目标

对 Paper Intelligence 页面（8 篇论文卡片）和 Learning Paths 页面（约 80 条论文链接）进行事实性核验，修正错误链接和不准确内容，并将"Draft · 待核验"标签更新为"已核验"。

## 当前状态分析

### Paper Intelligence（paperIntelligence.ts）

**8 篇论文卡片**：

| # | id | 标题 | 核验状态 |
|---|-----|------|---------|
| 1 | rt-1 | RT-1: Robotics Transformer... | ✅ 标题正确，内容准确 |
| 2 | rt-2 | RT-2: Vision-Language-Action... | ✅ 标题正确，内容准确 |
| 3 | openvla | OpenVLA: An Open-Source... | ✅ 标题正确，内容准确 |
| 4 | pi0 | π0: A Vision-Language-Action Flow Model... | ❓ 需核验 arXiv ID |
| 5 | pi05 | π0.5: a VLA Model with Open-World... | ❓ 需核验 arXiv ID |
| 6 | diffusion-policy | Diffusion Policy: Visuomotor... | ✅ 标题正确（arXiv: 2303.04137） |
| 7 | libero | LIBERO: Benchmarking Knowledge Transfer... | ❓ 需核验 arXiv ID |
| 8 | robomme | RoboMME: A Comprehensive Benchmark... | ❓ 需核验论文是否存在 |

**问题**：
- `PaperIntelligence` 接口不含 `arxivUrl` 字段，无法直接跳转到原论文
- "Draft · 待核验" 标签在 `PaperIntelligenceCard.tsx` 第 34-37 行硬编码，所有卡片统一显示
- 页面级提示横幅在 `app/papers/intelligence/page.tsx` 第 22-31 行

### Learning Paths（learningPaths.ts）

**约 80 条论文链接**，已确认的错误：

| 行号 | 问题 |
|------|------|
| 278 | TEACh URL `2004.01691` 明显错误（应为 2022 年论文） |
| 304-305 | 两条不同标题指向同一 URL `1805.08328` |
| 51 | π0 arXiv ID `2403.00385` 需核验 |
| 52 | π0.5 arXiv ID `2407.14438` 需核验 |
| 53 | Gemini Robotics arXiv ID `2406.10620` 需核验 |
| 104 | UniSim arXiv ID 时间不符 |
| 105 | Genie arXiv ID 需核验 |
| 约 15+ 条 | 标题与 arXiv ID 对应关系存疑 |

---

## 实施步骤

### Step 1: 核验 Paper Intelligence 8 篇论文

**方法**：使用 WebSearch 搜索每篇论文的真实 arXiv 页面，确认标题、作者、年份、会议。

**需要重点核验的论文**：
1. π0 — 搜索 "Physical Intelligence π0 arxiv"
2. π0.5 — 搜索 "Physical Intelligence π0.5 arxiv"
3. LIBERO — 搜索 "LIBERO benchmark lifelong robot learning arxiv"（已知可能是 NeurIPS 2023）
4. RoboMME — 搜索 "RoboMME benchmark robotic multi-modal evaluation arxiv"

**已确认正确的论文**（基于已有知识）：
1. RT-1 — arXiv: 2212.06817, RSS 2023
2. RT-2 — arXiv: 2307.15818, CoRL 2023
3. OpenVLA — arXiv: 2406.09246, 2024
4. Diffusion Policy — arXiv: 2303.04137, RSS 2023

**修改内容**：
- 为 `PaperIntelligence` 接口添加 `arxivUrl` 和 `verified: boolean` 字段
- 为每篇论文补充正确的 arXiv 链接
- 核验分析字段中的事实性声明（如"700+ 任务"、"97% 成功率"等）
- 修正不准确的内容

**涉及文件**：
- `lib/intelligence/paperIntelligence.ts` — 添加 arxivUrl 字段、修正内容
- `components/intelligence/PaperIntelligenceCard.tsx` — 添加 arXiv 链接、根据 verified 字段动态显示标签
- `app/papers/intelligence/page.tsx` — 更新草稿提示横幅文案

### Step 2: 核验 Learning Paths 论文链接

**方法**：使用 WebSearch 逐条核验标题与 arXiv ID 的对应关系。

**已知错误（直接修正）**：
1. 第 278 行 TEACh：`2004.01691` → 搜索正确 arXiv ID
2. 第 304-305 行：两条不同标题指向同一 URL，需分拆

**需要批量核验的链接**：
- 按学习路径分组，逐条搜索核验
- 重点关注 π0、π0.5、Gemini Robotics、UniSim、Genie 等较新论文
- 核验约 80 条链接

**涉及文件**：
- `lib/learning/learningPaths.ts` — 修正错误链接和标题

### Step 3: 更新"待核验"标签

**Paper Intelligence**：
- `PaperIntelligenceCard.tsx`：将硬编码的 "Draft · 待核验" 改为根据 `verified` 字段动态渲染
  - `verified: true` → 显示 "已核验"（绿色标签）
  - `verified: false` → 显示 "待核验"（橙色标签）
- `app/papers/intelligence/page.tsx`：更新草稿提示横幅
  - 如果全部核验完成，将提示文案改为"内容已核验，仅供参考"

**Learning Paths**：
- 该页面本身没有"待核验"标签，修正链接即可

### Step 4: 构建验证

- 运行 `npm run build` 确保所有修改通过编译
- 检查页面渲染是否正常

---

## 涉及文件清单

| 文件 | 修改内容 |
|------|---------|
| `lib/intelligence/paperIntelligence.ts` | 添加 arxivUrl/verified 字段、修正内容 |
| `components/intelligence/PaperIntelligenceCard.tsx` | 动态标签、arXiv 链接渲染 |
| `app/papers/intelligence/page.tsx` | 更新草稿提示横幅文案 |
| `lib/learning/learningPaths.ts` | 修正错误论文链接和标题 |

---

## 核验方法

由于项目约束为不接入真实 AI API，核验方法为：
1. 使用 WebSearch 搜索每篇论文的 arXiv 页面
2. 使用 WebFetch 获取 arXiv 摘要页确认标题和作者
3. 基于搜索结果修正链接和内容
4. 对于已确认正确的论文，直接标记为已核验

## 风险与应对

| 风险 | 应对 |
|------|------|
| 部分论文无法找到 arXiv 链接 | 保留原链接或标注"未找到 arXiv 链接" |
| 论文内容分析可能有误 | 保留"仅供参考"提示，不声称完全准确 |
| 核验工作量较大 | 优先核验已知错误，再逐步核验其他 |
| RoboMME 可能不是真实论文 | 如果确认不存在，替换为其他真实 benchmark 论文 |
