import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { getProjects } from "@/lib/project-utils";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await getProjects();
  
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-900 selection:text-white">
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <Portfolio projects={projects} />
        <About />
        <Contact />
      </main>
      
      <footer className="w-full py-8 border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          <p>&copy; 2026 FENG YI SPACE DESIGN. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
