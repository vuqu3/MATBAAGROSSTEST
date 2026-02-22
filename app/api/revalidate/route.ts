import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    console.log('REVALIDATING_PATH:', path);
    
    // Revalidate the specified path
    revalidatePath(path);

    console.log('REVALIDATION_SUCCESS:', path);

    return NextResponse.json({ 
      success: true, 
      message: `Path ${path} revalidated successfully` 
    });
  } catch (error) {
    console.error('REVALIDATION_ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Revalidation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
