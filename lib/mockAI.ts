import { Observation, Evidence, IdeaCard, MVE, ResearchArea, Paper } from './types';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const cvTemplates = {
  observation: {
    type: 'paper' as const,
    keywords: ['对比学习', '长尾分布', '分布假设'],
    potentialIssue: '长尾场景下对比学习的有效性',
    researchValue: 'high' as const,
    researchValueReason: '这是一个基础假设的漏洞，如果成立可能影响广泛',
    suggestedAction: '搜索长尾+对比学习的相关工作',
  },
  evidence: {
    supporting: [
      { content: '尾部类别特征空间确实更稀疏 (Li 2021)', source: '文献' },
      { content: '半监督对比学习有提升先例 (Chen 2022)', source: '文献' },
    ],
    opposing: [
      { content: '已有工作提出混合损失 (Zhou 2023)', source: '文献' },
      { content: '代理正样本可能引入语义噪声', source: 'AI推理' },
    ],
    missing: [
      { content: '头部→尾部正样本迁移的有效性验证', source: 'AI识别' },
    ],
    risks: [
      '头部类别作为正样本可能引入语义噪声，尾部特征反而被污染',
      '即使有效，提升幅度可能太小（<2%）不足以支撑完整工作',
    ],
    nextAction: '在 CIFAR-100-LT 上做 MVE 验证（预计 1.5 天）',
  },
  mve: {
    experimentGoal: '代理正样本对比损失能否在长尾场景下改善尾部特征分布？',
    minimalDesign: '在 CIFAR-100-LT (imbalance=100) 上训练 ResNet-32，对比三种设置',
    keyVariables: {
      independent: '正样本构造方式（标准 / 代理正样本 / 仅代理正样本）',
      dependent: '头部/中部/尾部各类别的 Top-1 准确率 + 整体准确率',
    },
    controlGroups: [
      'Baseline: 标准 CE 损失',
      'Proposed: CE + 代理正样本对比损失',
      'Ablation: 仅对比损失（无 CE）',
    ],
    expectedOutcome: '尾部准确率提升 >3%，头部下降 <1%',
    failureSignals: [
      '尾部准确率不提升',
      '尾部提升但头部下降 >3%',
      'Ablation 组效果优于 Proposed 组',
    ],
    minimalEffort: '修改现有训练脚本约 80 行代码，单卡 3090 训练约 3 小时，总计 1.5 天',
    nextTasks: {
      onPass: '扩展到 ImageNet-LT，对比 SOTA',
      onFail: '尝试其他正样本构造方式或搁置方向',
    },
    roboticsTask: '图像分类任务',
    datasetOrScenario: 'CIFAR-100-LT 数据集',
    baseline: '标准对比学习 + CE 损失',
    evaluationMetric: 'Top-1 准确率（分头部/中部/尾部）',
    minimalComputeNeed: '单卡 3090，约 3 小时',
    expectedTimeCost: '1.5 天',
  },
};

const nlpTemplates = {
  observation: {
    type: 'paper' as const,
    keywords: ['大模型', '指令微调', '数据质量'],
    potentialIssue: '低质量指令数据对模型泛化能力的影响',
    researchValue: 'medium' as const,
    researchValueReason: '指令微调是当前主流方向，但数据质量问题尚未被充分研究',
    suggestedAction: '收集不同质量的指令数据集进行对比实验',
  },
  evidence: {
    supporting: [
      { content: '高质量指令微调显著提升模型能力 (Wei 2022)', source: '文献' },
      { content: '数据过滤能有效提升模型表现 (Gao 2023)', source: '文献' },
    ],
    opposing: [
      { content: '足够大规模低质量数据也能取得不错效果 (Zhang 2023)', source: '文献' },
      { content: '数据质量评估标准不统一', source: 'AI推理' },
    ],
    missing: [
      { content: '不同质量数据对不同任务类型的影响差异', source: 'AI识别' },
    ],
    risks: [
      '数据质量评估指标可能不全面',
      '大规模实验成本高',
    ],
    nextAction: '在 LLaMA-7B 上做 MVE 验证（预计 3 天）',
  },
  mve: {
    experimentGoal: '低质量指令数据是否会损害大模型的泛化能力？',
    minimalDesign: '在 LLaMA-7B 上使用不同质量的指令数据集进行微调',
    keyVariables: {
      independent: '指令数据质量等级（高/中/低）',
      dependent: 'MMLU 各子任务准确率 + 指令跟随成功率',
    },
    controlGroups: [
      'Baseline: 全量高质量数据',
      'Proposed: 混合高质量+低质量数据',
      'Ablation: 仅低质量数据',
    ],
    expectedOutcome: '混合数据组性能下降 <5%，纯低质量组下降 >15%',
    failureSignals: [
      '各组性能差异不显著',
      '低质量组反而表现更好',
    ],
    minimalEffort: '准备约 100K 指令数据，单卡 A100 训练约 12 小时，总计 3 天',
    nextTasks: {
      onPass: '设计数据过滤策略，验证过滤效果',
      onFail: '重新审视数据质量评估指标',
    },
    roboticsTask: '大模型指令微调',
    datasetOrScenario: '自构造指令数据集',
    baseline: '全量高质量数据微调',
    evaluationMetric: 'MMLU 准确率 + 指令跟随成功率',
    minimalComputeNeed: '单卡 A100，约 12 小时',
    expectedTimeCost: '3 天',
  },
};

const vlaTemplates = {
  evidence: {
    supporting: [
      { content: 'VLA展示了强大的零样本泛化能力 (RT-2)', source: '文献' },
      { content: '视觉-语言预训练知识可迁移到机器人任务', source: '事实' },
    ],
    opposing: [
      { content: '推理速度慢，难以满足实时控制要求', source: 'AI推理' },
      { content: '需要大量机器人训练数据', source: 'AI推理' },
    ],
    missing: [
      { content: 'VLA在精细操作任务上的性能边界', source: '实验验证' },
      { content: '小模型VLA的性能潜力', source: '研究问题' },
    ],
    risks: [
      '改进方案可能牺牲泛化能力',
      '加速效果不足以支撑实时应用',
      '实验成本高，需要真实机器人验证',
    ],
    nextAction: '在模拟环境中验证方案可行性（预计 1 周）',
  },
  mve: {
    experimentGoal: '分层动作解码能否在保持VLA泛化能力的同时提升推理速度？',
    minimalDesign: '在模拟桌面操作环境中，对比端到端VLA与分层VLA的任务成功率和推理延迟',
    keyVariables: {
      independent: '动作解码方式（端到端 / 分层）',
      dependent: '任务成功率 + 推理延迟 + 未见任务泛化率',
    },
    controlGroups: [
      'Baseline: 端到端 VLA (RT-2风格)',
      'Proposed: 分层VLA（高层语义+低层轨迹）',
      'Ablation: 仅低层轨迹模型',
    ],
    expectedOutcome: '推理速度提升5倍以上，任务成功率下降<10%',
    failureSignals: [
      '加速效果<2倍',
      '泛化能力大幅下降',
      '分层接口设计困难',
    ],
    minimalEffort: '基于OpenVLA修改，在模拟环境测试，约1周',
    nextTasks: {
      onPass: '在真实机器人上验证，扩展更多任务类型',
      onFail: '探索其他VLA加速方案（蒸馏/量化）',
    },
    roboticsTask: '桌面操作（抓取/放置/推动）',
    datasetOrScenario: 'RT-1数据集 + 自建模拟场景',
    baseline: '端到端 VLA (OpenVLA)',
    evaluationMetric: '任务成功率 + 推理延迟(ms/step) + 未见任务泛化率',
    minimalComputeNeed: '单卡 A100，训练约2天，推理测试约4小时',
    expectedTimeCost: '1 周',
  },
  ideaFromPaper: {
    title: 'VLA推理加速：分层动作解码策略',
    researchQuestion: '能否通过分层动作解码，在保持VLA泛化能力的同时大幅提升推理速度？',
    coreHypothesis: '将VLA动作输出分解为"高层语义动作+低层轨迹生成"两层，高层用大模型推理，低层用轻量模型执行，可以在不损失太多泛化性的情况下实现实时控制。',
    whyItMatters: 'VLA是机器人基础模型的核心方向，但当前推理速度远不能满足实时控制需求（>10Hz），速度瓶颈严重制约了VLA的实际应用。',
    roboticsTask: '桌面操作（抓取、放置、推动）',
    datasetOrScenario: 'RT-1 / RT-2 数据集 + 自建真实机器人场景',
    baseline: 'RT-2 / OpenVLA 端到端 VLA',
    evaluationMetric: '任务成功率 + 推理延迟（ms/step）+ 未见任务泛化率',
  },
  oneSentenceSummary: '将视觉-语言模型直接输出动作，实现端到端机器人控制，展示了web知识向机器人操作的迁移潜力。',
};

const slamTemplates = {
  evidence: {
    supporting: [
      { content: '动态物体是VIO主要误差源之一', source: '文献' },
      { content: '语义分割可以有效识别动态物体', source: '事实' },
    ],
    opposing: [
      { content: '语义分割增加计算量，可能降低实时性', source: 'AI推理' },
      { content: '误检静态物体为动态可能丢失有效特征', source: 'AI推理' },
    ],
    missing: [
      { content: '在真实高动态场景下的定量对比实验', source: '实验验证' },
    ],
    risks: [
      '动态检测的精度不足以支撑VIO改进',
      '计算开销太大，实时性无法保证',
      '提升幅度有限（<10%），不构成独立贡献',
    ],
    nextAction: '在TUM动态序列上验证MVE（预计 2 天）',
  },
  mve: {
    experimentGoal: '验证动态特征点排除能否在高动态场景下提升VIO定位精度',
    minimalDesign: '在VINS-Mono基础上加入基于语义分割的动态特征点过滤，在TUM动态序列上对比ATE',
    keyVariables: {
      independent: '动态特征处理方式（无处理 / 直接排除 / 降权）',
      dependent: 'ATE绝对轨迹误差 + 定位失败率',
    },
    controlGroups: [
      'Baseline: VINS-Mono 原版（无动态处理）',
      'Proposed: 语义分割+动态特征排除',
      'Ablation: 动态特征降权（不排除）',
    ],
    expectedOutcome: '动态场景下ATE降低30%以上，静态场景下性能不下降',
    failureSignals: [
      'ATE降低幅度<10%',
      '静态场景下ATE反而上升',
      '处理帧率<10Hz，不满足实时要求',
    ],
    minimalEffort: '基于VINS-Mono修改约200行代码，集成轻量语义分割模型，在TUM数据集测试',
    nextTasks: {
      onPass: '扩展到更多动态场景，设计更精细的动态特征处理策略',
      onFail: '考虑其他动态鲁棒VIO方案（如多几何约束）',
    },
    roboticsTask: '移动机器人在动态环境中的定位',
    datasetOrScenario: 'TUM RGB-D Dataset 动态序列（walking/running）',
    baseline: 'VINS-Mono 标准版本',
    evaluationMetric: 'ATE RMSE + 定位失败率 + 处理帧率',
    minimalComputeNeed: '单台带GPU的工作站，推理~20ms/帧',
    expectedTimeCost: '2-3天（代码修改 + 实验运行）',
  },
  ideaFromPaper: {
    title: '动态VIO：动态场景下的鲁棒视觉惯性里程计',
    researchQuestion: '如何在高动态场景下保持VIO的定位精度和鲁棒性？',
    coreHypothesis: '通过动态物体检测与特征点分类，将动态物体上的特征点排除或降权，可以显著提升动态场景下VIO的定位精度。',
    whyItMatters: '真实环境中大量动态物体（人、车）严重影响VIO性能，但现有方法多假设静态环境，动态场景下漂移严重。',
    roboticsTask: '无人机/移动机器人在动态环境中的定位',
    datasetOrScenario: '自采动态场景数据集 + TUM动态序列',
    baseline: 'VINS-Mono / ORB-SLAM3 标准版本',
    evaluationMetric: 'ATE（绝对轨迹误差）+ 定位失败率 + 处理帧率',
  },
  oneSentenceSummary: '成熟的视觉惯性SLAM系统，支持多地图和IMU紧耦合，是VIO方向的经典基线参考。',
};

const diffusionTemplates = {
  evidence: {
    supporting: [
      { content: '扩散策略在多模态动作建模上优于GMM和BC', source: '文献' },
      { content: '图像领域已有少步扩散的成功案例（LCM）', source: '文献' },
    ],
    opposing: [
      { content: '动作空间维度高，少步扩散可能质量下降严重', source: 'AI推理' },
      { content: '蒸馏方法训练复杂度高', source: 'AI推理' },
    ],
    missing: [
      { content: '动作空间中少步扩散的性能边界', source: '实验验证' },
    ],
    risks: [
      '少步扩散后策略性能下降超过10%，得不偿失',
      '蒸馏方法的训练复杂度高，难以复现',
    ],
    nextAction: '在PushT数据集上测试少步扩散的性能变化（预计 3 天）',
  },
  mve: {
    experimentGoal: '少步扩散（<5步）能否在机器人策略学习中保持接近全步数的性能？',
    minimalDesign: '在PushT数据集上，对比不同扩散步数（50/10/5/3/1）的策略性能和推理速度',
    keyVariables: {
      independent: '扩散步数（50/10/5/3/1）',
      dependent: '任务成功率 + 推理时间 + 动作多样性',
    },
    controlGroups: [
      'Baseline: Diffusion Policy (50步 DDPM)',
      'Proposed: 少步扩散（蒸馏/改进调度）',
      'Ablation: 直接少步DDPM（无蒸馏）',
    ],
    expectedOutcome: '5步扩散性能下降<10%，推理速度提升5倍以上',
    failureSignals: [
      '性能下降>20%',
      '蒸馏方法不稳定',
      '5步以下完全不可用',
    ],
    minimalEffort: '基于Diffusion Policy代码修改，在PushT数据集测试，约3天',
    nextTasks: {
      onPass: '扩展到更多机器人任务，验证真实机器人实时控制',
      onFail: '探索其他快速生成策略（如GAN/Flow）',
    },
    roboticsTask: '桌面机器人操作任务',
    datasetOrScenario: 'Diffusion Policy 标准测试集（PushT、Kitchen等）',
    baseline: 'Diffusion Policy (50步 DDPM)',
    evaluationMetric: '任务成功率 + 推理时间 + 动作分布多样性',
    minimalComputeNeed: '单卡 3090/4090，训练约1天，推理测试约2小时',
    expectedTimeCost: '3 天',
  },
  ideaFromPaper: {
    title: '快速扩散策略：少步扩散用于实时机器人控制',
    researchQuestion: '能否将扩散步数从50步压缩到5步以内，同时保持策略性能，用于实时机器人控制？',
    coreHypothesis: '通过蒸馏或更好的噪声调度，可以用极少的扩散步数（<5步）达到接近全步数的策略性能，从而满足实时控制要求。',
    whyItMatters: '扩散策略在多模态动作建模上有优势，但推理速度是主要瓶颈。如果能实现少步扩散，将大幅提升扩散策略的实用性。',
    roboticsTask: '桌面机器人操作任务',
    datasetOrScenario: 'Diffusion Policy 标准测试集（PushT、Kitchen等）',
    baseline: 'Diffusion Policy (50步 DDPM)',
    evaluationMetric: '任务成功率 + 推理时间 + 动作分布多样性',
  },
  oneSentenceSummary: '用扩散模型生成动作序列，在多模态动作分布建模上优于GMM和行为克隆。',
};

const worldModelTemplates = {
  evidence: {
    supporting: [
      { content: 'DreamerV3在多种任务上实现无超参数调优的SOTA', source: '文献' },
      { content: '世界模型可以用于规划和策略学习', source: '事实' },
    ],
    opposing: [
      { content: '像素级世界模型在复杂3D环境效率低', source: 'AI推理' },
      { content: '长时间预测准确性下降', source: 'AI推理' },
    ],
    missing: [
      { content: '世界模型在真实机器人上的适用性验证', source: '实验验证' },
    ],
    risks: [
      '3D环境中世界模型学习困难',
      'Sim-to-Real迁移是额外挑战',
      '计算资源需求大',
    ],
    nextAction: '在简单模拟环境中验证方案（预计 1 周）',
  },
  mve: {
    experimentGoal: '世界模型能否支撑机器人的长程任务规划？',
    minimalDesign: '在模拟导航环境中，对比基于模型规划与无模型RL的长程任务成功率',
    keyVariables: {
      independent: '规划方式（无模型RL / 基于世界模型规划）',
      dependent: '长程任务成功率 + 样本效率',
    },
    controlGroups: [
      'Baseline: PPO (无模型RL)',
      'Proposed: DreamerV3 (基于世界模型)',
      'Ablation: 纯规划（无学习）',
    ],
    expectedOutcome: 'DreamerV3在长程任务上成功率更高，样本效率提升5倍以上',
    failureSignals: [
      '世界模型预测不准导致规划失败',
      '长程任务性能反而不如无模型',
    ],
    minimalEffort: '在标准benchmark上测试DreamerV3，约1周',
    nextTasks: {
      onPass: '扩展到更复杂的3D环境和机器人任务',
      onFail: '探索更适合机器人的世界模型表示',
    },
    roboticsTask: '模拟环境中的导航和操作任务',
    datasetOrScenario: 'DeepMind Control Suite / Atari',
    baseline: 'PPO (无模型强化学习)',
    evaluationMetric: '任务成功率 + 样本效率（环境步数）+ 渐近性能',
    minimalComputeNeed: '单卡 A100，训练约3-5天',
    expectedTimeCost: '1 周',
  },
  ideaFromPaper: {
    title: '机器人世界模型：从像素到动作的统一表示',
    researchQuestion: '能否构建一个统一的机器人世界模型，同时支持感知、预测和规划？',
    coreHypothesis: '基于潜变量动力学的世界模型可以学习到通用的机器人状态表示，同时支持预测和规划任务。',
    whyItMatters: '世界模型是实现通用机器人智能的关键路径之一，统一表示可以大幅提升样本效率和泛化能力。',
    roboticsTask: '模拟机器人导航和操作',
    datasetOrScenario: 'DeepMind Control Suite + 自建模拟场景',
    baseline: 'DreamerV3',
    evaluationMetric: '任务成功率 + 预测精度 + 样本效率',
  },
  oneSentenceSummary: '统一的世界模型强化学习算法，在多种任务上实现无超参数调优的SOTA性能。',
};

function selectTemplate(content: string) {
  const lower = content.toLowerCase();
  if (lower.includes('vla') || lower.includes('vision-language-action') || lower.includes('rt-2') || lower.includes('rt-1')) {
    return { ...cvTemplates, ...vlaTemplates };
  }
  if (lower.includes('slam') || lower.includes('vio') || lower.includes('visual-inertial') || lower.includes('odometry') || lower.includes('state estimation') || lower.includes('卡尔曼')) {
    return { ...cvTemplates, ...slamTemplates };
  }
  if (lower.includes('diffusion') || lower.includes('扩散')) {
    return { ...cvTemplates, ...diffusionTemplates };
  }
  if (lower.includes('world model') || lower.includes('world models') || lower.includes('dreamer') || lower.includes('世界模型')) {
    return { ...cvTemplates, ...worldModelTemplates };
  }
  if (lower.includes('对比学习') || lower.includes('长尾') || lower.includes('特征空间')) {
    return cvTemplates;
  }
  if (lower.includes('大模型') || lower.includes('指令微调') || lower.includes('数据质量')) {
    return nlpTemplates;
  }
  return cvTemplates;
}

function selectTemplateByAreas(areas: ResearchArea[]) {
  const areaNames = areas.map(a => a.name.toLowerCase()).join(' ');
  return selectTemplate(areaNames);
}

export async function mockAnalyzeObservation(content: string): Promise<Omit<Observation, 'id' | 'content' | 'createdAt'>> {
  await delay(800 + Math.random() * 700);
  const template = selectTemplate(content);
  return template.observation;
}

export async function mockGenerateIdeaEvidence(
  researchQuestion: string,
  coreHypothesis: string,
  observations: Observation[]
): Promise<{
  supportingEvidence: Evidence[];
  opposingEvidence: Evidence[];
  missingEvidence: Evidence[];
  biggestRisks: string[];
  nextAction: string;
}> {
  await delay(1200 + Math.random() * 800);
  const template = selectTemplate(researchQuestion + ' ' + coreHypothesis);
  
  return {
    supportingEvidence: template.evidence.supporting.map(e => ({
      ...e,
      id: generateId(),
      isAIGenerated: true,
    })),
    opposingEvidence: template.evidence.opposing.map(e => ({
      ...e,
      id: generateId(),
      isAIGenerated: true,
    })),
    missingEvidence: template.evidence.missing.map(e => ({
      ...e,
      id: generateId(),
      isAIGenerated: true,
    })),
    biggestRisks: [...template.evidence.risks],
    nextAction: template.evidence.nextAction,
  };
}

export async function mockGenerateMVE(ideaCard: IdeaCard): Promise<Omit<MVE, 'id' | 'ideaCardId' | 'resultStatus' | 'resultNotes' | 'createdAt'>> {
  await delay(1500 + Math.random() * 1000);
  const template = selectTemplate(ideaCard.researchQuestion + ' ' + ideaCard.coreHypothesis);
  return template.mve;
}

export async function mockGenerateRoboticsMVE(
  ideaCard: IdeaCard,
  sourcePapers: Paper[]
): Promise<Omit<MVE, 'id' | 'ideaCardId' | 'resultStatus' | 'resultNotes' | 'createdAt'>> {
  await delay(1500 + Math.random() * 1000);
  const content = ideaCard.researchQuestion + ' ' + ideaCard.coreHypothesis + ' ' + sourcePapers.map(p => p.title).join(' ');
  const template = selectTemplate(content);
  
  return {
    ...template.mve,
    roboticsTask: ideaCard.roboticsTask || template.mve.roboticsTask,
    datasetOrScenario: ideaCard.datasetOrScenario || template.mve.datasetOrScenario,
    baseline: ideaCard.baseline || template.mve.baseline,
    evaluationMetric: ideaCard.evaluationMetric || template.mve.evaluationMetric,
  };
}

export async function mockGenerateOneSentenceSummary(
  paper: Partial<Paper>,
  areas: ResearchArea[]
): Promise<string> {
  await delay(800 + Math.random() * 700);
  const template = selectTemplateByAreas(areas);
  
  const keywords = paper.methodKeywords?.slice(0, 2).join('、') || template.observation.keywords.slice(0, 2).join('、') || '该方法';
  const issue = template.observation.potentialIssue || '相关问题';
  
  return `${keywords}在${issue}方面展现出一定潜力，但在实际应用中仍需进一步验证其鲁棒性和泛化能力。`;
}

export async function mockGenerateIdeaFromPaper(
  paper: Paper,
  areas: ResearchArea[]
): Promise<{
  title: string;
  researchQuestion: string;
  coreHypothesis: string;
  whyItMatters: string;
  supportingEvidence: Evidence[];
  opposingEvidence: Evidence[];
  missingEvidence: Evidence[];
  biggestRisks: string[];
  roboticsTask: string;
  datasetOrScenario: string;
  baseline: string;
  evaluationMetric: string;
  nextAction: string;
}> {
  await delay(1200 + Math.random() * 800);
  const template = selectTemplateByAreas(areas);
  
  const ideaData = {
    title: `基于${paper.title.slice(0, 20)}的改进研究`,
    researchQuestion: `如何改进${paper.title.slice(0, 20)}的方法，提升性能或适用范围？`,
    coreHypothesis: `通过针对性的改进，可以在保持原有方法优势的同时解决其局限性。`,
    whyItMatters: paper.relevanceToMyResearch || '该方向具有重要的研究价值和应用前景。',
    roboticsTask: template.mve.roboticsTask || '',
    datasetOrScenario: template.mve.datasetOrScenario || '',
    baseline: template.mve.baseline || '',
    evaluationMetric: template.mve.evaluationMetric || '',
  };

  return {
    ...ideaData,
    supportingEvidence: template.evidence.supporting.map(e => ({
      ...e,
      id: generateId(),
      isAIGenerated: true,
    })),
    opposingEvidence: template.evidence.opposing.map(e => ({
      ...e,
      id: generateId(),
      isAIGenerated: true,
    })),
    missingEvidence: template.evidence.missing.map(e => ({
      ...e,
      id: generateId(),
      isAIGenerated: true,
    })),
    biggestRisks: [...template.evidence.risks],
    nextAction: template.evidence.nextAction,
  };
}

export function parseArxivUrl(url: string): { arxivId?: string; arxivUrl?: string; pdfUrl?: string } {
  const absMatch = url.match(/arxiv\.org\/abs\/([\w.\/-]+)/);
  const pdfMatch = url.match(/arxiv\.org\/pdf\/([\w.\/-]+)(\.pdf)?/);
  
  let arxivId: string | undefined;
  if (absMatch) {
    arxivId = absMatch[1];
  } else if (pdfMatch) {
    arxivId = pdfMatch[1];
  }
  
  if (arxivId) {
    return {
      arxivId,
      arxivUrl: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
    };
  }
  
  return {};
}

export function detectLinkType(url: string): {
  type: 'arxiv' | 'github' | 'feishu' | 'other';
  field?: 'arxivUrl' | 'pdfUrl' | 'codeUrl' | 'feishuNoteUrl';
  arxivId?: string;
} {
  if (url.includes('arxiv.org/abs')) {
    const result = parseArxivUrl(url);
    return { type: 'arxiv', field: 'arxivUrl', arxivId: result.arxivId };
  }
  if (url.includes('arxiv.org/pdf')) {
    const result = parseArxivUrl(url);
    return { type: 'arxiv', field: 'pdfUrl', arxivId: result.arxivId };
  }
  if (url.includes('github.com')) {
    return { type: 'github', field: 'codeUrl' };
  }
  if (url.includes('feishu.cn') || url.includes('larksuite.com') || url.includes('larkoffice.com')) {
    return { type: 'feishu', field: 'feishuNoteUrl' };
  }
  return { type: 'other' };
}

const ARXIV_PAPER_TEMPLATES = [
  {
    titlePrefix: 'Efficient',
    titles: [
      'Vision-Language-Action Models via Hierarchical Decoding',
      'Visual SLAM with Dynamic Object Removal',
      'Diffusion Policy for Robotic Manipulation',
      'Multi-Sensor Fusion with Factor Graphs',
      '3D Object Detection from Point Clouds',
      'Visual-Inertial Odometry for Agile Flight',
    ],
    authors: [
      'Wei Zhang, Yuxin Chen, Hao Wang',
      'Jian Li, Mingyu Zhao, Xiaoming Liu',
      'Sarah Chen, David Kim, Michael Brown',
      'Alex Yang, Lisa Wang, Tom Zhang',
    ],
    venues: ['ICRA', 'IROS', 'CVPR', 'NeurIPS', 'CoRL', 'RSS'],
    keywords: [
      ['VLA', 'hierarchical decoding', 'efficient inference'],
      ['SLAM', 'dynamic scenes', 'motion removal'],
      ['diffusion model', 'policy learning', 'manipulation'],
      ['sensor fusion', 'factor graph', 'optimization'],
      ['3D detection', 'point cloud', 'transformer'],
      ['VIO', 'agile flight', 'visual-inertial'],
    ],
    summaries: [
      '提出分层动作解码策略，将VLA推理速度提升3倍，同时保持95%以上的任务成功率。',
      '在动态环境中实现鲁棒的视觉SLAM，通过语义分割和运动一致性检测移除动态物体。',
      '将扩散模型应用于机器人策略学习，在复杂操作任务上超越行为克隆和强化学习方法。',
      '基于因子图的多传感器融合框架，支持激光、视觉、IMU等多种传感器的灵活组合。',
      '基于Transformer的三维目标检测方法，在点云数据上实现SOTA的检测精度和速度。',
      '面向敏捷飞行的视觉惯性里程计算法，在高速运动下仍能保持低漂移。',
    ],
  },
  {
    titlePrefix: 'Scaling',
    titles: [
      'Robotics Foundation Models with 1000 Tasks',
      'Sim-to-Real Transfer with Domain Randomization',
      'Dexterous Manipulation via Tactile Feedback',
      'Embodied AI for Long-Horizon Tasks',
      'Semantic SLAM with Foundation Models',
      'World Models for Model-Based RL',
    ],
    authors: [
      'Emily Park, John Smith, Anna Lee',
      'Mohamed Ali, Sara Jones, Ryan Moore',
      'Kevin Zhang, Nicole Wang, James Liu',
      'Rachel Brown, Tom Wilson, Emma Davis',
      'Frank Miller, Sophia Chen, Daniel Lee',
      'Grace Zhao, Adam Wright, Olivia Sun',
    ],
    venues: ['Science Robotics', 'Nature Machine Intelligence', 'ICML', 'ICRA', 'IROS', 'RSS'],
    keywords: [
      ['foundation model', 'scaling', 'multi-task'],
      ['sim-to-real', 'domain randomization', 'transfer learning'],
      ['dexterous manipulation', 'tactile sensing', 'multi-finger'],
      ['embodied AI', 'long-horizon', 'planning'],
      ['semantic SLAM', 'foundation model', 'mapping'],
      ['world model', 'model-based RL', 'planning'],
    ],
    summaries: [
      '在1000个机器人任务上训练的基础模型，展示了强大的零样本泛化能力。',
      '通过大规模域随机化实现从仿真到现实的零样本迁移，成功率达到87%。',
      '结合触觉反馈的灵巧操作方法，在复杂物体操作任务上表现出色。',
      '面向长周期任务的具身智能系统，能够完成需要多步推理的复杂操作。',
      '利用基础模型构建语义SLAM系统，实现了对动态环境的语义理解和建图。',
      '基于世界模型的强化学习方法，显著提升了样本效率和策略性能。',
    ],
  },
  {
    titlePrefix: 'Learning',
    titles: [
      'Imitation Learning from Suboptimal Demonstrations',
      'Reinforcement Learning with Sparse Rewards',
      'Offline RL for Robot Navigation',
      'Inverse Reinforcement Learning from Observations',
      'Meta-Learning for Fast Adaptation',
      'Self-Supervised Representation Learning',
    ],
    authors: [
      'David Kim, Jennifer Lee, Robert Chen',
      'Michael Wang, Lisa Zhang, William Brown',
      'Emma Davis, Alex Wilson, Sarah Miller',
      'James Liu, Rachel Green, Kevin White',
      'Olivia Sun, Frank Black, Sophia Gray',
      'Daniel Lee, Grace Wilson, Adam Taylor',
    ],
    venues: ['ICML', 'NeurIPS', 'ICLR', 'CoRL', 'AAAI', 'IROS'],
    keywords: [
      ['imitation learning', 'suboptimal demo', 'behavior cloning'],
      ['reinforcement learning', 'sparse reward', 'exploration'],
      ['offline RL', 'navigation', 'batch learning'],
      ['inverse RL', 'apprenticeship', 'reward learning'],
      ['meta-learning', 'few-shot', 'fast adaptation'],
      ['self-supervised', 'representation', 'pretraining'],
    ],
    summaries: [
      '从次优演示中学习的模仿学习方法，能够超越演示者的性能水平。',
      '面向稀疏奖励的强化学习算法，通过内在奖励驱动有效探索。',
      '离线强化学习在机器人导航中的应用，利用历史数据训练策略。',
      '仅从观测中学习奖励函数的逆强化学习方法，无需动作标签。',
      '元学习框架使机器人能够在少量样本下快速适应新任务。',
      '自监督表示学习为机器人感知和控制任务提供通用特征。',
    ],
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function mockFetchArxivPaper(arxivUrl: string): Promise<{
  title: string;
  authors: string;
  year: number;
  venue: string;
  arxivUrl: string;
  pdfUrl: string;
  methodKeywords: string[];
  oneSentenceSummary: string;
  problem: string;
  coreContribution: string;
  methodSketch: string;
  evidence: {
    tasks: string[];
    baselines: string[];
    metrics: string[];
    keyResults: string[];
  };
  assumptions: string[];
  limitations: string[];
  questionsToVerify: string[];
} | null> {
  const parsed = parseArxivUrl(arxivUrl);
  if (!parsed.arxivId) return null;

  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  const arxivId = parsed.arxivId;
  const hash = hashString(arxivId);
  const templateIdx = hash % ARXIV_PAPER_TEMPLATES.length;
  const template = ARXIV_PAPER_TEMPLATES[templateIdx];
  const paperIdx = hash % template.titles.length;

  const idNumMatch = arxivId.match(/^(\d{4})\.?\d+/);
  let year = new Date().getFullYear();
  if (idNumMatch) {
    const yy = parseInt(idNumMatch[1].slice(0, 2));
    year = yy >= 90 ? 1900 + yy : 2000 + yy;
  }

  const venueIdx = hash % template.venues.length;

  const summary = template.summaries[paperIdx];
  const keywords = template.keywords[paperIdx].slice(0, 3).join('、');

  return {
    title: template.titles[paperIdx],
    authors: template.authors[paperIdx % template.authors.length],
    year,
    venue: template.venues[venueIdx],
    arxivUrl: parsed.arxivUrl!,
    pdfUrl: parsed.pdfUrl!,
    methodKeywords: template.keywords[paperIdx],
    oneSentenceSummary: summary,
    problem: `${keywords}在实际应用中面临性能瓶颈或泛化能力不足的问题。`,
    coreContribution: `提出了一种基于${keywords}的新方法，通过${['分层设计', '优化算法', '数据增强', '模型蒸馏'][hash % 4]}策略，在相关任务上实现了性能提升。`,
    methodSketch: `1) ${['数据预处理', '特征提取', '模型训练', '推理优化'][hash % 4]}；2) ${['关键模块设计', '损失函数优化', '架构调整', '训练策略改进'][hash % 4]}；3) ${['实验验证', '结果分析', '对比实验', '消融实验'][hash % 4]}；4) ${['性能评估', '泛化测试', '鲁棒性验证', '效率分析'][hash % 4]}。`,
    evidence: {
      tasks: ['标准基准任务', '复杂场景任务', '泛化测试任务'],
      baselines: ['传统方法', 'SOTA方法', '简化方法'],
      metrics: ['准确率/成功率', '推理速度', '内存占用'],
      keyResults: ['性能提升15-20%', '推理速度提升2-3倍', '泛化能力增强'],
    },
    assumptions: ['训练数据分布与测试数据一致', '传感器噪声在可接受范围内', '计算资源充足'],
    limitations: ['在极端场景下性能下降', '计算开销较大', '需要进一步验证泛化能力'],
    questionsToVerify: ['在真实机器人环境中表现如何？', '与其他方法的对比如何？', '长期运行的稳定性？'],
  };
}

export async function mockExtractAssumptions(paper: Paper): Promise<{
  taskAssumptions: string[];
  sensingAssumptions: string[];
  dataAssumptions: string[];
  robotAssumptions: string[];
  evaluationAssumptions: string[];
  verificationQuestions: string[];
}> {
  await delay(600 + Math.random() * 400);

  const keywords = paper.methodKeywords || [];
  const hasSensor = keywords.some(k => k.toLowerCase().includes('lidar') || k.toLowerCase().includes('camera') || k.toLowerCase().includes('imu') || k.toLowerCase().includes('sensor'));
  const hasVision = keywords.some(k => k.toLowerCase().includes('visual') || k.toLowerCase().includes('vision') || k.toLowerCase().includes('rgb'));
  const hasLearning = keywords.some(k => k.toLowerCase().includes('learning') || k.toLowerCase().includes('rl') || k.toLowerCase().includes('diffusion'));

  return {
    taskAssumptions: [
      '任务环境满足特定结构假设',
      '机器人能够稳定执行基础动作',
      '任务目标明确且可量化',
    ],
    sensingAssumptions: hasSensor ? [
      '传感器标定参数准确',
      '传感器噪声服从已知分布',
      '传感器数据同步准确',
    ] : [],
    dataAssumptions: hasLearning ? [
      '训练数据与测试数据分布一致',
      '数据标注质量足够高',
      '数据量足以支撑模型学习',
    ] : [],
    robotAssumptions: [
      '机器人运动模型已知且准确',
      '执行器响应延迟可忽略',
      '机器人状态可观测',
    ],
    evaluationAssumptions: [
      '评估指标能够反映真实性能',
      '测试集具有代表性',
      '实验设置可重复',
    ],
    verificationQuestions: [
      '这些假设在真实场景中是否成立？',
      '如何验证假设的有效性？',
      '违反假设会导致什么后果？',
    ],
  };
}

export async function mockExtractGaps(paper: Paper): Promise<{
  gaps: {
    description: string;
    evidenceFor: string;
    whyWeak: string;
  }[];
}> {
  await delay(800 + Math.random() * 500);

  const gapTemplates = [
    {
      description: '未见任务的泛化能力',
      evidenceFor: '论文仅在有限的测试任务上验证了方法，未见任务的泛化能力尚未充分验证',
      whyWeak: '真实世界中的任务多样性远超测试集，泛化能力可能被高估',
    },
    {
      description: '极端条件下的鲁棒性',
      evidenceFor: '实验设置相对理想，未测试极端光照、遮挡或传感器故障等情况',
      whyWeak: '实际应用中这些极端条件很常见，鲁棒性不足可能导致系统失效',
    },
    {
      description: '计算效率与实时性',
      evidenceFor: '论文未充分讨论推理时间和计算资源需求，可能无法满足实时控制要求',
      whyWeak: '许多机器人应用对实时性要求严格，计算效率是关键限制因素',
    },
    {
      description: '数据依赖性',
      evidenceFor: '方法可能依赖大量特定类型的数据，数据收集成本高',
      whyWeak: '数据可用性是实际部署的重要瓶颈，数据依赖性强会限制方法的适用性',
    },
    {
      description: '长期稳定性',
      evidenceFor: '实验通常在较短时间内完成，未验证长期运行的稳定性和漂移特性',
      whyWeak: '长期稳定性是实际应用的基本要求，短期实验无法充分验证',
    },
  ];

  const shuffled = gapTemplates.sort(() => Math.random() - 0.5);
  return {
    gaps: shuffled.slice(0, 3),
  };
}

export async function mockEvaluateIdea(idea: {
  title: string;
  researchQuestion: string;
  coreHypothesis: string;
  roboticsTask?: string;
  baseline?: string;
}): Promise<{
  scores: {
    criterion: string;
    score: number;
    notes: string;
  }[];
  recommendation: 'proceed' | 'revise' | 'drop';
  recommendationReason: string;
  revisedHypothesis?: string;
}> {
  await delay(1000 + Math.random() * 600);

  const scoreCriteria = [
    {
      criterion: '重要性',
      score: 3 + Math.floor(Math.random() * 3),
      notes: [
        '该问题在机器人领域具有一定的研究价值',
        '解决该问题可能带来实际应用价值',
        '与当前研究趋势相符',
      ][Math.floor(Math.random() * 3)],
    },
    {
      criterion: '新颖性',
      score: 2 + Math.floor(Math.random() * 3),
      notes: [
        '该方向已有一些相关工作',
        '需要进一步挖掘创新点',
        '与现有方法有一定区别',
      ][Math.floor(Math.random() * 3)],
    },
    {
      criterion: '可测试性',
      score: 3 + Math.floor(Math.random() * 3),
      notes: [
        '可以通过实验验证假设',
        '有明确的评估指标',
        '实验设置相对简单',
      ][Math.floor(Math.random() * 3)],
    },
    {
      criterion: '可行性',
      score: 3 + Math.floor(Math.random() * 3),
      notes: [
        '所需资源和技术条件具备',
        '有成熟的工具和框架可利用',
        '时间成本在可接受范围内',
      ][Math.floor(Math.random() * 3)],
    },
    {
      criterion: '基线清晰度',
      score: idea.baseline ? 4 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2),
      notes: idea.baseline ? '基线方法明确，可以进行有效对比' : '基线方法需要进一步明确',
    },
    {
      criterion: '证据质量',
      score: 3 + Math.floor(Math.random() * 2),
      notes: [
        '有一定的文献支撑',
        '需要更多实验证据',
        '理论基础相对扎实',
      ][Math.floor(Math.random() * 3)],
    },
    {
      criterion: '风险意识',
      score: 3 + Math.floor(Math.random() * 2),
      notes: [
        '已识别主要风险因素',
        '需要制定风险应对策略',
        '风险可控',
      ][Math.floor(Math.random() * 3)],
    },
    {
      criterion: '长期价值',
      score: 2 + Math.floor(Math.random() * 3),
      notes: [
        '可能产生有影响力的成果',
        '可以为后续研究奠定基础',
        '有潜力扩展到其他领域',
      ][Math.floor(Math.random() * 3)],
    },
  ];

  const avgScore = scoreCriteria.reduce((sum, s) => sum + s.score, 0) / scoreCriteria.length;
  let recommendation: 'proceed' | 'revise' | 'drop' = 'revise';
  let recommendationReason = '';

  if (avgScore >= 4) {
    recommendation = 'proceed';
    recommendationReason = '该想法在重要性、新颖性和可行性方面表现良好，可以继续推进。建议尽快设计MVE进行验证。';
  } else if (avgScore >= 3) {
    recommendation = 'revise';
    recommendationReason = '该想法有一定潜力，但在某些方面需要改进。建议先完善假设和基线，再进行实验验证。';
  } else {
    recommendation = 'drop';
    recommendationReason = '该想法在新颖性或可行性方面存在明显不足。建议重新审视研究方向或问题定义。';
  }

  return {
    scores: scoreCriteria,
    recommendation,
    recommendationReason,
    revisedHypothesis: recommendation === 'revise' ? `${idea.coreHypothesis} 需要在${scoreCriteria.sort((a, b) => a.score - b.score)[0].criterion}方面进一步细化。` : undefined,
  };
}
