import fs from 'fs';
import path from 'path';
import { Project } from './data';
import projectsData from '@/data/projects.json';

const dataFilePath = path.join(process.cwd(), 'src/data/projects.json');

export function getProjects(): Project[] {
  // 1. Try to read from file system (Enable runtime updates for self-hosted/AliYun)
  try {
    const dataFilePath = path.join(process.cwd(), 'src/data/projects.json');
    // Only attempt FS read if we are likely in a Node environment that has the source files
    // In Vercel serverless, src/data might not exist or be accessible in the same way
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(fileContent);
      if (Array.isArray(data) && data.length > 0) {
        return data as Project[];
      }
    }
  } catch (error) {
    // Silently fail on FS errors and fall back to static data
    // This is expected behavior on Vercel or when file access fails
    console.warn('Runtime data access failed, using static build data.');
  }

  // 2. Fallback to static data (Bundled at build time)
  // This ensures Vercel always has data even if FS access fails
  return projectsData as Project[];
}

export function getProjectById(id: number): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}
