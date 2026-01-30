import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { Portfolio } from "@/components/home/Portfolio";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import fs from 'fs';
import path from 'path';

async function getProjects() {
  const filePath = path.join(process.cwd(), 'src/data/projects.json');
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (e) {
    console.error('Failed to load projects', e);
    return [];
  }
}

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
