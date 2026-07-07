import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <div className="text-lg font-semibold text-ink mb-2">页面不存在</div>
        <p className="text-sm text-muted mb-4">您访问的页面可能已被删除或地址有误。</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="text-accent hover:underline">返回概览</Link>
          <Link href="/ideas" className="text-accent hover:underline">选择方向</Link>
        </div>
      </div>
    </div>
  );
}
