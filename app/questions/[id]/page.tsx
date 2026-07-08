import { notFound } from 'next/navigation';
import { researchQuestions } from '@/lib/questions/researchQuestions';
import QuestionDetailClient from './QuestionDetailClient';

export function generateStaticParams() {
  return researchQuestions.map((q) => ({ id: q.id }));
}

interface PageProps {
  params: { id: string };
}

export default function QuestionDetailPage({ params }: PageProps) {
  const { id } = params;
  const question = researchQuestions.find((q) => q.id === id);

  if (!question) {
    notFound();
  }

  return <QuestionDetailClient question={question} />;
}
