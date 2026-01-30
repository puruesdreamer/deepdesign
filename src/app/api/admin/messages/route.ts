import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

const dataFilePath = path.join(process.cwd(), 'src/data/messages.json');

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const { ids } = await request.json();
    let messages = [];
    try {
      const fileContents = await fs.readFile(dataFilePath, 'utf8');
      messages = JSON.parse(fileContents);
    } catch (e) { return NextResponse.json({ success: true }); }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMessages = messages.filter((m: any) => !ids.includes(m.id));
    await fs.writeFile(dataFilePath, JSON.stringify(newMessages, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
  }
}
