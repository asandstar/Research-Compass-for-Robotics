export interface VariableControlQuestion {
  id: string;
  field: string;
  scenario: string;
  experiment: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
}

export const variableControlQuestions: VariableControlQuestion[] = [
  {
    id: 'vc-1',
    field: '机器人视觉',
    scenario: '研究者想要验证「数据增强能提升视觉目标检测的准确率」。',
    experiment: '实验 A：使用原始数据集训练模型；实验 B：使用随机裁剪+颜色抖动增强后的数据集训练模型。两组使用相同的模型架构（YOLOv8）、相同的训练轮数（100 epoch）、相同的学习率（0.001），在相同测试集上评估 mAP。',
    options: [
      { id: 'a', text: '这是一个有效实验，能得出可靠结论', isCorrect: true, explanation: '正确。两组仅有一个变量不同（数据增强），其他条件完全一致，符合控制变量原则。' },
      { id: 'b', text: '实验无效，因为测试集应该不同', isCorrect: false, explanation: '错误。测试集必须相同才能公平比较，使用不同测试集会引入额外变量。' },
      { id: 'c', text: '实验无效，因为学习率应该不同', isCorrect: false, explanation: '错误。学习率是应保持一致的变量，改变它会混淆数据增强的效果。' },
    ],
    hint: '控制变量法要求只改变一个自变量，其他条件保持相同。',
  },
  {
    id: 'vc-2',
    field: '强化学习',
    scenario: '研究者想要验证「奖励塑形（Reward Shaping）能加速机器人抓取任务的训练」。',
    experiment: '实验 A：使用稀疏奖励（仅成功抓取时+1）；实验 B：使用稠密奖励（接近目标+0.1、正确朝向+0.1、成功抓取+1）。实验 A 使用 PPO 算法，实验 B 使用 SAC 算法，均在 PyBullet 仿真环境中训练。',
    options: [
      { id: 'a', text: '这是一个有效实验，因为两种算法都是主流 RL 算法', isCorrect: false, explanation: '错误。算法不同引入了第二个变量，无法确定性能差异来自奖励塑形还是算法本身。' },
      { id: 'b', text: '实验无效，因为算法不同会混淆实验结果', isCorrect: true, explanation: '正确。实验 A 和 B 有两个变量不同（奖励类型和算法），违反了控制变量原则。' },
      { id: 'c', text: '实验有效，因为仿真环境相同', isCorrect: false, explanation: '错误。环境相同是必要的，但不足以弥补算法不同带来的混淆。' },
    ],
    hint: '即使环境相同，如果使用不同算法，就无法判断是哪个变量导致了差异。',
  },
  {
    id: 'vc-3',
    field: 'SLAM',
    scenario: '研究者声称「他们的新特征提取算法比 ORB 特征在动态环境下更鲁棒」。',
    experiment: '实验 A：使用 ORB-SLAM3 在 TUM RGB-D 的 walking_xyz 序列上测试；实验 B：使用作者的新算法在 TUM RGB-D 的 sitting_xyz 序列上测试。两个序列都来自同一数据集。',
    options: [
      { id: 'a', text: '实验有效，因为数据集相同', isCorrect: false, explanation: '错误。walking_xyz 包含大量动态物体，而 sitting_xyz 基本是静态的，场景动态性不同。' },
      { id: 'b', text: '实验无效，因为序列不同引入了场景动态性差异', isCorrect: true, explanation: '正确。walking_xyz（行走的人）和 sitting_xyz（坐着的人）动态程度完全不同，无法公平比较动态环境下的鲁棒性。' },
      { id: 'c', text: '实验有效，因为相机运动类似', isCorrect: false, explanation: '错误。相机运动类似不能弥补场景动态性的巨大差异。' },
    ],
    hint: '测试动态环境鲁棒性时，两组实验的动态程度必须相当。',
  },
  {
    id: 'vc-4',
    field: '机器人控制',
    scenario: '研究者想要验证「阻抗控制比位置控制在打磨任务中表现更好」。',
    experiment: '实验 A：使用位置控制，PID 参数为 Kp=100, Ki=0, Kd=10；实验 B：使用阻抗控制，刚度 K=500 N/m，阻尼 D=50 N·s/m。两组使用相同的机械臂（UR5）、相同的末端执行器、相同的打磨轨迹。',
    options: [
      { id: 'a', text: '实验有效，因为机械臂和轨迹都相同', isCorrect: true, explanation: '正确。仅控制方法不同，其他条件一致，符合控制变量原则。注意 PID 和阻抗参数属于各自控制器的必要配置，不是额外变量。' },
      { id: 'b', text: '实验无效，因为控制器参数不同', isCorrect: false, explanation: '错误。不同控制器需要各自的参数才能正常工作，这是控制方法差异的一部分，不是额外变量。' },
      { id: 'c', text: '实验无效，因为没有测试多个参数组合', isCorrect: false, explanation: '错误。参数调优后的对比是合理的，不需要穷举所有参数组合。' },
    ],
    hint: '不同控制器的参数属于该方法本身，不是额外变量。',
  },
  {
    id: 'vc-5',
    field: '视觉语言模型',
    scenario: '研究者声称「在视觉导航任务中，使用 CLIP 特征比 ResNet 特征效果更好」。',
    experiment: '实验 A：使用 ResNet-50 预训练特征 + LSTM 策略网络；实验 B：使用 CLIP ViT-B/16 特征 + Transformer 策略网络。两组在 AI2-THOR 的 30 个房间中测试成功率。',
    options: [
      { id: 'a', text: '实验有效，因为测试房间相同', isCorrect: false, explanation: '错误。特征提取器和策略网络都不同，有两个变量，无法判断是哪个因素导致差异。' },
      { id: 'b', text: '实验无效，因为策略网络架构不同', isCorrect: true, explanation: '正确。ResNet+LSTM 与 CLIP+Transformer 有两个差异点，不能归因于特征提取器 alone。' },
      { id: 'c', text: '实验有效，因为都是标准架构', isCorrect: false, explanation: '错误。标准架构不能弥补变量控制不足的问题。' },
    ],
    hint: '当特征提取器和策略网络同时改变时，无法分离各自的贡献。',
  },
  {
    id: 'vc-6',
    field: '多传感器融合',
    scenario: '研究者想要验证「在夜间场景下，RGB+LiDAR 融合比纯 RGB 检测更稳定」。',
    experiment: '实验 A：仅使用 RGB 图像，在 KITTI 夜间子集测试；实验 B：使用 RGB+LiDAR 融合，在 KITTI 白天子集测试。使用相同的检测器（PointPainting）。',
    options: [
      { id: 'a', text: '实验有效，因为使用相同检测器', isCorrect: false, explanation: '错误。白天和夜间光照条件完全不同，这是更大的混淆变量。' },
      { id: 'b', text: '实验无效，因为光照条件不同', isCorrect: true, explanation: '正确。实验 A 在夜间测试，实验 B 在白天测试，光照条件的差异远大于传感器配置的差异，无法得出可靠结论。' },
      { id: 'c', text: '实验有效，因为数据集相同', isCorrect: false, explanation: '错误。同一数据集的不同子集在不同条件下采集，不能算作控制变量。' },
    ],
    hint: '测试夜间性能时，两组都必须在夜间场景下进行。',
  },
];

export function getRandomQuestions(count: number = 5): VariableControlQuestion[] {
  const shuffled = [...variableControlQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
