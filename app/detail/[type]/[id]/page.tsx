import DetailPageClient from './DetailPageClient';

export const dynamicParams = true;

export function generateStaticParams() {
  const ideaIds = [
    'idea-vla-speedup',
    'idea-diffusion-fast',
    'idea-vio-dynamic',
  ];
  const mveIds = [
    'mve-vio-dynamic-001',
  ];

  const params: { type: string; id: string }[] = [];
  ideaIds.forEach(id => params.push({ type: 'idea', id }));
  mveIds.forEach(id => params.push({ type: 'mve', id }));

  return params;
}

export default function Page({ params }: { params: { type: string; id: string } }) {
  return <DetailPageClient type={params.type} id={params.id} />;
}
