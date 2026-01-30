import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

const dataFilePath = path.join(process.cwd(), 'src/data/team.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load team data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const newData = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save team data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id, image } = await request.json();
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const team = JSON.parse(fileContents);

    // Determine image to delete
    let imgUrl = image;
    if (!imgUrl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memberToDelete = team.find((m: any) => m.id === id);
        if (memberToDelete) {
            imgUrl = memberToDelete.image;
        }
    }

    if (imgUrl) {
      // Delete associated image
      try {
        if (imgUrl.startsWith('/images/uploads')) {
            const relativePath = imgUrl.substring(1); // Remove leading slash
            const fullPath = path.join(process.cwd(), 'public', relativePath);
            
            console.log(`Attempting to delete team image: ${fullPath}`);
            
            // Use sync check for existence logic flow
            // Note: In async function, we can use try-catch around unlink
            
            try {
                await fs.unlink(fullPath);
                console.log(`Successfully deleted: ${fullPath}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (err.code === 'ENOENT') {
                     console.log(`File not found: ${fullPath}`);
                     // Fallback check
                     if (!relativePath.includes('team')) {
                        const correctedPath = path.join(process.cwd(), 'public', 'images', 'uploads', 'team', path.basename(imgUrl));
                        try {
                            await fs.unlink(correctedPath);
                            console.log(`Found file at corrected path, deleted: ${correctedPath}`);
                        } catch (e) {
                            // Ignore
                        }
                     }
                } else {
                    throw err;
                }
            }
        }
      } catch (e) {
        console.error(`Failed to delete image: ${imgUrl}`, e);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newTeam = team.filter((m: any) => m.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify(newTeam, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
