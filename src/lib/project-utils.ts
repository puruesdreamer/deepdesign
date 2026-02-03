import fs from 'fs';
import path from 'path';
import { Project } from './data';
import projectsData from '@/data/projects.json';

const dataFilePath = path.join(process.cwd(), 'src/data/projects.json');

export function getProjects(): Project[] {
  // On Vercel, always use the static data bundled with the build
  // This avoids issues with reading files from the serverless filesystem
  if (process.env.VERCEL) {
    return projectsData as Project[];
  }

  try {
    // Check if file exists
    if (!fs.existsSync(dataFilePath)) {
      console.warn(`Data file not found at: ${dataFilePath}, falling back to static data.`);
      return projectsData as Project[];
    }

    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContent) as Project[];
  } catch (error) {
    console.error('Failed to read projects data, falling back to static data:', error);
    return projectsData as Project[];
  }
}

export function getProjectById(id: number): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}
