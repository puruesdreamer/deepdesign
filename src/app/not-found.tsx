import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <h1 className="font-playfair text-9xl text-neutral-200 font-bold">404</h1>
      <div className="space-y-6 text-center -mt-12 relative z-10">
        <h2 className="text-3xl font-light text-neutral-800">页面未找到</h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors duration-300"
        >
          <ArrowLeft size={18} />
          返回首页
        </Link>
      </div>
    </div>
  );
}
