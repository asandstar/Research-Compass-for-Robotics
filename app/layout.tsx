import type { Metadata } from 'next';
import { ClientProviders } from './ClientProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research Compass for Robotics - 机器人科研方向管理工作台',
  description: '从子领域探索到论文阅读，从灵感捕捉到最小可行实验验证——帮你系统判断机器人科研方向值不值得走。',
  openGraph: {
    title: 'Research Compass for Robotics',
    description: '机器人科研方向管理工作台',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-bg min-h-screen">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
