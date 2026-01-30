"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects as defaultProjects, Project } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All/全部", "Hotel/酒店", "Villa/别墅", "Apartment/平层", "Other/其他"];

interface PortfolioProps {
  projects?: Project[];
}

export function Portfolio({ projects = defaultProjects }: PortfolioProps) {
  const [activeCategory, setActiveCategory] = useState("All/全部");

  const filteredProjects = activeCategory === "All/全部"
    ? projects
    : projects.filter(project => project.category === activeCategory);

  return (
    <section className="w-full bg-white max-w-[1920px] mx-auto py-24" id="works">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-16">
        <h2 className="text-base md:text-4xl font-bold text-gray-400 mb-8">portfolio/案例展示</h2>
        
        <div className="flex flex-wrap gap-6 md:gap-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-sm md:text-lg font-serif transition-all duration-300 ${
                activeCategory === category
                  ? "text-black font-bold border-b border-black pb-1"
                  : "text-gray-400 hover:text-gray-600 pb-1 border-b border-transparent"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-12 md:gap-24 min-h-[400px]">
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full"
              >
                <Link href={`/works/${project.id}`} className="group block">
                  {/* Project Title Row */}
                  <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-6 flex justify-between items-end">
                     <div>
                        <h3 className="text-base md:text-xl font-serif font-bold group-hover:text-gray-600 transition-colors">  
                          {project.title}
                        </h3>
                        <p className="text-gray-500 uppercase tracking-widest text-sm mt-2">{project.category}</p>
                     </div>
                     <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-bold border-b border-black pb-1">VIEW PROJECT</span>
                     </div>
                  </div>

                  {/* Thumbnails Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-4 px-1 md:px-4">
                    {project.images.slice(0, 4).map((img, index) => (
                      <div key={index} className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Image
                          src={img}
                          alt={`${project.title} - Image ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-center py-24 text-gray-400 font-serif italic"
            >
              No projects found in this category.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-24 text-center">
        <div className="inline-block relative">
            <span className="text-xl font-serif italic text-gray-300 select-none relative z-10 px-4 bg-white">
                More Projects Coming Soon/更多项目即将上线
            </span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-0"></div>
        </div>
      </div>
    </section>
  );
}
