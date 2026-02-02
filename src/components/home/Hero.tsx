"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(() => import('./ParticleBackground'), {
  ssr: false,
});

export function Hero() {
  return (
    <section className="relative w-full pt-24 pb-10 md:pt-28 md:pb-16 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
      <ParticleBackground />
      {/* Top Text Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 md:mb-24">
        <div className="lg:col-span-7 flex flex-col gap-2 max-w-[640px] scale-[0.6] origin-top-left">
          <p className="text-base md:text-lg tracking-widest text-gray-500 uppercase">
            DESIGN BRINGS INFINITE POSSIBILITIES ..
            <br />
            设计无限可能...
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold leading-tight text-gray-900 tracking-tight">
            FENG YI SPACE <br />
            <span className="text-gray-400">DESIGN STUDIO</span>
          </h1>
        </div>
        
        <div className="lg:col-span-5 flex flex-row justify-end items-start text-left gap-6 md:gap-10 lg:pt-0 ml-auto self-start scale-[0.8] origin-top-right">
          <div className="flex flex-col gap-2 items-start text-left max-w-[240px]">
            <span className="text-xs font-bold text-gray-900 border-b border-gray-900 w-4 pb-2 mb-2">01</span>
            <h3 className="text-xs font-serif font-bold uppercase">Best Quality <span className="text-gray-500 font-sans font-normal ml-1">卓越品质</span></h3>
            <p className="text-xs text-gray-500 leading-relaxed"> 
              根据用户需求, 提供品质方案,<br />
              创造溢价空间, 打造专属定制<br />
              <span className="text-[10px] text-gray-400 mt-1 block leading-tight">
                Based on user needs, providing quality solutions, creating premium value, crafting exclusive customization.
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start text-left max-w-[240px]">
            <span className="text-xs font-bold text-gray-900 border-b border-gray-900 w-4 pb-2 mb-2">02</span>
            <h3 className="text-xs font-serif font-bold uppercase">Warranty <span className="text-gray-500 font-sans font-normal ml-1">质量保证</span></h3> 
            <p className="text-xs text-gray-500 leading-relaxed">
              专业施工团队，全案供应链条，<br />
              完善质量保障，让您全程无忧<br />
              <span className="text-[10px] text-gray-400 mt-1 block leading-tight">
                Professional construction team, full supply chain, complete quality assurance, ensuring peace of mind.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Images Section */}
      <div className="relative w-full max-w-[90%] ml-auto flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12 z-10 -mt-[20px] md:-mt-[80px] lg:-mt-[120px] h-[350px] md:h-[450px] lg:h-[550px] scale-[0.9] origin-top-right">
        
        {/* Main Large Image (Left) */}
        <div className="relative w-full md:w-[72%] h-full bg-gray-100 group overflow-hidden border-1 border-black">
           <Image 
            src="/images/static/first001.png"
            alt="Architectural Detail"
             fill
             className="object-cover transition-transform duration-700 group-hover:scale-105"
             priority
           />
           
        </div>

        {/* Floating Card - Overlapping Bottom Center (Crossing both images) */}
        <div className="absolute -bottom-9 left-[72%] -translate-x-[65%] z-40 bg-[#3d3f3a] text-white p-8 md:p-12 w-full md:max-w-sm shadow-2xl -mb-[50px] scale-[0.8] origin-bottom">
           <p className="text-[20px] tracking-widest uppercase text-gray-400 mb-4">Our Works</p>
           <h2 className="text-lg font-serif mb-4">WHAT CAN WE DO? <br/><span className="text-sm font-sans text-gray-400 font-normal">我们能做什么？</span></h2> 
           <p className="text-gray-400 text-sm leading-relaxed mb-1">
             酒店空间 Hotel Space<br />
             别墅豪宅 Luxury Villa<br />
             商业会所 Commercial Club<br />
             会议办公 Conference Office<br />
             地产样板 Real Estate Model
           </p>
           <h2 className="inline-flex items-center text-sm font-bold tracking-widest text-white transition-colors uppercase border-b border-gray-500 pb-1 mt-4">
             View Project
           </h2>
        </div>

        {/* Secondary Narrow Image (Right) */}
        <div className="relative w-full md:w-[28%] h-full bg-gray-100 group overflow-hidden hidden md:block border-2 border-black">
           <Image 
            src="/images/static/first002.png"
            alt="Modern Building Sky"
             fill
             className="object-cover transition-transform duration-700 group-hover:scale-105"
           />
        </div>

        {/* Arrow Down - Separate Layer */}
        <div className="absolute left-0 -bottom-[100px] w-full h-[100px] z-50 flex items-center justify-center pb-8 pointer-events-none">
          <ArrowDown className="text-white opacity-50 w-10 h-10 animate-bounce" />
        </div>

      </div>

      {/* Gray Bottom Band */}
      <div className="absolute left-0 bottom-10 w-full bg-[#4c514b] h-[200px] z-0"></div>
      
    </section>
  );
}
