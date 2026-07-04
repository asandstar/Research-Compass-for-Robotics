'use client';

import IdeaWorkspaceClient from '../../../idea/[id]/IdeaWorkspaceClient';
import MVEResultClient from '../../../mve/[id]/MVEResultClient';

interface DetailPageClientProps {
  type: string;
  id: string;
}

export default function DetailPageClient({ type, id }: DetailPageClientProps) {
  if (type === 'idea') {
    return <IdeaWorkspaceClient id={id} />;
  }
  if (type === 'mve') {
    return <MVEResultClient id={id} />;
  }
  return (
    <div className="text-center py-20">
      <p className="text-gray-500">未知的详情页类型</p>
    </div>
  );
}
