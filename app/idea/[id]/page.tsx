import IdeaWorkspaceClient from './IdeaWorkspaceClient';
import { mockIdeaCards } from '../../../lib/mockData';

export function generateStaticParams() {
  return mockIdeaCards.map(idea => ({ id: idea.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <IdeaWorkspaceClient id={params.id} />;
}
