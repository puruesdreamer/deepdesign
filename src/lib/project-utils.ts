import fs from 'fs';
import path from 'path';
import { Project } from './data';
import { projects as staticProjects } from './data';

export function getProjects(): Project[] {
  // 1. Force static data on Vercel to avoid ephemeral FS issues
  // VERCEL env var is set to "1" in Vercel environment
  if (process.env.VERCEL) {
    return staticProjects;
  }

  // 2. Try to read from file system (Enable runtime updates for self-hosted/AliYun)
  try {
    const dataFilePath = path.join(process.cwd(), 'src/data/projects.json');
    // Only attempt FS read if we are likely in a Node environment that has the source files
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      const data = JSON.parse(fileContent);
      if (Array.isArray(data) && data.length > 0) {
        return data as Project[];
      }
    }
  } catch (error) {
    // Silently fail on FS errors and fall back to static data
    console.warn('Runtime data access failed, using static build data.');
  }

  // 2. Fallback to static data (Bundled at build time)
  return staticProjects;
}

export function getProjectById(id: number | string): Project | undefined {
  const projects = getProjects();
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  return projects.find((p) => p.id === numericId);
}
