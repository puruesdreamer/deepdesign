import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

const dataFilePath = path.join(process.cwd(), 'src/data/projects.json');

export async function GET() {
  try {
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const projects = JSON.parse(fileContent);
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id, images } = await request.json();
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const projects = JSON.parse(fileContent);

    // Determine images to delete: use provided images or fallback to finding by id
    let imagesToDelete = images;
    
    // If no images provided from frontend, try to find in current data
    if (!imagesToDelete || !Array.isArray(imagesToDelete)) {
        const projectToDelete = projects.find((p: any) => p.id === id);
        if (projectToDelete) {
            imagesToDelete = projectToDelete.images;
        }
    }

    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      // Delete associated images
      for (const imgUrl of imagesToDelete) {
        try {
          if (typeof imgUrl === 'string' && imgUrl.startsWith('/images/uploads')) {
              const relativePath = imgUrl.substring(1);
              const fullPath = path.join(process.cwd(), 'public', relativePath);
              
              console.log(`Attempting to delete project image: ${fullPath}`);

              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`Successfully deleted: ${fullPath}`);
              } else {
                 console.log(`File not found: ${fullPath}`);
                 // Fallback for projects
                 if (!relativePath.includes('projects')) {
                    const correctedPath = path.join(process.cwd(), 'public', 'images', 'uploads', 'projects', path.basename(imgUrl));
                    if (fs.existsSync(correctedPath)) {
                        console.log(`Found file at corrected path, deleting: ${correctedPath}`);
                        fs.unlinkSync(correctedPath);
                    }
                 }
              }
          }
        } catch (e) {
          console.error(`Failed to delete image: ${imgUrl}`, e);
        }
      }
    }

    const newProjects = projects.filter((p: any) => p.id !== id);

    if (newProjects.length !== projects.length) {
      fs.writeFileSync(dataFilePath, JSON.stringify(newProjects, null, 2), 'utf8');
      
      // Also delete the project folder if it exists
      try {
        const projectToDelete = projects.find((p: any) => p.id === id);
        if (projectToDelete) {
           let categoryFolder = 'other';
           if (projectToDelete.category.includes('Hotel')) categoryFolder = 'hotel';
           else if (projectToDelete.category.includes('Villa')) categoryFolder = 'villa';
           else if (projectToDelete.category.includes('Apartment')) categoryFolder = 'apartment';
           
           const projectDir = path.join(process.cwd(), 'public', 'images', 'uploads', 'projects', categoryFolder, id.toString());
           if (fs.existsSync(projectDir)) {
             // rmSync with recursive: true deletes the folder and all its contents
             fs.rmSync(projectDir, { recursive: true, force: true });
             console.log(`Successfully deleted project directory: ${projectDir}`);
           }
        }

        // Fallback: Check for old style project ID folder at root of projects
        const oldProjectDir = path.join(process.cwd(), 'public', 'images', 'uploads', 'projects', id.toString());
        if (fs.existsSync(oldProjectDir)) {
          fs.rmSync(oldProjectDir, { recursive: true, force: true });
          console.log(`Successfully deleted old style project directory: ${oldProjectDir}`);
        }
      } catch (dirError) {
        console.error(`Failed to delete project directory for ID ${id}:`, dirError);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
