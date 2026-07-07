// AI Research Workflows - 面向机器人/VLA/具身智能研究的标准工作流
// 纯静态数据，不依赖任何 Context 或 API

export interface WorkflowStep {
  title: string;
  description: string;
  toolCombination: string;
}

export interface PromptTemplate {
  name: string;
  prompt: string;
  outputSink: string;
}

export interface ResearchWorkflow {
  id: string;
  title: string;
  scenario: string;
  steps: WorkflowStep[];
  promptTemplates: PromptTemplate[];
  outputDestination: string;
  roboticsFocus: string;
}

export const researchWorkflows: ResearchWorkflow[] = [
  {
    id: 'discover-directions',
    title: '发现新方向',
    scenario: '在机器人/VLA/具身智能领域内寻找值得深耕的新研究方向，避免重复造轮子，找到"真问题"而非"伪命题"。',
    steps: [
      {
        title: '扫描近期顶会接收论文',
        description: '浏览 CoRL、RSS、ICRA、IROS、RAL 近两年接收论文标题，识别高频关键词与新兴主题（如 long-horizon manipulation、world models for control）。',
        toolCombination: 'arXiv + PaperWithCode + Google Scholar',
      },
      {
        title: '识别"未被解决"的痛点',
        description: '从论文 Limitations 段落和 Future Work 段落抽取共性痛点，特别关注 generalization、sample efficiency、real-world transfer 等机器人领域核心难题。',
        toolCombination: 'Semantic Scholar + Notion + Research Compass Observation',
      },
      {
        title: '评估方向可行性',
        description: '判断方向是否同时满足：①有公开 benchmark 可对比 ②数据/仿真器可得 ③实验室硬件可支持复现。机器人研究尤其要考虑硬件门槛。',
        toolCombination: 'GitHub + Hugging Face + 实验室硬件清单',
      },
      {
        title: '沉淀为 ResearchArea 和 Observation',
        description: '将候选方向写入 Research Compass 的 ResearchArea，把具体痛点拆解为 Observation，避免想法只停留在脑子里。',
        toolCombination: 'Research Compass App',
      },
    ],
    promptTemplates: [
      {
        name: '方向扫描 Prompt',
        prompt: '请基于以下机器人研究子领域「{子领域名}」，列出近 2 年 CoRL/RSS/ICRA/IROS 中最活跃的 5 个研究方向，每个方向说明：1) 核心问题 2) 代表性论文 1-2 篇 3) 当前最大瓶颈。要求聚焦真实世界部署，避免纯仿真场景。',
        outputSink: 'Observation',
      },
      {
        name: '痛点抽取 Prompt',
        prompt: '阅读以下论文摘要与 Limitations 段落，提取 3 个"未被解决"的具体痛点，每个痛点格式为：「在 X 场景下，Y 方法无法处理 Z」。要求痛点可被实验验证，不要泛泛而谈。',
        outputSink: 'Observation',
      },
    ],
    outputDestination: 'ResearchArea（方向） + Observation（痛点）',
    roboticsFocus: '机器人方向选择需特别关注：硬件依赖（是否需要特定机械臂/传感器）、sim-to-real gap、数据采集成本。优先选择有开源 baseline 的方向，避免从零搭建。',
  },
  {
    id: 'filter-papers',
    title: '筛选论文',
    scenario: '在某个研究方向下，从海量 arXiv 论文中快速筛选出真正值得读的 3-5 篇核心论文，避免陷入"读不完"的焦虑。',
    steps: [
      {
        title: '建立关键词与查询',
        description: '基于 ResearchArea 的 keywords 和 focusQuestions，构造 arXiv + Google Scholar 查询，时间范围限制在近 2 年。',
        toolCombination: 'arXiv API + Google Scholar + Semantic Scholar',
      },
      {
        title: '快速分类（ relevance / skip）',
        description: '只看标题 + 摘要 + 实验数据集，用 30 秒决策：①must-read（直接相关）②useful（背景知识）③skip（不相关）。',
        toolCombination: 'arXiv abstract + Research Compass Paper Card',
      },
      {
        title: '查引用关系找源头',
        description: '对 must-read 论文查被引和引用，找到方向的"奠基论文"和"最新进展"，构建 3-5 篇核心阅读清单。',
        toolCombination: 'Semantic Scholar Citation Graph + Connected Papers',
      },
      {
        title: '登记到 Paper Library',
        description: '将筛选出的论文加入 Research Compass 的 Paper Library，标注 readingStatus 为 to_read，关联到对应 ResearchArea。',
        toolCombination: 'Research Compass App',
      },
    ],
    promptTemplates: [
      {
        name: '论文相关性判断 Prompt',
        prompt: '判断以下论文是否与研究方向「{方向描述}」强相关。输出 JSON：{"relevance": "must_read"|"useful"|"skip", "reason": "一句话说明", "key_contribution": "若 must_read 则填写核心贡献"}。论文摘要：{abstract}',
        outputSink: 'Paper Card',
      },
      {
        name: '引用图谱分析 Prompt',
        prompt: '以下是论文 {论文标题} 的引用与被引列表（共 N 篇）。请识别：1) 奠基性论文（被引最多）2) 最新进展（近 1 年）3) 与之观点冲突的论文。输出 Markdown 列表。',
        outputSink: 'Paper Card',
      },
    ],
    outputDestination: 'Paper Card（关联到 ResearchArea，readingStatus=to_read）',
    roboticsFocus: '机器人论文筛选需特别留意：实验环境是否真实（real-world vs simulation）、硬件平台是否可得、代码是否开源。警惕"只在仿真里 work"且无 sim-to-real 验证的工作。',
  },
  {
    id: 'quick-read',
    title: '快速阅读论文',
    scenario: '用 15-30 分钟快速读完一篇论文，抓住核心贡献、方法要点和实验结论，判断是否需要精读。',
    steps: [
      {
        title: '读 Title + Abstract + Intro 最后一段',
        description: '用 3 分钟抓住论文要解决的问题和核心 claim，特别是"我们提出了 X，在 Y 上达到 Z"这类陈述。',
        toolCombination: 'arXiv PDF + 速读笔记',
      },
      {
        title: '看 Methodology 图表',
        description: '直接跳到方法图（architecture figure），理解 pipeline 而非细节。机器人论文特别关注输入输出、传感器配置、训练数据。',
        toolCombination: 'PDF 图表 + 速读笔记',
      },
      {
        title: '扫实验表格',
        description: '只看主表（main result table），关注：①任务/benchmark ②baseline 对比 ③关键指标提升幅度。判断实验是否 convincing。',
        toolCombination: 'PDF 表格 + Research Compass Paper Card',
      },
      {
        title: '写一句话总结',
        description: '用一句话概括"这篇论文用 X 方法解决了 Y 问题，在 Z 上比 baseline 提升 N%"，登记到 Paper Card 的 oneSentenceSummary 字段。',
        toolCombination: 'Research Compass App',
      },
    ],
    promptTemplates: [
      {
        name: '一句话总结 Prompt',
        prompt: '基于以下论文摘要和方法描述，生成一句话总结，格式为：「{作者} 等提出 {方法名}，通过 {核心技巧} 解决 {问题}，在 {benchmark} 上达到 {指标}，相比 baseline 提升 {幅度}。」要求 50 字以内，包含可量化数据。',
        outputSink: 'Paper Card (oneSentenceSummary)',
      },
      {
        name: '方法图解读 Prompt',
        prompt: '描述以下论文方法图（Figure {N}）的 pipeline：输入是什么 → 经过哪些模块 → 输出是什么。用 Markdown 流程图表示（输入 → 模块A → 模块B → 输出）。机器人论文请特别标注传感器输入和动作输出。',
        outputSink: 'Paper Card (notes)',
      },
    ],
    outputDestination: 'Paper Card（oneSentenceSummary + readingStatus=skimmed）',
    roboticsFocus: '机器人论文速读要点：①动作空间（joint / end-effector / primitive）②观测空间（RGB / RGB-D / point cloud）③训练数据来源（teleop / demo / RL）。这三个维度决定了方法能否迁移到你的硬件。',
  },
  {
    id: 'deep-read',
    title: '精读和批判性阅读',
    scenario: '对核心论文进行深度精读，挖掘隐藏假设、实验漏洞和可扩展点，为复现或改进做准备。',
    steps: [
      {
        title: '通读全文 + 标注疑问',
        description: '逐段精读，用高亮/批注标记：①不清晰的定义 ②未解释的符号 ③跳跃的推导 ④可疑的实验设置。建立"疑问清单"。',
        toolCombination: 'PDF 阅读器 + Notion / Markdown notes',
      },
      {
        title: '重构方法细节',
        description: '把方法章节用自己的话重写一遍，特别关注 loss function、训练流程、超参数。机器人论文要重写动作生成和执行流程。',
        toolCombination: 'Markdown + 公式编辑器',
      },
      {
        title: '批判性审视实验',
        description: '对每个实验问：①baseline 选择是否公平 ②指标是否 cherry-picked ③是否缺少关键 ablation ④统计显著性如何 ⑤是否报告了失败 case。',
        toolCombination: 'Critical reading checklist',
      },
      {
        title: '识别隐藏假设',
        description: '找出论文未明说的前提，如"假设观测无噪声""假设动作执行精确""假设 demo 质量一致"。这些假设往往是改进的入口。',
        toolCombination: 'Research Compass Paper Card (hiddenAssumptions)',
      },
      {
        title: '沉淀判断与可能的扩展',
        description: '在 Paper Card 中填写 judgementLevel（must_review / idea_source / useful / background）和可能的扩展方向，触发后续 Idea 生成。',
        toolCombination: 'Research Compass App',
      },
    ],
    promptTemplates: [
      {
        name: '隐藏假设挖掘 Prompt',
        prompt: '阅读以下论文方法与实验部分，列出 3-5 个未明说的假设（hidden assumptions），格式为：「假设：{X}。若该假设不成立，方法可能 {Y}。」特别关注机器人特有的假设（传感器精度、执行器延迟、环境稳定性）。',
        outputSink: 'Paper Card (hiddenAssumptions)',
      },
      {
        name: '实验漏洞检查 Prompt',
        prompt: '对以下论文的实验部分进行批判性审查，输出 JSON：{"baseline_issues": [...], "metric_issues": [...], "missing_ablations": [...], "failure_case_absence": true/false}。每个 issue 一句话说明。',
        outputSink: 'Paper Card (notes)',
      },
      {
        name: '扩展方向 Prompt',
        prompt: '基于以下论文的方法与局限，提出 2-3 个可落地的扩展方向，每个方向格式为：「{方向名}：通过 {改造方法}，预期解决 {论文局限}，可在 {benchmark} 上验证。」要求方向对机器人场景有实际意义，不要泛泛而谈。',
        outputSink: 'Idea Card',
      },
    ],
    outputDestination: 'Paper Card（judgementLevel + hiddenAssumptions） + Idea Card（扩展方向）',
    roboticsFocus: '机器人论文精读要追问：①sim-to-real gap 是否被严肃对待 ②硬件依赖是否过强 ③数据采集成本是否可承受 ④failure case 是否被报告。这些是判断方法"是否值得跟"的关键。',
  },
  {
    id: 'reproduce-experiment',
    title: '复现实验',
    scenario: '系统化复现核心论文的实验结果，验证方法有效性，为改进或对比奠定可信基础。',
    steps: [
      {
        title: '检查代码与数据可得性',
        description: '确认作者是否开源代码、是否提供预训练模型、是否使用公开数据集。机器人论文还要确认仿真器版本、硬件配置（机械臂型号、相机型号）。',
        toolCombination: 'GitHub + Hugging Face + 论文 Appendix',
      },
      {
        title: '搭建环境并跑通 demo',
        description: '按 README 搭建环境，先跑通作者提供的 demo / pretrained model，确认环境无误。记录所有偏离 README 的步骤。',
        toolCombination: 'conda / docker + 实验日志',
      },
      {
        title: '从头训练并对比指标',
        description: '用作者公开的数据/配置从头训练，对比论文报告的指标。机器人复现需特别关注随机种子、训练时长、GPU 占用。',
        toolCombination: 'wandb / tensorboard + 实验日志',
      },
      {
        title: '记录 gap 与失败模式',
        description: '若复现指标低于论文，分析原因（超参数未公开、数据预处理差异、随机性）。记录失败模式，这些往往是论文的"隐藏弱点"。',
        toolCombination: 'Research Compass MVE',
      },
      {
        title: '沉淀为 MVE 记录',
        description: '将复现过程与结果登记为 MVE（最小可行实验），关联到对应 Paper 和 Idea，为后续改进提供 baseline。',
        toolCombination: 'Research Compass App',
      },
    ],
    promptTemplates: [
      {
        name: '复现 checklist 生成 Prompt',
        prompt: '基于以下论文的方法与实验章节，生成复现 checklist，包含：1) 必需的代码/数据/硬件 2) 环境搭建关键步骤 3) 训练核心超参数 4) 验证指标。输出 Markdown checkbox 列表。',
        outputSink: 'MVE (steps)',
      },
      {
        name: '复现 gap 分析 Prompt',
        prompt: '我复现论文 {论文标题} 时，论文报告 {指标} 为 {论文值}，我得到 {我的值}。我的环境配置：{环境描述}。请分析 5 个可能的 gap 来源，按可能性排序，每个给出验证方法。',
        outputSink: 'MVE (failureAnalysis)',
      },
    ],
    outputDestination: 'MVE（关联 Paper，resultStatus=passed/failed）',
    roboticsFocus: '机器人复现的三大坑：①仿真器版本差异（Isaac Gym / Genesis / MuJoCo 版本不兼容）②硬件依赖（特定机械臂 / 相机型号不可得）③数据采集协议（teleop 质量、demo 数量）。复现前务必评估硬件可得性，避免投入后无法验证。',
  },
  {
    id: 'writing-rebuttal',
    title: '论文写作与 rebuttal',
    scenario: '将自己的研究成果写成论文，或在 review 阶段系统化处理 reviewer 意见，提升接收概率。',
    steps: [
      {
        title: '构建故事线',
        description: '用一句话讲清"解决了什么问题、用什么方法、达到什么效果"。机器人论文特别要突出 real-world 价值和与现有方法的差异。',
        toolCombination: 'Notion + Markdown outline',
      },
      {
        title: '撰写核心章节',
        description: '按 Intro → Related Work → Method → Experiments → Conclusion 顺序撰写。Method 要配清晰的 architecture figure，Experiments 要有 ablation。',
        toolCombination: 'LaTeX / Overleaf + PDF 阅读器',
      },
      {
        title: '系统性回应 reviewer',
        description: '对每条 reviewer 意见分类：①agree & fix ②partially agree & clarify ③disagree & rebut。每条回应都要有实验或文献支撑。',
        toolCombination: 'Rebuttal template + 实验记录',
      },
      {
        title: '补充实验与可视化',
        description: '针对 reviewer 提出的 ablation / failure case / 新 benchmark 需求，补充实验并制作清晰的可视化（视频、对比图）。',
        toolCombination: 'wandb + matplotlib + 视频',
      },
    ],
    promptTemplates: [
      {
        name: '故事线构建 Prompt',
        prompt: '基于以下研究内容，生成论文 Intro 的故事线（4 段）：1) 领域背景与重要性 2) 现有方法的局限 3) 我们的方法与核心贡献 4) 实验亮点。要求每段 2-3 句，机器人论文请突出 real-world 价值。',
        outputSink: '论文草稿',
      },
      {
        name: 'Reviewer 意见分类 Prompt',
        prompt: '以下是 reviewer {N} 的意见。请分类：1) agree（同意并修改）2) partially agree（部分同意，需澄清）3) disagree（不同意，需 rebut）。每条输出 JSON：{"category": "...", "response_strategy": "...", "supporting_evidence": "实验或文献"}。',
        outputSink: 'Rebuttal 文档',
      },
      {
        name: 'Ablation 设计 Prompt',
        prompt: '针对 reviewer 要求的 ablation「{ablation 描述}」，设计实验：1) 变量与控制组 2) 评估指标 3) 预期结果 4) 若结果不利如何回应。输出 Markdown 表格。',
        outputSink: 'Rebuttal 文档 / 实验记录',
      },
    ],
    outputDestination: '论文草稿 + Rebuttal 文档（外部文件，Research Compass 仅记录相关 Idea/MVE 进展）',
    roboticsFocus: '机器人论文写作要点：①real-world 实验视频是加分项，务必精心制作 ②sim-to-real 的过渡要有清晰说明 ③failure case 主动披露比被 reviewer 发现更安全 ④硬件相关的 limitation 要诚实陈述。',
  },
];
