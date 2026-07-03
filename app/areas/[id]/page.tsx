import AreaDetailClient from './AreaDetailClient';
import { mockResearchAreas } from '../../../lib/mockData';

export function generateStaticParams() {
  return mockResearchAreas.map(area => ({ id: area.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <AreaDetailClient />;
}
