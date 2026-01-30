import { Navbar } from "@/components/layout/Navbar";
import { Project } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";
import projectsData from "@/data/projects.json";

export const dynamic = 'force-dynamic';

async function getProjects() {
  return projectsData as Project[];
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15+, params is a Promise
  const { id } = await params;
  
  const projects = await getProjects();
  const project = projects.find((p) => p.id === parseInt(id));

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-900 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-24">
        {/* Project Header */}
        <section className="container mx-auto px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-[1920px]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm font-bold tracking-widest text-gray-400 uppercase">
              <span>{project.category}</span>
              <span className="hidden md:inline">•</span>
              <span>{project.year}</span>
              <span className="hidden md:inline">•</span>
              <span>{project.location}</span>
              <span className="hidden md:inline">•</span>
              <span>{project.services?.join(', ') || ''}</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-tight">
              {project.title}
            </h1>
          </div>
        </section>

        {/* Project Content */}
        <section className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Left Column: Text */}
            <div className="lg:col-span-4 flex flex-col gap-8 sticky top-32 self-start">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-widest mb-4">项目简介</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Area/面积</span>
                  <span className="text-lg font-serif">{project.area}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location/位置</span>
                  <span className="text-lg font-serif">{project.location}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Year/项目年份</span>
                  <span className="text-lg font-serif">{project.year}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Service/服务项目</span>
                  <span className="text-lg font-serif">{project.services?.join(', ') || ''}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="lg:col-span-8 flex flex-col gap-8 md:gap-12">
              {project.images?.map((img, index) => (
                <div key={index} className="relative w-full aspect-[4/3] bg-gray-100">
                  <Image
                    src={img}
                    alt={`${project.title} - View ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Navigation to Next Project (Optional but nice) */}
        <section className="container mx-auto px-6 md:px-12 lg:px-24 mt-24 pt-24 border-t border-gray-100 max-w-[1920px]">
           <div className="flex justify-between items-center">
             <a href="/#works" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-lg font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors">
               ← Back to Works
             </a>
           </div>
        </section>
      </main>

      <footer className="w-full py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          <p>&copy; 2026 FENG YI SPACE. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
