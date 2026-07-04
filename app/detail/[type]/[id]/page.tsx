import DetailPageClient from './DetailPageClient';

export const dynamicParams = true;

export function generateStaticParams() {
  // 返回占位符确保路由被构建，dynamicParams=true 允许客户端导航到任意路径
  return [
    { type: 'idea', id: 'placeholder' },
    { type: 'mve', id: 'placeholder' },
  ];
}

export default function Page({ params }: { params: { type: string; id: string } }) {
  return <DetailPageClient type={params.type} id={params.id} />;
}
