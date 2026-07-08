export interface HypothesisQuestion {
  id: string;
  hypothesis: string;
  scenario: string;
  field: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
}

export const hypothesisQuestions: HypothesisQuestion[] = [
  {
    id: 'q1',
    field: '机器人视觉',
    hypothesis: '使用自监督预训练可以显著提升机器人在未知环境中的视觉识别准确率。',
    scenario: '你有一个在 ImageNet 上预训练的视觉模型，想要在机器人抓取任务中应用。',
    options: [
      {
        id: 'q1-a',
        text: '直接在机器人数据上微调预训练模型，并与从头训练的模型对比性能',
        isCorrect: true,
        explanation: '正确！这是控制变量法——保持其他条件一致，只改变预训练这一变量，才能验证预训练的效果。',
      },
      {
        id: 'q1-b',
        text: '只在 ImageNet 上测试模型性能',
        isCorrect: false,
        explanation: '错误！ImageNet 上的性能不能说明在机器人任务上的效果，领域差异太大。',
      },
      {
        id: 'q1-c',
        text: '在机器人数据上训练但不使用预训练权重',
        isCorrect: false,
        explanation: '错误！这是对照组，但你还需要实验组（使用预训练）来做对比，否则无法验证假设。',
      },
    ],
    hint: '思考：要验证"预训练有帮助"，需要什么对照实验？',
  },
  {
    id: 'q2',
    field: '强化学习',
    hypothesis: '增加奖励稀疏性会延长强化学习智能体的收敛时间。',
    scenario: '你在训练一个机器人导航任务，想测试奖励频率对学习速度的影响。',
    options: [
      {
        id: 'q2-a',
        text: '比较密集奖励（每步都给）和稀疏奖励（仅到达目标给）的收敛曲线',
        isCorrect: true,
        explanation: '正确！通过对比实验，控制奖励频率这一变量，可以验证假设。',
      },
      {
        id: 'q2-b',
        text: '只使用稀疏奖励训练，观察收敛时间',
        isCorrect: false,
        explanation: '错误！没有对照组，无法判断"延长"了多少。需要与密集奖励对比。',
      },
      {
        id: 'q2-c',
        text: '同时使用密集和稀疏奖励训练同一个模型',
        isCorrect: false,
        explanation: '错误！混合使用无法分离出各自的效果，变量控制不严格。',
      },
    ],
    hint: '思考：如何设计实验才能明确奖励频率与收敛时间的因果关系？',
  },
  {
    id: 'q3',
    field: 'SLAM',
    hypothesis: '在动态环境中，语义信息可以帮助 SLAM 系统过滤掉移动物体，提高定位精度。',
    scenario: '你的 SLAM 系统在室内环境（有人走动）中容易丢失定位，想引入语义分割来改善。',
    options: [
      {
        id: 'q3-a',
        text: '对比使用语义掩码过滤动态物体 vs 不使用语义信息的基线系统',
        isCorrect: true,
        explanation: '正确！需要对照实验：一个使用语义过滤动态物体，另一个不使用，其他条件保持一致。',
      },
      {
        id: 'q3-b',
        text: '只在静态环境中测试使用语义信息的系统',
        isCorrect: false,
        explanation: '错误！静态环境没有动态物体，无法验证语义信息在动态环境中的价值。',
      },
      {
        id: 'q3-c',
        text: '比较不同语义分割模型的准确率',
        isCorrect: false,
        explanation: '错误！你在验证的是"语义信息对 SLAM 的帮助"，而不是"哪个分割模型更好"。',
      },
    ],
    hint: '思考：实验环境应该是什么样的？需要哪些对照组？',
  },
  {
    id: 'q4',
    field: '模仿学习',
    hypothesis: '增加专家演示数据量可以持续提高模仿学习策略的性能，不会出现平台期。',
    scenario: '你在训练一个机器人操作任务，收集了 100、500、1000、5000 条专家演示。',
    options: [
      {
        id: 'q4-a',
        text: '绘制不同数据量下的性能曲线，观察是否持续上升或出现平台期',
        isCorrect: true,
        explanation: '正确！这是验证"持续提高"这一趋势的唯一方法——通过数据变化趋势来判断。',
      },
      {
        id: 'q4-b',
        text: '只用 5000 条数据训练，看最终性能是否很好',
        isCorrect: false,
        explanation: '错误！即使性能很好，也无法证明"持续提高"——可能在 1000 条时就饱和了。',
      },
      {
        id: 'q4-c',
        text: '比较 100 条和 5000 条数据的性能差异',
        isCorrect: false,
        explanation: '错误！两点对比只能证明"有提升"，无法验证"持续"提高——中间可能经历过平台期。',
      },
    ],
    hint: '思考："持续提高"和"有提升"在实验设计上有什么区别？',
  },
  {
    id: 'q5',
    field: '路径规划',
    hypothesis: '在拥挤环境中，考虑行人意图预测的路径规划比仅考虑当前位置的规划更安全。',
    scenario: '你的服务机器人需要在商场中导航，周围有很多行人。',
    options: [
      {
        id: 'q5-a',
        text: '在仿真环境中对比两种规划器的碰撞率和路径效率',
        isCorrect: true,
        explanation: '正确！仿真环境可以控制行人行为模式，安全地对比两种方法。需要多个指标综合评估。',
      },
      {
        id: 'q5-b',
        text: '直接在真实商场中测试',
        isCorrect: false,
        explanation: '错误！真实环境太危险，且难以控制变量。应该先仿真验证，再考虑真实部署。',
      },
      {
        id: 'q5-c',
        text: '仅统计机器人与行人的最近距离',
        isCorrect: false,
        explanation: '错误！单一指标不够——可能距离很大但路径非常绕，或者距离小但没有碰撞。需要多个指标。',
      },
    ],
    hint: '思考：验证安全性应该在什么环境中进行？需要哪些评估指标？',
  },
  {
    id: 'q6',
    field: '多模态融合',
    hypothesis: '在视觉受限环境（如烟雾、强光）中，融合触觉信息可以维持机器人的操作精度。',
    scenario: '你的抓取机器人在仓库工作，有时会遇到视线不佳的情况。',
    options: [
      {
        id: 'q6-a',
        text: '在视觉退化条件下对比视觉-only、触觉-only、融合三种方案',
        isCorrect: true,
        explanation: '正确！三种方案的对比可以说明：1) 视觉受限时性能下降；2) 触觉可以弥补；3) 融合效果最好。',
      },
      {
        id: 'q6-b',
        text: '只在正常视觉条件下测试融合方案',
        isCorrect: false,
        explanation: '错误！假设说的是"视觉受限"的情况，正常条件下无法验证这个假设。',
      },
      {
        id: 'q6-c',
        text: '对比视觉-only 和融合方案在正常条件下的性能',
        isCorrect: false,
        explanation: '错误！缺少"视觉受限"这一关键条件，也缺少触觉-only 的对照组。',
      },
    ],
    hint: '思考：需要哪些对照组？在什么条件下测试？',
  },
];

export function getRandomQuestions(count: number = 5): HypothesisQuestion[] {
  const shuffled = [...hypothesisQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
