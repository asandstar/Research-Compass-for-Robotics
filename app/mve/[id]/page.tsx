import MVEResultClient from './MVEResultClient';
import { mockMVEs } from '../../../lib/mockData';

export function generateStaticParams() {
  return mockMVEs.map(mve => ({ id: mve.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <MVEResultClient id={params.id} />;
}
