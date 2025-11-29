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
    const { profile_id, vacant_id, proposed_slots } = body;

    if (!profile_id || !vacant_id || !proposed_slots || !Array.isArray(proposed_slots)) {
      return NextResponse.json(
        { error: 'Missing required fields: profile_id, vacant_id, and proposed_slots array' },
        { status: 400 }
      );
    }

    // Create interview record
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('interview')
      .insert({
        profile_id,
        vacant_id,
        status: 'pending',
        proposed_slots,
      })
      .select()
      .single();

    if (interviewError) {
      console.error('Error creating interview:', interviewError);
      return NextResponse.json(
        { error: `Failed to create interview: ${interviewError.message}` },
        { status: 500 }
      );
    }

    // Get applicant information for notifications
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profile')
      .select('personal_information')
      .eq('id', profile_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    const personalInfo = profile?.personal_information || {};
    const applicantEmail = personalInfo.email || '';
    const applicantPhone = personalInfo.phone || '';

    // TODO: Send WhatsApp and email notifications
    // This would integrate with your notification service
    // For now, we'll return the interview with notification URLs

    return NextResponse.json({
      success: true,
      interview,
      notificationLinks: {
        accept: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/${interview.id}/accept`,
        reject: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/${interview.id}/reject`,
        reschedule: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/${interview.id}/reschedule`,
      },
    });
  } catch (error: any) {
    console.error('Error in create interview:', error);
    return NextResponse.json(
      { error: `Failed to create interview: ${error.message}` },
      { status: 500 }
    );
  }
}

