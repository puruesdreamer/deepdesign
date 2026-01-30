import projectsData from '@/data/projects.json';

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  year: string;
  location: string;
  area: string;
  services?: string[];
  images: string[];
}

export const projects: Project[] = projectsData as Project[];
