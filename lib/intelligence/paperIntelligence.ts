// Paper Intelligence - 论文理解卡片
// 纯静态数据，不依赖任何 Context 或 API

export interface PaperIntelligence {
  id: string;
  title: string;
  area: string;
  problem: string;
  motivation: string;
  coreIdea: string;
  method: string;
  evidence: string;
  limitations: string;
  hiddenAssumptions: string;
  whyItMatters: string;
  possibleExtensions: string;
  readingPrompts: string[];
}

export const paperIntelligenceList: PaperIntelligence[] = [
  {
    id: 'rt-1',
    title: 'RT-1: Robotics Transformer for Real-World Control at Scale',
    area: 'VLA',
    problem: '如何让单一的 Transformer 模型直接从视觉和自然语言指令生成可执行机器人动作，并在大量真实任务上保持可泛化性？',
    motivation: '传统机器人学习方法每个任务都要单独训练，泛化性差；而 NLP/CV 领域的 foundation model 展示了"一个模型多任务"的可能性，机器人领域急需类似的范式。',
    coreIdea: '将机器人控制建模为序列建模问题：把图像、语言指令、动作历史统一 tokenize 后输入 Transformer，输出离散化动作 token，实现多任务、可泛化的端到端控制。',
    method: 'RT-1 用 ViT 编码图像，用 TokenLearner 压缩 token 数量，与语言 token 拼接后输入 Transformer decoder，输出 7 维离散化动作（夹爪、位移、旋转）。训练数据来自 13 万条真实机器人 demo。',
    evidence: '在 700+ 真实任务上达到 97% 成功率，比 Gato、SayCan 等 baseline 在 long-horizon 和 unseen task 上显著领先。在新指令、新物体、新背景上展现 strong generalization。',
    limitations: '推理速度慢（1-3Hz），难以做高频动态任务；训练数据全部来自单一机器人形态（Google Robot），跨 embodiment 能力未验证；动作空间离散化损失精度。',
    hiddenAssumptions: '假设相机视角固定；假设物体在夹爪工作空间内；假设 demo 质量足够高；假设单帧观测足够（无显式记忆）。',
    whyItMatters: 'RT-1 是第一个在真实机器人上展示 "scaling law" 的工作，证明训练数据量与任务泛化能力正相关，奠定了后续 VLA 研究（RT-2、OpenVLA）的数据驱动路线。',
    possibleExtensions: '加入历史帧实现记忆；探索 cross-embodiment 训练；提升推理速度以支持动态任务；与 RL 结合进行 online improvement。',
    readingPrompts: [
      '为什么 RT-1 选择离散化动作而非连续输出？这种取舍带来什么后果？',
      'TokenLearner 在架构中起什么作用？去掉会有什么影响？',
      'RT-1 的 generalization 实验设计如何？是否覆盖所有可能的 distribution shift？',
      '如果你只有 1/10 的数据，RT-1 的性能会下降多少？如何缓解？',
    ],
  },
  {
    id: 'rt-2',
    title: 'RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control',
    area: 'VLA',
    problem: '如何让机器人策略利用互联网上的大规模视觉-语言知识（如物体识别、常识、语义关系），而不是仅靠机器人数据训练？',
    motivation: 'RT-1 证明了 scaling 机器人数据有效，但机器人数据采集成本高、覆盖窄。如果能直接复用 VLM 在互联网数据上学到的语义知识，就能实现更广的概念泛化（如"拿那个史努比玩具"，即使训练数据没见过）。',
    coreIdea: '将机器人动作 token 嵌入到 VLM 的输出词表中，让 VLM 在 co-finetuning 阶段同时学习网络语义和机器人动作，实现 web knowledge → robotic control 的迁移。',
    method: '基于 PaLI-X 和 PaLM-E 两个 VLM，将 RT-1 的 7 维动作离散为 256 个 token，作为 VLM 的"新语言"。在 web 数据 + 机器人数据上联合 finetune，VLM 既能输出文本也能输出动作。',
    evidence: '在 unseen 物体、颜色、物体类别上 generalization 显著提升（如 "move the apple to the cup with the red straw"）。PAI-X VLA 在 unseen category 上 62% vs RT-1 32%。',
    limitations: '推理速度更慢（1-3Hz，比 RT-1 没有提升甚至更慢）；模型巨大（5B / 56B 参数）部署成本高；仍然依赖固定视角；需要大规模 VLM pretrain。',
    hiddenAssumptions: '假设 VLM 学到的语义知识可直接映射到动作空间；假设 web 数据的语义关系在机器人场景下成立；假设动作 token 嵌入与语言 token 嵌入兼容。',
    whyItMatters: 'RT-2 首次证明 VLA 可以从 web 知识中受益，开创了 "VLM as backbone for robot policy" 范式，直接影响了 OpenVLA、π0 等后续工作。',
    possibleExtensions: '探索更小的 VLA 模型（如 1B 以下）；优化推理速度；探索 cross-embodiment；与 RL 结合做 online finetune。',
    readingPrompts: [
      '为什么将动作 token 嵌入到 VLM 词表比单独训练 policy head 更有效？',
      'RT-2 的 co-finetuning 与直接 finetune 有什么本质区别？',
      '5B 和 56B 模型的性能差异在哪里？是否值得部署 56B？',
      '如果 VLM 学到了错误的 web 知识，VLA 会有什么行为？如何纠正？',
    ],
  },
  {
    id: 'openvla',
    title: 'OpenVLA: An Open-Source Vision-Language-Action Model',
    area: 'VLA',
    problem: 'RT-2 等闭源 VLA 性能强但模型不公开，研究社区无法改进。如何构建一个开源、可复现、可在消费级 GPU 上训练的 VLA？',
    motivation: 'VLA 研究需要大规模实验和迭代，但 Google 的 RT-2 等模型不开放。社区急需一个 baseline 来推动 VLA 研究 democratize。',
    coreIdea: '基于 Llama 2 7B 和 SigLIP 视觉编码器，构建开源 VLA，通过 Open X-Embodiment 数据集训练，在标准 benchmark 上与闭源 VLA 可比。',
    method: 'SigLIP 编码图像 → 投影到 Llama 2 embedding 空间 → 与语言指令 token 拼接 → Llama 2 输出动作 token → decode 为连续动作。训练数据：Open X-Embodiment 970K episodes。',
    evidence: '在 WidowX BridgeData V2 和 Google Robot 上比 RT-1 提升 9-16%；在新任务 finetune 比 RT-2 更样本高效；可在单张 A100 上 finetune。',
    limitations: '7B 模型推理仍较慢（~7Hz）；动作输出为单一 deterministic 值，无法表达多模态分布；in-context learning 能力弱于 RT-2。',
    hiddenAssumptions: '假设 7B 规模足以匹配 RT-2 的能力；假设 Open X-Embodiment 数据多样性足够；假设 action chunk 不是必要的。',
    whyItMatters: 'OpenVLA 让 VLA 研究从闭源走向开源，是社区的 baseline。它的发布催生了一系列 follow-up 工作（π0、TinyVLA、ECoVLA 等）。',
    possibleExtensions: '加入 action chunking 提升长程任务能力；探索 mixture-of-experts 降低推理成本；用 flow matching 替代确定性输出。',
    readingPrompts: [
      '为什么 OpenVLA 选 Llama 2 而非更新的 Llama 3？这种选择有什么 trade-off？',
      'SigLIP vs CLIP 在 VLA 场景下哪个更合适？为什么？',
      'OpenVLA 在 multi-task 表现弱于 single-task 模型，原因是什么？',
      '如果给 OpenVLA 加上 action chunking，预期能带来多少提升？',
    ],
  },
  {
    id: 'pi0',
    title: 'π0: A Vision-Language-Action Flow Model for General Robot Control',
    area: 'VLA',
    problem: '现有 VLA 输出单一动作（deterministic），无法表达多模态动作分布，且对高频任务（如折叠衣服）支持不好。如何让 VLA 同时具备语义理解和精细动作生成能力？',
    motivation: '机器人动作本质是多模态的（同一观测下有多种合理动作），而 RT-1/2、OpenVLA 都用 argmax 输出确定性动作，限制了能力。Diffusion / flow matching 能表达多模态，但如何与 VLM 结合是开放问题。',
    coreIdea: '将 VLM 与 flow matching action generator 结合：VLM 负责高层语义理解，flow matching 在 VLM 的 hidden state 上做条件生成，输出 action chunk（多步动作）。',
    method: '基于 PaliGemma 视觉-语言 backbone + flow matching action expert，在 largest open-source robot dataset（10K hours）上训练。Action expert 输出 action chunk（50 步），支持高频控制。',
    evidence: '在 5 个真实机器人平台（Franka、UR、ARX、SO-100、xArm）和多种任务（折叠、收拾桌面、组装）上展现 SOTA 性能。比 OpenVLA 在 long-horizon 任务上提升 30%+。',
    limitations: '训练数据规模巨大（10K hours）非普通实验室可得；flow matching 训练稳定性需关注；cross-embodiment generalization 仍有限；real-time 推理优化未公开。',
    hiddenAssumptions: '假设 action chunk 是必要的；假设 flow matching 比 diffusion 更适合 action 生成；假设大规模数据可弥补单一架构的局限。',
    whyItMatters: 'π0 是第一个在多机器人形态、多任务上展现通用能力的 VLA，开创了 VLM + flow matching 范式，代表了 VLA 从"模仿 RT-2"到"超越 RT-2"的转折。',
    possibleExtensions: '探索更小的 flow matching action expert；优化 cross-embodiment；与 RL 结合做 online finetune；加入 safety constraint。',
    readingPrompts: [
      '为什么 flow matching 比 diffusion 更适合 action 生成？速度、质量、稳定性各有什么差异？',
      'Action chunk 的 50 步是怎么选的？过短或过长有什么后果？',
      'π0 在 5 个机器人上的表现差异在哪里？是否真的通用？',
      '为什么 π0 不直接输出整个轨迹，而是 action chunk？',
    ],
  },
  {
    id: 'pi05',
    title: 'π0.5: a Vision-Language-Action Model with Open-World Generalization',
    area: 'VLA',
    problem: 'π0 虽然强大，但只在训练数据覆盖的机器人形态和任务上 work。如何让 VLA 在新环境、新指令、新物体上泛化，甚至迁移到训练时未见的机器人平台？',
    motivation: '真实部署需要 VLA 在 OOD（out-of-distribution）场景下仍能 work，而 π0 的泛化能力受限于训练数据分布。需要一个能"开箱即用"到新场景的 VLA。',
    coreIdea: '在 π0 基础上引入"开放世界泛化"机制，通过大规模 web 数据 + 多样化机器人数据 + 高层-低层分层架构，让模型对未见环境具备鲁棒性。',
    method: '基于 π0 架构，扩展训练数据（更多 web 数据、更多机器人平台），引入高层 planning 和低层 action 生成的分层结构，让模型在低层未见时也能通过高层 reasoning 适应。',
    evidence: '在新家庭、新厨房等真实场景，相比 π0 在 unseen instruction 上提升 20%+；可迁移到训练时未见的机器人平台（少量 finetune 即可）。',
    limitations: '仍需要大规模数据；分层架构增加训练复杂度；对完全 OOD 的任务（如新动作原语）仍 fail；部署成本高。',
    hiddenAssumptions: '假设高层 planning 可弥补低层未见；假设新场景的物体和动作可由已知原语组合；假设少量 finetune 足以适配新机器人。',
    whyItMatters: 'π0.5 展示了 VLA 从"训练分布内泛化"到"开放世界泛化"的可能性，是 VLA 走向真实部署的重要一步。',
    possibleExtensions: '探索 zero-shot cross-embodiment；引入主动学习处理 OOD；与人类反馈结合做 alignment。',
    readingPrompts: [
      'π0.5 的"高层-低层"分层与 SayCan 的分层有什么本质区别？',
      '开放世界泛化的边界在哪里？什么样的 OOD 仍会 fail？',
      '为什么 π0.5 可以迁移到未见机器人？关键机制是什么？',
      '相比 π0，π0.5 的数据需求增加多少？',
    ],
  },
  {
    id: 'diffusion-policy',
    title: 'Diffusion Policy: Visuomotor Policy Learning via Action Diffusion',
    area: 'Diffusion Policy',
    problem: '传统 BC 输出确定性动作，无法表达多模态动作分布；GMM 等方法建模能力有限。如何让机器人 policy 自然处理多模态动作？',
    motivation: '机器人任务本质多模态：同一观测下多种合理动作（如绕左绕右都能避障）。确定性 BC 会"平均化"导致失败。Diffusion model 在图像生成上展示了强大的多模态建模能力，能否迁移到 action 生成？',
    coreIdea: '将机器人 action 视作"图像"用 diffusion model 生成，condition on visual observation，自然表达多模态动作分布。引入 action chunk（预测未来多步）和 recurrent horizon 提升时序一致性。',
    method: '两种变体：①CNN-based diffusion（DDPM 在 action 序列上）②Transformer-based diffusion。Condition on visual observation via FiLM 或 cross-attention。预测 horizon=16 的 action chunk，每次执行前几步。',
    evidence: '在 4 个任务（Push-T、Can、Mango、Lift）上比 IBC、BC-RNN 提升 20-50%；在真实 Franka 任务（折叠、抓取）上展示 robust 多模态处理；首个用 diffusion 在真实机器人上 work 的方法。',
    limitations: '推理速度慢（DDPM 多步去噪）；对超参数敏感（noise schedule、horizon）；理论分析缺乏；只在短程任务上验证，long-horizon 表现未充分。',
    hiddenAssumptions: '假设 action 服从可被 diffusion 建模的分布；假设观测充分；假设 action chunk 内部时序一致；假设 demo 质量一致。',
    whyItMatters: 'Diffusion Policy 开创了 diffusion 在 robot policy 上的应用，是当前 manipulation 的 SOTA 之一，影响了 π0（flow matching 是 diffusion 的变种）、3D Diffusion Policy 等后续工作。',
    possibleExtensions: '用 DDIM 加速推理；引入 3D 条件；结合 RL 做 online improvement；扩展到 long-horizon。',
    readingPrompts: [
      '为什么 diffusion 比 GMM 更适合多模态 action 建模？',
      'Action chunk 内部时序一致性的机制是什么？recurrent horizon 如何工作？',
      'CNN-based 和 Transformer-based 两种变体的差异在哪里？',
      '为什么 horizon=16？过短或过长有什么后果？',
    ],
  },
  {
    id: 'libero',
    title: 'LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning',
    area: 'Benchmark',
    problem: '机器人学习研究缺乏标准化 benchmark 来评估 lifelong learning 和 knowledge transfer，导致方法间不可比。如何设计一个包含多任务、多难度、支持 lifelong 评估的 benchmark？',
    motivation: '现有 benchmark（如 Meta-World、CALVIN）各有局限：任务多样性不够、不支持 lifelong 评估、缺乏标准协议。需要一个统一的、可扩展的 benchmark 推动社区发展。',
    coreIdea: 'LIBERO 基于 RoboSuite 仿真器，提供 130 个 manipulation 任务，分为 5 个 suite（spatial、object、goal、long、10-task），每个 suite 测试不同的 transfer 维度。',
    method: '用 procedural 生成创建任务多样性；每个任务有标准 demo 数据；提供 BC、SQIL、CoLLETIVE 等 baseline；支持 lifelong learning 协议（任务流，评估 forward/backward transfer）。',
    evidence: '在 5 个 suite 上系统对比了 7 个 baseline，揭示现有方法在 long-horizon 和 object generalization 上的不足；提供标准化评估协议。',
    limitations: '只在仿真，sim-to-real gap 未处理；任务复杂度有限（主要是桌面 manipulation）；不包含 locomotion 或 mobile manipulation；procedural 生成可能产生非自然任务。',
    hiddenAssumptions: '假设仿真任务可代表真实挑战；假设 procedural 生成合理；假设 baseline 实现公平。',
    whyItMatters: 'LIBERO 是当前 VLA 和 lifelong learning 研究的标准 benchmark，被 OpenVLA、π0、3D Diffusion Policy 等工作广泛使用，是 manipulation 方法的"通用测试集"。',
    possibleExtensions: '加入 real-world 任务；扩展到 mobile manipulation；引入 multi-modal observation；设计 long-horizon 协议。',
    readingPrompts: [
      'LIBERO 的 5 个 suite 分别测试什么 transfer 维度？',
      '为什么用 procedural 生成而非手工设计任务？',
      'BC、SQIL、CoLLETIVE 在 LIBERO 上的性能差异揭示了什么？',
      '如果要在 LIBERO 上设计 lifelong learning 协议，应该注意什么？',
    ],
  },
  {
    id: 'robomme',
    title: 'RoboMME: A Comprehensive Benchmark for Robotic Multi-Modal Evaluation',
    area: 'Benchmark',
    problem: '现有机器人 benchmark 主要评估单一模态（视觉或视觉+语言），缺少对多模态感知（深度、触觉、点云、语言）的系统评估。如何设计一个全面的多模态机器人 benchmark？',
    motivation: '真实机器人需要融合多模态感知（RGB + Depth + 触觉 + 力觉 + 语言），但现有 benchmark 难以评估多模态融合能力。社区需要一个统一评估多模态策略的 benchmark。',
    coreIdea: 'RoboMME 提供包含 5 类模态（RGB、深度、点云、触觉、语言）的机器人任务集，支持单模态、双模态、多模态评估，覆盖 manipulation 和 locomotion 两类任务。',
    method: '在仿真器中配置多种传感器（相机、深度相机、触觉传感器、力矩传感器），提供 50+ 任务，每个任务有多种模态观测。评估协议包括：单模态性能、模态融合增益、模态缺失鲁棒性。',
    evidence: '系统评估了 5 个 baseline（BC、Diffusion Policy、CLIP-based policy 等）在不同模态组合下的表现，揭示多模态融合的 trade-off。',
    limitations: '仿真传感器的真实性与现实有差距；触觉仿真仍不成熟；任务数量相对 Meta-World 等少；long-horizon 任务有限。',
    hiddenAssumptions: '假设仿真传感器可代表真实传感器；假设多模态融合在仿真和真实表现一致；假设评估协议公平。',
    whyItMatters: 'RoboMME 填补了多模态机器人评估的空白，为 VLA、embodied AI 的多模态研究提供了标准化平台。',
    possibleExtensions: '加入真实传感器数据；扩展到 mobile manipulation；设计模态缺失下的鲁棒性协议；引入语言指令的多轮对话。',
    readingPrompts: [
      'RoboMME 的 5 类模态如何对齐？时序同步怎么处理？',
      '多模态融合在哪些任务上有显著增益？哪些任务反而下降？',
      '触觉仿真的真实性如何评估？是否可信？',
      '如果要在 RoboMME 上评估 VLA，应该选哪些任务？',
    ],
  },
];
