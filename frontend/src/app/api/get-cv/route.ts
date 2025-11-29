'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const cvPath = searchParams.get('path');

    if (!cvPath) {
      return NextResponse.json({ error: 'CV path is required' }, { status: 400 });
    }

    // Download file from Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cvs')
      .download(cvPath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Convert blob to base64 for display
    const arrayBuffer = await data.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = data.type || 'application/pdf';

    return NextResponse.json({
      success: true,
      data: `data:${mimeType};base64,${base64}`,
      mimeType,
    });
  } catch (error: any) {
    console.error('Get CV error:', error);
    return NextResponse.json(
      { error: `Failed to retrieve CV: ${error.message}` },
      { status: 500 }
    );
  }
}

