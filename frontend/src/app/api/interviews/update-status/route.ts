'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interview_id, status, scheduled_at, meeting_url, proposed_slots } = body;

    if (!interview_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: interview_id and status' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'reschedule_requested'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = { status };
    if (scheduled_at) updateData.scheduled_at = scheduled_at;
    if (meeting_url) updateData.meeting_url = meeting_url;
    if (proposed_slots) updateData.proposed_slots = proposed_slots;

    // Update interview
    const { data: interview, error: updateError } = await supabaseAdmin
      .from('interview')
      .update(updateData)
      .eq('id', interview_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating interview:', updateError);
      return NextResponse.json(
        { error: `Failed to update interview: ${updateError.message}` },
        { status: 500 }
      );
    }

    // If status is accepted, create Google Meet link if not provided
    if (status === 'accepted' && !meeting_url) {
      // Generate or create meeting link
      const meetId = Math.random().toString(36).substring(2, 15);
      const meetingLink = `https://meet.google.com/${meetId}`;
      
      const { data: updatedInterview, error: linkError } = await supabaseAdmin
        .from('interview')
        .update({ meeting_url: meetingLink })
        .eq('id', interview_id)
        .select()
        .single();

      if (!linkError && updatedInterview) {
        return NextResponse.json({
          success: true,
          interview: updatedInterview,
        });
      }
    }

    return NextResponse.json({
      success: true,
      interview,
    });
  } catch (error: any) {
    console.error('Error updating interview status:', error);
    return NextResponse.json(
      { error: `Failed to update interview: ${error.message}` },
      { status: 500 }
    );
  }
}

