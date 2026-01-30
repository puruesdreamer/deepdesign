'use client';

import { useState, useRef } from "react";
import Image from "next/image";

export function Contact() {
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    website_url: '' // Honeypot field
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneValid = /^1[3-9]\d{9}$/.test(formData.phone.trim());
    if (!phoneValid) {
      if (phoneInputRef.current) {
        phoneInputRef.current.setCustomValidity('请输入正确的电话号码');
        phoneInputRef.current.reportValidity();
      }
      return;
    }
    setStatus('submitting');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', message: '', website_url: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className="w-full bg-white py-24 max-w-[1920px] mx-auto" id="contact">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="text-sm md:text-5xl font-serif font-bold text-gray-400 mb-8">Contact Us/联系我们</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="h-full">
            <div className="bg-gray-50 p-8 rounded-lg h-full">
              <h3 className="text-sm font-bold mb-6">进一步沟通请留下您的足迹</h3>  
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-base font-bold mb-1">Name / 姓名</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-1">Phone / 电话</label>
                  <input 
                    ref={phoneInputRef}
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => { 
                      setFormData({...formData, phone: e.target.value}); 
                      e.target.setCustomValidity(''); 
                    }}
                    inputMode="numeric"
                    className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-1">Message / 留言</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Honeypot field - hidden from users but visible to bots */}
                <div className="hidden" style={{ display: 'none', opacity: 0, position: 'absolute', left: '-9999px' }}>
                  <input
                    type="text"
                    name="website_url"
                    value={formData.website_url}
                    onChange={e => setFormData({...formData, website_url: e.target.value})}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'submitting' || status === 'success'}
                  className="bg-black text-white py-3 px-6 rounded font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Sent Successfully' : 'Send Message'}
                </button>
                {status === 'error' && <p className="text-red-500 text-sm">请勿重复提交 十分钟后再试/Please wait for 10 minutes before submitting again.</p>}
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-8 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full flex-[2]">
              {/* WeChat QR Code */}
              <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center h-full">
                <div className="w-40 h-40 bg-white mb-4 relative">
                  <Image 
                    src="/images/static/QR_Code.jpg" 
                    alt="WeChat QR Code" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-base font-bold mb-1">扫码</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">微信添加</p>
                <p className="text-base text-red-500 font-bold mt-1">Pursuesdreamer</p>
              </div>

              {/* Douyin QR Code */}
              <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center h-full">
                <div className="w-40 h-40 bg-white mb-4 relative">
                  <Image 
                    src="/images/static/QR_doyin_Code.jpg" 
                    alt="Douyin QR Code" 
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-base font-bold mb-1">扫码</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">抖音关注</p>
                <p className="text-base text-red-500 font-bold mt-1">Pursuesdreamer</p>
              </div>
            </div>

            {/* Office Address */}
            <div className="bg-gray-50 p-8 rounded-lg w-full flex-none">
              <h4 className="text-base font-bold mb-2">Office Address/办公地址</h4>
              <p className="text-gray-600 leading-relaxed">
                云南省昆明市<br />
                滇池度假区<br />
                双河湾及第苑5-1-104
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
