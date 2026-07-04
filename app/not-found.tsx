import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <div className="text-lg font-semibold text-gray-800 mb-2">页面不存在</div>
        <p className="text-sm text-gray-500 mb-4">您访问的页面可能已被删除或地址有误。</p>
        <Link href="/" className="text-indigo-600 hover:underline">返回首页</Link>
      </div>
    </div>
  );
}
