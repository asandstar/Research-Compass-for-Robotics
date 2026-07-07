# Research Compass Redesign Plan: Data-Centric → Decision-Centric

## Summary

Redesign Research Compass from a flat, data-centric research management tool into a single-thread, decision-centric research execution system. The core transformation: replace the 5-equal-item Dashboard with a **Focus Workspace** that surfaces exactly one "Next Best Action" for the user's single active Idea, with all secondary pages (Papers, MVE Log, Areas) funneling back into Focus.

**Scope**: 11 new files, 9 modified files, 2 deleted files. Data model, state management, mock AI, and storage are preserved unchanged.

## Current State Analysis

**What exists**: Next.js 14 App Router (static export), TypeScript, Tailwind CSS, React Context + useReducer, localStorage persistence. 11 page routes with 5 equal-weight navbar items. Data model: ResearchArea, Paper, IdeaCard (with evidence, scores, predictions, nextAction), MVE (with resultStatus, failureAnalysis, nextTasks). `stateCalculator.ts` already computes survival/confidence/falsification scores and auto-derives idea status from MVE results.

**Core problem**: The Dashboard exposes all data simultaneously (stats cards, area overview, paper list, idea list, MVE count). Every entity is equally accessible via flat navigation. There is no concept of an "active idea" or "what to do next." Users must mentally synthesize information across pages to decide their next step.

**Key insight**: The infrastructure for decision-centric design already exists. `IdeaCard.nextAction`, `MVE.nextTasks`, and `stateCalculator.ts` scores provide all the signals needed. What is missing is (a) a single-active-idea concept and (b) a UI that computes and surfaces the single highest-priority action.

## Proposed Changes

### 1. New Concept: Active Idea (`context/ActiveIdeaContext.tsx`)

**CREATE** a separate lightweight React context (not modifying AppContext).

- Stores `activeIdeaId: string | null` in localStorage (`research-compass-active-idea`)
- On mount: if no active idea set but ideas exist, auto-select most recently updated non-rejected idea
- If active idea no longer exists, auto-clear
- `setActiveIdea(id)` sets the active idea AND navigates to `/` (Focus Workspace)
- `clearActiveIdea()` returns to empty state

**Wire up in `app/ClientProviders.tsx`**: wrap `{children}` with `<ActiveIdeaProvider>` inside `<AppProvider>`.

### 2. Next Action Calculator (`lib/nextActionCalculator.ts`)

**CREATE** pure functions that take an IdeaCard + MVE[] and return a single NextAction.

**Action priority logic** (highest first):

| Priority | Type | Trigger | Button Label |
|----------|------|---------|---------------|
| 10 | `complete_core_fields` | researchQuestion/coreHypothesis/whyItMatters empty | 完善核心假设 |
| 9 | `review_failure` | Latest MVE failed, unreviewed | 查看失败分析 |
| 8 | `execute_pending_mve` | Has pending MVE(s) | 执行实验 |
| 7 | `add_predictions` | predictions array empty | 添加预测 |
| 6 | `add_failure_conditions` | failureConditions array empty | 添加失败条件 |
| 5 | `strengthen_falsification` | falsificationStrength < 30 | 增强证伪性 |
| 4 | `add_evidence` | evidenceForHypothesis < 2 | 补充支持证据 |
| 3 | `generate_mve` | No MVEs, fields complete, ready | 生成验证实验 |
| 2 | `idea_unstable` | survival < 50 && confidence < 30 | (informational) |
| 1 | `idea_promising` | survival >= 70 && confidence >= 60 | (informational) |
| 0 | `idea_rejected` | survival < 20 | (informational) |

**Also add helpers to `lib/stateCalculator.ts`**: `getEvidenceBalance()`, `getActiveMVE()`, `getLatestMVEResult()`.

### 3. Button System Extension (`components/ui/Button.tsx`)

**MODIFY** to add 3 new variants:

| Variant | Visual | Usage |
|---------|--------|-------|
| `hero` | Accent bg, white text, py-3 px-6, font-bold, rounded-xl, shadow-md | Next Best Action button |
| `ghost` | Transparent bg, muted text, no border | Navigation links, tertiary actions |
| `focus` | Accent bg, ring-2 ring-accent/30, ring-offset-2 | "Focus on this idea" selection button |

### 4. Focus Workspace (`app/page.tsx` -- complete rewrite)

**REWRITE** the Dashboard into Focus Workspace with this layout:

```
┌─────────────────────────────────────────────────────────┐
│ NAV: Research Compass    [聚焦] 选择方向 论文 验证  ⚙│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HYPOTHESIS BANNER                                     │
│  [Status] Idea Title                                   │
│  Core hypothesis (2-line clamp)                         │
│  Survival ████████░░ 65 | Confidence █████░░░░ 50      │
│  Falsification ████░░░░░░ 40                            │
│                                                         │
│  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │ EVIDENCE PRESSURE │  │ MVE PIPELINE                │ │
│  │ ▲ 支持    2 条    │  │ [通过] sanity_check         │ │
│  │ ▼ 反对    2 条    │  │ [待实验] ablation           │ │
│  │ ? 缺失    2 条    │  │                              │ │
│  └──────────────────┘  └─────────────────────────────┘ │
│                                                         │
│  ════════════════════════════════════════════════════  │
│  NEXT BEST ACTION                                       │
│  执行最小可行实验 (ablation)                             │
│  扩展到更多动态场景...                                   │
│           [ 执行实验 ──────→ ]  (hero button)            │
│  ════════════════════════════════════════════════════  │
│                                                         │
│  [编辑假设] [添加证据] [最近活动]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components to compose** (all new, in `components/focus/`):

| Component | Purpose |
|-----------|---------|
| `FocusEmptyState` | Shown when no active idea -- "选择一个研究方向开始聚焦" with button to /ideas |
| `HypothesisBanner` | Active idea title, hypothesis, 3 score meters |
| `IdeaSurvivalMeter` | Reusable horizontal progress bar + numeric score |
| `EvidencePressureGauge` | Support/oppose/missing counts with latest evidence preview |
| `MVEPipelineStatus` | Active idea's MVEs as timeline, not flat list |
| `NextActionCard` | THE dominant card -- label, description, hero button to actionPath |
| `QuickActions` | 3-column grid of secondary actions (edit, evidence, AI evaluate) |
| `RecentActivity` | Last 5-8 changes on active idea (MVE results, evidence added, etc.) |

### 5. Navigation Redesign (`components/Navbar.tsx`)

**MODIFY** from 5 equal items to tiered hierarchy:

```
Tier 1 (accent):        聚焦 (/)              -- Target icon, always prominent
Tier 2 (standard):      选择方向 (/ideas)     -- Lightbulb icon
                        论文 (/papers)         -- FileText icon
                        验证记录 (/mves)       -- FlaskConical icon
Tier 3 (icon only):    子领域 (/areas)       -- LayoutGrid icon, text hidden
```

Primary item gets accent background instead of indigo-50. Icon-only items show no text label.

### 6. Idea Selection Page (`app/ideas/page.tsx`)

**MODIFY** from flat list to Idea Selection:

- Keep search and status filters
- Remove stats grid (not needed for selection)
- Simplify each card: title, hypothesis (1 line), scores, status
- Add "聚焦此方向" button (focus variant) to each card
- When clicked: `setActiveIdea(idea.id)` → navigates to `/`
- "新建Idea" opens CreateIdeaModal, then auto-focuses the created idea

### 7. MVE Log (`app/mves/page.tsx`)

**MODIFY** from global MVE list to active idea's MVE Log:

- Filter MVEs by `activeIdeaId` from ActiveIdeaContext
- Add header: "验证记录 -- [Idea Title]"
- Change layout from list to vertical timeline (line + nodes)
- Each node: MVE type badge, status badge, goal (truncated), date
- Pending MVEs highlighted, failed MVEs show failure reason preview
- Empty state: "暂无验证实验" with button to generate MVE
- If no active idea: prompt to select one

### 8. Paper Stream (`app/papers/page.tsx`)

**MODIFY** to add optional relevance filter:

- Add banner at top: "当前聚焦: [Idea Title]" with link back to `/`
- Add toggle: "仅显示相关论文" filtering by active idea's areaIds
- Default: show all papers (no filter)
- All existing functionality preserved (search, filters, CRUD, AI analysis)

### 9. Research Areas (`app/areas/page.tsx`)

**MINOR MODIFY**: Add subtle "返回聚焦" link at top when active idea exists.

### 10. Cleanup

**DELETE** `app/detail/[type]/[id]/page.tsx` and `DetailPageClient.tsx` (thin wrappers; direct routes `/idea/[id]` and `/mve/[id]` already exist). Search all files for `/detail/` href patterns and update to direct routes.

## Assumptions & Decisions

1. **Active idea state is separate from data model** -- stored in its own localStorage key, not in the main AppState. This avoids data migration and keeps the existing persistence layer untouched.
2. **Next action is computed, not stored** -- `nextActionCalculator.ts` derives the action from current state each render, so it is always up-to-date. The existing `IdeaCard.nextAction` field (mock-generated) is preserved but not used in the new UI.
3. **Chinese UI language preserved** -- all new labels and descriptions are in Chinese.
4. **Accent color**: Using teal (#0d9488) for the decision/action system to differentiate from the existing indigo information display.
5. **No backend changes** -- purely frontend restructuring within the existing Next.js static export architecture.
6. **Idea editor and MVE executor are preserved as-is** -- they are the detail/edit views reached from Focus Workspace, and they already work well for their purpose.

## Verification Steps

1. **Build check**: `npm run build` succeeds with no errors after all changes
2. **Navigation flow**: All nav items navigate correctly; Focus is always accessible
3. **Active idea lifecycle**: Select idea → Focus shows correct hypothesis/evidence/MVEs → switch idea → Focus updates → clear idea → empty state shown
4. **Next action accuracy**: For various idea states (empty fields, no evidence, pending MVE, failed MVE, promising), verify the correct action is shown
5. **MVE result → state update**: Record MVE result → return to Focus → scores updated → next action recalculated
6. **No link breakage**: All `/detail/` links updated, no 404s on internal navigation
7. **localStorage persistence**: Refresh page → active idea and all data preserved
8. **Static export**: Build output in `out/` directory deploys correctly
