import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/messages.json');

// Simple in-memory rate limiting (Note: This resets on server restart/redeploy)
// For production, use Redis or a database
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 2; // Allow 2 requests per minute

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // 1. Honeypot Check
    // 'website_url' is the hidden field. If filled, it's a bot.
    if (formData.website_url) {
      // Return success to fool the bot, but don't save
      return NextResponse.json({ success: true });
    }

    // 2. Simple Rate Limiting (IP-based)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastRequestTime = rateLimitMap.get(ip) || 0;

    if (now - lastRequestTime < 10 * 60 * 1000) {
         return NextResponse.json({ error: '请间隔10分钟提交' }, { status: 429 });
    }
    
    // Update rate limit
    rateLimitMap.set(ip, now);

    // 3. Clean data (remove honeypot field)
    const { website_url, ...messageData } = formData;

    // 4. Save Message
    let messages = [];
    try {
      const fileContents = await fs.readFile(dataFilePath, 'utf8');
      messages = JSON.parse(fileContents);
    } catch (e) { }

    const messageWithMeta = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...messageData
    };

    messages.unshift(messageWithMeta);
    await fs.writeFile(dataFilePath, JSON.stringify(messages, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
