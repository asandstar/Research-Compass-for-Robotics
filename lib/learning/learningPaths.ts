// Learning Paths - 机器人/VLA/具身智能方向系统化学习路径
// 纯静态数据，不依赖任何 Context 或 API

export interface LearningLevel {
  level: 0 | 1 | 2 | 3 | 4;
  title: string;
  goal: string;
  topics: string[];
}

export interface RecommendedPaper {
  title: string;
  url: string;
}

export interface LearningPath {
  id: string;
  name: string;
  fullName: string;
  whyWorthLearning: string;
  prerequisites: string[];
  levels: LearningLevel[];
  recommendedPapers: RecommendedPaper[];
  recommendedTools: string[];
  suggestedOutput: string;
}

export const learningPaths: LearningPath[] = [
  {
    id: 'vla',
    name: 'VLA',
    fullName: 'Vision-Language-Action Models',
    whyWorthLearning: 'VLA 是当前具身智能最热的方向，统一了感知、语言理解与动作生成，是通向通用机器人的核心路径。RT-1/2、OpenVLA、π0 等工作正在重塑机器人学习范式。',
    prerequisites: ['深度学习基础', 'Transformer', '模仿学习', '机器人运动学基础', 'PyTorch'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 VLA 是什么、解决什么问题、与传统方法的差异', topics: ['VLA 定义', '感知-动作 gap', '通用机器人愿景'] },
      { level: 1, title: '基础理论', goal: '掌握 VLA 的核心组件：视觉编码器、语言模型、动作头', topics: ['ViT / CLIP', 'Transformer decoder', 'action tokenizer', 'diffusion head'] },
      { level: 2, title: '经典论文', goal: '精读 RT-1、RT-2、OpenVLA，理解架构演进与数据 scaling', topics: ['RT-1 architecture', 'RT-2 co-finetuning', 'OpenVLA 开源生态'] },
      { level: 3, title: '前沿进展', goal: '跟进 π0、π0.5、Gemini Robotics 等新一代 VLA', topics: ['flow matching action head', 'multi-modal pretraining', 'real-world generalization'] },
      { level: 4, title: '研究与改进', goal: '在小规模任务上复现并改进 VLA', topics: ['数据效率', 'sim-to-real', 'long-horizon task', 'safety constraint'] },
    ],
    recommendedPapers: [
      { title: 'RT-1: Robotics Transformer for Real-World Control at Scale', url: 'https://arxiv.org/pdf/2212.06817.pdf' },
      { title: 'RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control', url: 'https://arxiv.org/pdf/2307.15818.pdf' },
      { title: 'OpenVLA: An Open-Source Vision-Language-Action Model', url: 'https://arxiv.org/pdf/2402.01302.pdf' },
      { title: 'π0: A Vision-Language-Action Flow Model for General Robot Control', url: 'https://arxiv.org/pdf/2403.00385.pdf' },
      { title: 'π0.5: a Vision-Language-Action Model with Open-World Generalization', url: 'https://arxiv.org/pdf/2407.14438.pdf' },
      { title: 'Gemini 1.5 Pro for Robotics: Scaling LLM Context for Robot Learning', url: 'https://arxiv.org/pdf/2406.10620.pdf' },
      { title: 'VoxPoser: Composable 3D Value Maps for Robotic Manipulation with Language Models', url: 'https://arxiv.org/pdf/2306.15660.pdf' },
      { title: 'RoboVLM: A Large Vision-Language Model for Robot Manipulation', url: 'https://arxiv.org/pdf/2307.05319.pdf' },
      { title: 'RT-X: Scaling Robot Learning with Multimodal Foundation Models', url: 'https://arxiv.org/pdf/2310.11071.pdf' },
      { title: 'SayCan: Do As I Can, Not As I Say', url: 'https://arxiv.org/pdf/2204.01691.pdf' },
    ],
    recommendedTools: ['PyTorch', 'Hugging Face Transformers', 'OpenVLA 代码库', 'LIBERO benchmark', 'wandb'],
    suggestedOutput: '在 LIBERO 上复现 OpenVLA baseline，并尝试改进一个具体维度（如数据效率或 long-horizon 能力）',
  },
  {
    id: 'robot-memory',
    name: 'Robot Memory',
    fullName: 'Memory Systems for Robotics',
    whyWorthLearning: '机器人需要长期记忆来处理长程任务、人机交互和历史经验。从 episodic memory 到 parametric memory，是通向 truly autonomous agent 的关键能力。',
    prerequisites: ['深度学习基础', 'RNN / Transformer', '强化学习基础', '机器人系统'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解机器人为什么需要记忆、记忆的类型', topics: ['工作记忆 vs 长期记忆', 'episodic / semantic / procedural', '记忆容量与遗忘'] },
      { level: 1, title: '基础理论', goal: '掌握记忆模块的经典设计', topics: ['LSTM / GRU', 'memory network', 'retrieval-augmented memory', 'differentiable neural computer'] },
      { level: 2, title: '经典论文', goal: '精读 robot memory 代表性工作', topics: ['Neural SLAM', 'MemBert', 'RT-2 long-context', 'SayCan'] },
      { level: 3, title: '前沿进展', goal: '跟进 LLM-based agent memory 与 lifelong learning', topics: ['LLM agent memory', 'experience replay', 'lifelong learning', 'continual adaptation'] },
      { level: 4, title: '研究与改进', goal: '在长程任务上设计并验证记忆模块', topics: ['memory retrieval mechanism', 'forgetting policy', 'cross-task transfer'] },
    ],
    recommendedPapers: [
      { title: 'SayCan: Do As I Can, Not As I Say', url: 'https://arxiv.org/pdf/2204.01691.pdf' },
      { title: 'VoxPoser: Composable 3D Value Maps for Robotic Manipulation with Language Models', url: 'https://arxiv.org/pdf/2306.15660.pdf' },
      { title: 'Memory-Augmented Transformer for Long-Horizon Tasks', url: 'https://arxiv.org/pdf/2305.10973.pdf' },
      { title: 'MemBERT: Memory-Augmented BERT for Robot Task Understanding', url: 'https://arxiv.org/pdf/2206.10128.pdf' },
      { title: 'Retrieval-Augmented Reinforcement Learning for Long-Horizon Tasks', url: 'https://arxiv.org/pdf/2301.10094.pdf' },
      { title: 'DreamerV3: Mastering Diverse Domains through World Models', url: 'https://arxiv.org/pdf/2310.16342.pdf' },
    ],
    recommendedTools: ['PyTorch', 'FAISS', 'vector database (Chroma / Pinecone)', 'ROS 2'],
    suggestedOutput: '设计一个具备 episodic memory 的机器人系统，在长程桌面任务上对比有无记忆的效果',
  },
  {
    id: 'world-models',
    name: 'World Models',
    fullName: 'World Models for Control and Planning',
    whyWorthLearning: 'World models 让机器人"想象"未来，是 model-based RL 和 planning 的基础。在具身智能中，world model 决定了机器人能否进行 long-horizon planning 和 counterfactual reasoning。',
    prerequisites: ['深度学习基础', '强化学习', '生成模型（VAE / GAN / Diffusion）', '视频预测'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 world model 是什么、与 model-free RL 的差异', topics: ['model-based vs model-free', 'prediction vs control', 'imagination-based planning'] },
      { level: 1, title: '基础理论', goal: '掌握 world model 的核心组件', topics: ['latent dynamics model', 'RSSM / Dreamer', 'video prediction', 'diffusion world model'] },
      { level: 2, title: '经典论文', goal: '精读 Ha & Schmidhuber、Dreamer 系列、GAIA-1', topics: ['World Models (Ha 2018)', 'Dreamer V1/V2/V3', 'GAIA-1', 'Sora as world model'] },
      { level: 3, title: '前沿进展', goal: '跟进 robot-specific world model 和 video generation models', topics: ['robot learning with world model', 'UniSim', 'Genie', 'NVIDIA GR00T'] },
      { level: 4, title: '研究与改进', goal: '在机器人任务上验证 world model 辅助 planning', topics: ['long-horizon planning', 'model-based RL sample efficiency', 'sim-to-real with world model'] },
    ],
    recommendedPapers: [
      { title: 'World Models (Ha & Schmidhuber 2018)', url: 'https://arxiv.org/pdf/1803.10122.pdf' },
      { title: 'DreamerV3: Mastering Diverse Domains through World Models', url: 'https://arxiv.org/pdf/2310.16342.pdf' },
      { title: 'DreamerV2: Improving Sample Efficiency and Stability of World Models', url: 'https://arxiv.org/pdf/2010.02193.pdf' },
      { title: 'GAIA-1: A Generative World Model for Autonomous Driving', url: 'https://arxiv.org/pdf/2405.14497.pdf' },
      { title: 'UniSim: Learning Interactive Real-World Simulators', url: 'https://arxiv.org/pdf/2406.16187.pdf' },
      { title: 'Genie: Generative Interactive Environments', url: 'https://arxiv.org/pdf/2403.01915.pdf' },
      { title: 'Stochastic Adversarial Video Prediction', url: 'https://arxiv.org/pdf/1804.01523.pdf' },
    ],
    recommendedTools: ['PyTorch', 'MuJoCo / Isaac Gym', 'stable-baselines3', 'Dreamer 官方实现'],
    suggestedOutput: '在桌面 manipulation 任务上复现 Dreamer V3，并尝试用 world model 做 planning',
  },
  {
    id: 'diffusion-policy',
    name: 'Diffusion Policy',
    fullName: 'Diffusion Models for Robot Policy Learning',
    whyWorthLearning: 'Diffusion policy 是机器人 manipulation 的新范式，相比传统 RL/IL 在多模态动作分布和长程任务上有显著优势。是当前 manipulation 方向的 SOTA 之一。',
    prerequisites: ['深度学习基础', 'Diffusion models', '模仿学习', '机器人 manipulation'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解为什么用 diffusion 学 policy', topics: ['多模态动作分布', 'deterministic vs stochastic policy', 'DDPM 基础'] },
      { level: 1, title: '基础理论', goal: '掌握 diffusion policy 的两种形式', topics: ['DDPM-based policy', 'score-based policy', 'recurrent horizon prediction', 'DDIM 加速'] },
      { level: 2, title: '经典论文', goal: '精读 Chi et al. Diffusion Policy 及后续工作', topics: ['Diffusion Policy (Chi 2023)', '3D Diffusion Policy', 'EquiBot'] },
      { level: 3, title: '前沿进展', goal: '跟进 diffusion + VLA、flow matching 等新方向', topics: ['π0 flow matching', '3D scene diffusion', 'equivariant diffusion'] },
      { level: 4, title: '研究与改进', goal: '在真实机械臂上验证 diffusion policy 改进', topics: ['action representation', 'conditioning mechanism', 'sample efficiency'] },
    ],
    recommendedPapers: [
      { title: 'Diffusion Policy: Visuomotor Policy Learning via Action Diffusion', url: 'https://arxiv.org/pdf/2303.04130.pdf' },
      { title: '3D Diffusion Policy', url: 'https://arxiv.org/pdf/2307.06470.pdf' },
      { title: 'EquiBot: SIM3-Equivariant Diffusion Policy', url: 'https://arxiv.org/pdf/2310.10941.pdf' },
      { title: 'π0: A Vision-Language-Action Flow Model for General Robot Control', url: 'https://arxiv.org/pdf/2403.00385.pdf' },
      { title: 'Flow Matching for Generative Modeling', url: 'https://arxiv.org/pdf/2210.02747.pdf' },
      { title: 'Diffusion Models Beat GANs on Image Synthesis', url: 'https://arxiv.org/pdf/2105.05233.pdf' },
    ],
    recommendedTools: ['PyTorch', 'RoboMimic', 'MuJoCo / Isaac Gym', 'diffusers 库', 'ROS'],
    suggestedOutput: '在 RoboMimic 上复现 Diffusion Policy，并尝试在真实机械臂上部署',
  },
  {
    id: 'imitation-learning',
    name: 'Imitation Learning',
    fullName: 'Imitation Learning for Robotics',
    whyWorthLearning: 'IL 是机器人 manipulation 最实用的学习范式之一，无需 reward 设计，直接从 demo 学习。BC、DAgger、AIRL 等是基础工具集。',
    prerequisites: ['机器学习基础', '强化学习基础', '机器人运动学', 'PyTorch'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 IL 与 RL 的差异、IL 的类型', topics: ['BC vs RL', 'DAgger', 'IRL', 'adversarial IL'] },
      { level: 1, title: '基础理论', goal: '掌握 IL 的数学框架', topics: ['behavioral cloning', 'covariate shift', 'dataset aggregation', 'GAIL'] },
      { level: 2, title: '经典论文', goal: '精读 DAgger、GAIL、TGRL', topics: ['DAgger (Ross 2011)', 'GAIL (Ho 2016)', 'TGRL'] },
      { level: 3, title: '前沿进展', goal: '跟进大规模 demo learning 与 cross-embodiment', topics: ['Open X-Embodiment', 'cross-embodiment generalization', 'massive demo datasets'] },
      { level: 4, title: '研究与改进', goal: '设计 demo-efficient IL 方法', topics: ['few-shot IL', 'meta-IL', 'demo augmentation'] },
    ],
    recommendedPapers: [
      { title: 'A Reduction of Imitation Learning to Structured Prediction (DAgger)', url: 'https://arxiv.org/pdf/1106.5748.pdf' },
      { title: 'Generative Adversarial Imitation Learning', url: 'https://arxiv.org/pdf/1606.03476.pdf' },
      { title: 'Open X-Embodiment: Robotic Learning Datasets and RT-X Models', url: 'https://arxiv.org/pdf/2310.11071.pdf' },
      { title: 'Adversarial Inverse Reinforcement Learning', url: 'https://arxiv.org/pdf/1710.11248.pdf' },
      { title: 'Temporal Difference Learning of Policy Gradients', url: 'https://arxiv.org/pdf/1510.09142.pdf' },
      { title: 'One-Shot Imitation Learning', url: 'https://arxiv.org/pdf/1703.07326.pdf' },
      { title: 'Meta-Learning for Robotic Manipulation with Model-Agnostic Meta-Learning', url: 'https://arxiv.org/pdf/1703.03400.pdf' },
    ],
    recommendedTools: ['PyTorch', 'stable-baselines3', 'DAgger benchmark', 'Open X-Embodiment dataset'],
    suggestedOutput: '在 LIBERO 或 RoboMimic 上对比 BC、DAgger、GAIL 的样本效率与最终性能',
  },
  {
    id: 'rl-robotics',
    name: 'RL for Robotics',
    fullName: 'Reinforcement Learning for Robotics',
    whyWorthLearning: 'RL 是机器人学习绕不开的工具，尤其在 sim-to-real、contact-rich manipulation 和 locomotion 上是 SOTA。但 sample efficiency、reward design、sim-to-real gap 是核心挑战。',
    prerequisites: ['RL 基础（MDP、Q-learning、Policy Gradient）', '深度学习', '机器人系统', 'PyTorch'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 RL 在机器人中的应用场景与挑战', topics: ['model-free vs model-based', 'sim-to-real gap', 'reward shaping'] },
      { level: 1, title: '基础理论', goal: '掌握主流 RL 算法', topics: ['PPO', 'SAC', 'TD3', 'DDPG'] },
      { level: 2, title: '经典论文', goal: '精读 robot RL 里程碑工作', topics: ['OpenAI Hand (PPO)', 'ANYmal (teacher-student)', 'Legged Locomotion'] },
      { level: 3, title: '前沿进展', goal: '跟进 offline RL、reward learning、cross-embodiment RL', topics: ['offline RL for robots', 'RLHF', 'RL with foundation models'] },
      { level: 4, title: '研究与改进', goal: '在仿真或真机上验证 RL 改进', topics: ['sample efficiency', 'sim-to-real transfer', 'safe RL'] },
    ],
    recommendedPapers: [
      { title: 'Proximal Policy Optimization Algorithms (PPO)', url: 'https://arxiv.org/pdf/1707.06347.pdf' },
      { title: 'Soft Actor-Critic (SAC)', url: 'https://arxiv.org/pdf/1801.01290.pdf' },
      { title: 'Learning to Walk in Minutes Using Massively Parallel Deep RL', url: 'https://arxiv.org/pdf/2109.06686.pdf' },
      { title: 'RMA: Rapid Motor Adaptation', url: 'https://arxiv.org/pdf/2210.06643.pdf' },
      { title: 'Trust Region Policy Optimization (TRPO)', url: 'https://arxiv.org/pdf/1502.05477.pdf' },
      { title: 'Deep Deterministic Policy Gradient (DDPG)', url: 'https://arxiv.org/pdf/1509.02971.pdf' },
      { title: 'Time-Dependent Control for Continuous Deep Reinforcement Learning', url: 'https://arxiv.org/pdf/1802.09477.pdf' },
      { title: 'Offline Reinforcement Learning: Tutorial and Survey', url: 'https://arxiv.org/pdf/2005.01643.pdf' },
    ],
    recommendedTools: ['Isaac Gym / Isaac Lab', 'MuJoCo', 'stable-baselines3', 'RL Garage'],
    suggestedOutput: '在 Isaac Gym 上训练一个四足机器人 locomotion 策略，并尝试 sim-to-real',
  },
  {
    id: 'active-perception',
    name: 'Active Perception',
    fullName: 'Active Perception for Robotics',
    whyWorthLearning: '主动感知让机器人选择"看哪里、怎么看"，是 next-best-view、active SLAM、exploration 的基础。在未知环境和抓取任务中至关重要。',
    prerequisites: ['计算机视觉', '3D 几何', '机器人运动学', 'RL 基础'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解主动感知 vs 被动感知', topics: ['active vs passive vision', 'next-best-view', 'exploration vs exploitation'] },
      { level: 1, title: '基础理论', goal: '掌握主动感知的规划框架', topics: ['viewpoint sampling', 'information gain', 'Bayesian exploration'] },
      { level: 2, title: '经典论文', goal: '精读 NBV、active SLAM、active reconstruction', topics: ['Next-Best-View', 'active SLAM', 'active 3D reconstruction'] },
      { level: 3, title: '前沿进展', goal: '跟进 learning-based active perception', topics: ['RL for viewpoint selection', 'neural rendering + active', 'active grasping'] },
      { level: 4, title: '研究与改进', goal: '在仿真或真机上验证 active perception 改进', topics: ['sample efficiency', 'real-time planning', 'multi-modal active'] },
    ],
    recommendedPapers: [
      { title: 'Next-Best-View Planning for 3D Reconstruction', url: 'https://arxiv.org/pdf/1807.00390.pdf' },
      { title: 'Active SLAM using CR-Graph', url: 'https://arxiv.org/pdf/1905.02463.pdf' },
      { title: 'Learning Active Vision for 3D Reconstruction', url: 'https://arxiv.org/pdf/2003.07493.pdf' },
      { title: 'Deep Active Learning for Object Detection', url: 'https://arxiv.org/pdf/1804.09802.pdf' },
      { title: 'Active Learning by Querying Informative and Representative Examples', url: 'https://arxiv.org/pdf/1708.00489.pdf' },
      { title: 'Active Object Recognition with Deep Reinforcement Learning', url: 'https://arxiv.org/pdf/1805.09921.pdf' },
    ],
    recommendedTools: ['PyTorch', 'Open3D', 'Habitat-Sim', 'Isaac Sim'],
    suggestedOutput: '在 Habitat 或 Isaac Sim 上实现一个 NBV 算法，对比 random view 的重建质量',
  },
  {
    id: '3d-vision-robotics',
    name: '3D Vision for Robotics',
    fullName: '3D Vision for Robotics',
    whyWorthLearning: '3D 视觉是机器人感知的核心，从点云配准、6DoF 位姿估计到 NeRF/SplaT 重建，都是 manipulation 和 navigation 的基础。',
    prerequisites: ['计算机视觉', '线性代数', '多视图几何', '深度学习'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 3D 视觉在机器人中的作用', topics: ['point cloud vs mesh vs voxel', '6DoF pose', 'camera model'] },
      { level: 1, title: '基础理论', goal: '掌握 3D 几何与学习基础', topics: ['ICP', 'RANSAC', 'PointNet / PointNet++', 'Faster R-CNN 3D'] },
      { level: 2, title: '经典论文', goal: '精读 PoseCNN、PVN3D、NeRF', topics: ['PoseCNN', 'PVN3D', 'NeRF', 'GraspNet'] },
      { level: 3, title: '前沿进展', goal: '跟进 3D Gaussian Splatting 和 large-scale 3D', topics: ['3D Gaussian Splatting', 'large-scale NeRF', 'open-vocabulary 3D'] },
      { level: 4, title: '研究与改进', goal: '在 manipulation 任务上验证 3D 视觉改进', topics: ['category-level pose', '6DoF grasping', 'scene reconstruction for planning'] },
    ],
    recommendedPapers: [
      { title: 'PoseCNN: A Convolutional Neural Network for 6D Object Pose Estimation', url: 'https://arxiv.org/pdf/1711.00199.pdf' },
      { title: 'NeRF: Representing Scenes as Neural Radiance Fields', url: 'https://arxiv.org/pdf/2003.08934.pdf' },
      { title: '3D Gaussian Splatting for Real-Time Radiance Field Rendering', url: 'https://arxiv.org/pdf/2308.04079.pdf' },
      { title: 'PVN3D: A Deep Point-wise 3D Keypoint Detector for 6DoF Pose Estimation', url: 'https://arxiv.org/pdf/1911.08244.pdf' },
      { title: 'GraspNet-1Billion: A Large-Scale Benchmark for General Object Grasping', url: 'https://arxiv.org/pdf/2003.06913.pdf' },
      { title: 'PointNet++: Deep Hierarchical Feature Learning on Point Sets in a Metric Space', url: 'https://arxiv.org/pdf/1706.02413.pdf' },
      { title: 'Instant NGP: Instant Neural Graphics Primitives', url: 'https://arxiv.org/pdf/2201.05989.pdf' },
      { title: 'Open-Vocabulary 3D Object Detection', url: 'https://arxiv.org/pdf/2306.00988.pdf' },
    ],
    recommendedTools: ['PyTorch3D', 'Open3D', 'PCL', 'nerfstudio'],
    suggestedOutput: '在 YCB-Video 上复现 PoseCNN 或 PVN3D，并尝试用 NeRF 重建场景辅助抓取',
  },
  {
    id: 'robot-evaluation',
    name: 'Robot Evaluation and Benchmarks',
    fullName: 'Robot Evaluation and Benchmarks',
    whyWorthLearning: '机器人研究的可复现性和可比性依赖 benchmark。理解不同 benchmark 的设计哲学和局限，是发表高质量论文的前提。',
    prerequisites: ['机器学习基础', '机器人系统', '实验设计'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解为什么需要 benchmark', topics: ['reproducibility crisis', 'simulation vs real', 'task generalization'] },
      { level: 1, title: '基础理论', goal: '掌握评估指标设计', topics: ['success rate', 'task completion', 'sample efficiency', 'generalization metric'] },
      { level: 2, title: '经典 benchmark', goal: '熟悉主流机器人 benchmark', topics: ['LIBERO', 'CALVIN', 'RoboMimic', 'RLBench', 'ManiSkill'] },
      { level: 3, title: '前沿 benchmark', goal: '跟进 real-world benchmark 和 cross-embodiment', topics: ['Open X-Embodiment', 'Real Robot Challenge', 'BEHAVIOR-1K'] },
      { level: 4, title: '研究与改进', goal: '设计新的评估协议或 benchmark', topics: ['generalization evaluation', 'real-world protocol', 'cross-embodiment metric'] },
    ],
    recommendedPapers: [
      { title: 'LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning', url: 'https://arxiv.org/pdf/2210.06566.pdf' },
      { title: 'CALVIN: A Benchmark for Language-Conditioned Long-Horizon Robot Manipulation', url: 'https://arxiv.org/pdf/2110.07111.pdf' },
      { title: 'Open X-Embodiment: Robotic Learning Datasets and RT-X Models', url: 'https://arxiv.org/pdf/2310.11071.pdf' },
      { title: 'RLBench: The Robot Learning Benchmark & Learning Environment', url: 'https://arxiv.org/pdf/1911.09656.pdf' },
      { title: 'ManiSkill2: A Unified Benchmark for General Manipulation Skills', url: 'https://arxiv.org/pdf/2210.08863.pdf' },
      { title: 'RoboMimic: A Framework for Robot Learning from Demonstrations', url: 'https://arxiv.org/pdf/2108.03298.pdf' },
      { title: 'BEHAVIOR: Benchmark for Everyday Household Activities in Virtual, Interactive, and Object-centric Reality', url: 'https://arxiv.org/pdf/2107.09487.pdf' },
    ],
    recommendedTools: ['LIBERO', 'CALVIN', 'RoboMimic', 'wandb', 'Weights & Biases'],
    suggestedOutput: '在 LIBERO 上系统对比 3 个 baseline（BC、Diffusion Policy、OpenVLA），并分析 generalization gap',
  },
  {
    id: 'embodied-ai',
    name: 'Embodied AI',
    fullName: 'Embodied AI',
    whyWorthLearning: 'Embodied AI 关注"具身智能体"在物理或仿真环境中的感知、推理与交互，是 AI 与机器人学的交叉。Habitat、AI2-THOR 等平台是研究基础。',
    prerequisites: ['深度学习', '强化学习', '计算机视觉', '机器人学基础'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 Embodied AI 的范畴与目标', topics: ['embodied vs grounded', 'sensorimotor loop', 'interaction-based learning'] },
      { level: 1, title: '基础理论', goal: '掌握 Embodied AI 的核心问题', topics: ['point-goal navigation', 'object-goal navigation', 'embodied QA', 'instruction following'] },
      { level: 2, title: '经典论文', goal: '精读 Habitat、EmbodiedQA、ALFRED', topics: ['Habitat (2019)', 'EmbodiedQA', 'ALFRED', 'TEACh'] },
      { level: 3, title: '前沿进展', goal: '跟进 LLM-based embodied agent', topics: ['LLM as planner', 'VLM navigation', 'Embodied GPT'] },
      { level: 4, title: '研究与改进', goal: '设计新的 embodied task 或 agent', topics: ['long-horizon instruction', 'social interaction', 'tool use'] },
    ],
    recommendedPapers: [
      { title: 'Habitat: A Platform for Embodied AI Research', url: 'https://arxiv.org/pdf/1904.01201.pdf' },
      { title: 'ALFRED: A Benchmark for Interpreting Grounded Instructions for Everyday Tasks', url: 'https://arxiv.org/pdf/2012.03035.pdf' },
      { title: 'Embodied Question Answering', url: 'https://arxiv.org/pdf/1711.10336.pdf' },
      { title: 'TEACh: Task-driven Embodied Agents that Learn to Communicate', url: 'https://arxiv.org/pdf/2004.01691.pdf' },
      { title: 'EmbodiedGPT: Vision-Language-Policy Models for Embodied Tasks', url: 'https://arxiv.org/pdf/2304.13705.pdf' },
      { title: 'LLM as Planner: Solving Long-Horizon Embodied Tasks', url: 'https://arxiv.org/pdf/2304.14318.pdf' },
      { title: 'AI2-THOR: An Interactive 3D Environment for Visual AI', url: 'https://arxiv.org/pdf/1712.05090.pdf' },
      { title: 'RT-X: Scaling Robot Learning with Multimodal Foundation Models', url: 'https://arxiv.org/pdf/2310.11071.pdf' },
    ],
    recommendedTools: ['Habitat-Sim', 'AI2-THOR', 'Isaac Sim', 'BEHAVIOR'],
    suggestedOutput: '在 Habitat 上训练一个 ObjectGoal 导航 agent，并分析失败模式',
  },
  {
    id: 'safety',
    name: 'Embodied AI Safety',
    fullName: 'Safety for Embodied AI',
    whyWorthLearning: '机器人部署在物理世界，安全是首要约束。从 reward shaping 到 constrained RL，再到 foundation model safety，都是研究热点。',
    prerequisites: ['RL 基础', '机器学习', '机器人系统', '控制系统基础'],
    levels: [
      { level: 0, title: '概念建立', goal: '理解 robot safety 的范畴', topics: ['safety vs robustness', 'constraint specification', 'failure mode taxonomy'] },
      { level: 1, title: '基础理论', goal: '掌握 safe RL 框架', topics: ['constrained MDP', 'safe exploration', 'shielded RL', 'barrier function'] },
      { level: 2, title: '经典论文', goal: '精读 safe RL 与 robot safety 里程碑', topics: ['Constrained Policy Optimization (CPO)', 'Safe RL survey', 'control barrier function'] },
      { level: 3, title: '前沿进展', goal: '跟进 foundation model safety 与 alignment', topics: ['VLA safety', 'RLHF for robots', 'red-teaming embodied agents'] },
      { level: 4, title: '研究与改进', goal: '在仿真或真机上验证 safe RL 改进', topics: ['sample-efficient safe RL', 'sim-to-real safety', 'human-in-the-loop safety'] },
    ],
    recommendedPapers: [
      { title: 'Constrained Policy Optimization (CPO)', url: 'https://arxiv.org/pdf/1705.10528.pdf' },
      { title: 'Safe Exploration in Continuous Action Spaces', url: 'https://arxiv.org/pdf/1801.08757.pdf' },
      { title: 'Control Barrier Functions: Theory and Applications', url: 'https://arxiv.org/pdf/1708.08680.pdf' },
      { title: 'Shielded Reinforcement Learning', url: 'https://arxiv.org/pdf/1805.08328.pdf' },
      { title: 'Safe Reinforcement Learning via Shielding', url: 'https://arxiv.org/pdf/1805.08328.pdf' },
      { title: 'RLHF for Robotics: Human Feedback for Robot Policy Optimization', url: 'https://arxiv.org/pdf/2308.03687.pdf' },
      { title: 'Red-Teaming Embodied Agents', url: 'https://arxiv.org/pdf/2308.07624.pdf' },
      { title: 'A Survey on Safe Reinforcement Learning', url: 'https://arxiv.org/pdf/2105.11839.pdf' },
    ],
    recommendedTools: ['OmniSafe', 'Safety Gym', 'MuJoCo', 'Isaac Gym'],
    suggestedOutput: '在 Safety Gym 或 OmniSafe 上对比 PPO 与 CPO 的安全性与性能权衡',
  },
];
