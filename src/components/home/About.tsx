'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

export function About() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch('/api/admin/team')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTeam(data);
        }
      })
      .catch(err => console.error("Failed to load team", err));
  }, []);

  return (
    <section className="w-full bg-gray-50 py-24 max-w-[1920px] mx-auto" id="about">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="mb-16">
          <h2 className="text-lg md:text-5xl font-serif font-bold text-gray-400">OUR TEAM/团队风采</h2>     
        </div>

        {/* Designers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {team.map((designer) => (
            <div key={designer.id} className="flex flex-col gap-4">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-200">
                <Image
                  src={designer.image}
                  alt={designer.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold">{designer.name}</h3>  
                <p className="text-xs text-gray-500 uppercase tracking-widest">{designer.role}</p>  
              </div>
            </div>
          ))}
        </div>

        {/* Company History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-gray-200 pt-16">
          <div className="lg:col-span-4">
            <h3 className="text-lg font-serif font-bold mb-4 text-gray-400">Our history/公司简介</h3>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-8 text-gray-600 leading-relaxed">
             <p className="text-base">
               云南风翼空间设计始创于2008年，云南风翼空间设计有限公司为客户提供高端设计服务，从设计研发、采购、生产、销售、储运、现场施工及陈列等六个维度提供一体化解决方案。秉承“以实现客户价值为核心”的理念，凭借独特完美的设计手法和强大的资源整合能力，为客户构筑了一个从设计方案到成本规划的全方位高端服务平台。涵盖酒店空间、别墅大宅、办公会所空间、 售楼处&样板房、餐饮娱乐空间等领域。
             </p>
             <p className="text-sm">
               Yunnan Feng Yi Space Design, founded in 2001, provides high-end design services to its clients. It offers an integrated solution across six dimensions: design research and development, procurement, production, sales, storage and transportation, on-site construction, and display. Adhering to the concept of "focusing on achieving customer value," Yunnan Feng Yi Space Design Co., Ltd. utilizes unique and perfect design techniques and strong resource integration capabilities to build a comprehensive high-end service platform for clients, encompassing areas such as hotel spaces, villas, office clubs, sales offices & showrooms, and catering and entertainment spaces.
             </p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
               <div>
                 <span className="block text-sm font-bold text-gray-900 mb-2">2008</span>
                 <span className="text-sm uppercase tracking-widest">Founded</span>   
               </div>
               <div>
                 <span className="block text-sm font-bold text-gray-900 mb-2">100+</span>
                 <span className="text-sm uppercase tracking-widest">Projects</span>
               </div>
               <div>
                 <span className="block text-sm font-bold text-gray-900 mb-2">50+</span>  
                 <span className="text-sm uppercase tracking-widest">Awards</span>  
               </div>
               <div>
                 <span className="block text-sm font-bold text-gray-900 mb-2">20+</span>      
                 <span className="text-sm uppercase tracking-widest">Team Members</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}