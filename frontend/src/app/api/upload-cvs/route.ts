'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import OpenAI from 'openai';

// Note: For production, you'll need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local
// This key has admin access and should only be used server-side

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// IMPORTANT: Use service role key to bypass RLS. If not set, the API will fail with RLS errors.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_KEY!;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set! This will cause RLS policy violations.');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for CV uploads');
}

// Create Supabase admin client for storage operations
// Using service role key bypasses RLS policies
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const openai = new OpenAI({ apiKey: openaiKey });

export async function POST(req: NextRequest) {
  try {
    // Check if service role key is set
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables!');
      return NextResponse.json(
        { 
          error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Please check your .env.local file.' 
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File || formData.get('zipFile') as File; // Support both 'file' and 'zipFile' for backward compatibility
    const vacantId = formData.get('vacantId') as string;
    const companyId = formData.get('companyId') as string;

    if (!file || !vacantId || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, vacantId, or companyId' },
        { status: 400 }
      );
    }

    const processedCVs: any[] = [];
    const errors: string[] = [];
    const fileName = file.name.toLowerCase();
    const isZip = fileName.endsWith('.zip');

    let filesToProcess: Array<{ name: string; content: ArrayBuffer }> = [];

    if (isZip) {
      // Process ZIP file
      const arrayBuffer = await file.arrayBuffer();
      const zip = new JSZip();
      const zipData = await zip.loadAsync(arrayBuffer);

      // Extract files from ZIP
      for (const [zipFileName, zipFile] of Object.entries(zipData.files)) {
        if (zipFile.dir) continue; // Skip directories

        // Only process PDF files
        const ext = zipFileName.toLowerCase().split('.').pop();
        if (ext !== 'pdf') {
          errors.push(`Skipped ${zipFileName}: Only PDF files are supported`);
          continue;
        }

        const fileContent = await zipFile.async('arraybuffer');
        filesToProcess.push({ name: zipFileName, content: fileContent });
      }
    } else {
      // Process single file
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf') {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload PDF file or ZIP file containing PDFs' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      filesToProcess.push({ name: file.name, content: arrayBuffer });
    }

    // Process each file
    for (const { name: fileName, content: fileContent } of filesToProcess) {
      try {
        // Only process PDF files
        const ext = fileName.toLowerCase().split('.').pop();
        if (ext !== 'pdf') {
          errors.push(`Skipped ${fileName}: Only PDF files are supported`);
          continue;
        }

        // Convert file to base64 for webhook
        const base64 = Buffer.from(fileContent).toString('base64');
        
        // Send to webhook endpoint
        const webhookPayload = {
          vacant_id: parseInt(vacantId),
          file_name: fileName,
          file_mime: 'application/pdf',
          file_base64: base64,
          source: 'web_import'
        };

        let webhookResponse: any = null;
        let cvUrl: string | null = null;
        let profileId: number | null = null;

        try {
          const webhookRes = await fetch('https://riverz1357.app.n8n.cloud/webhook/cv-intake', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          });

          if (!webhookRes.ok) {
            throw new Error(`Webhook returned status ${webhookRes.status}`);
          }

          webhookResponse = await webhookRes.json();

          if (webhookResponse.ok && webhookResponse.cv_url) {
            cvUrl = webhookResponse.cv_url;
            profileId = webhookResponse.profile_id;
          } else {
            throw new Error('Webhook response indicates failure or missing data');
          }
        } catch (webhookError: any) {
          console.error(`Webhook error for ${fileName}:`, webhookError);
          errors.push(`Failed to process ${fileName} via webhook: ${webhookError.message}`);
          continue;
        }

        // The webhook has already created the profile, so we just need to verify it exists
        // and potentially update it with additional information if needed
        let profileData: any = null;
        
        if (profileId) {
          // Fetch the profile that was created by the webhook
          const { data: fetchedProfile, error: fetchError } = await supabaseAdmin
            .from('profile')
            .select('*')
            .eq('id', profileId)
            .single();

          if (fetchError) {
            console.error(`Error fetching profile ${profileId} for ${fileName}:`, fetchError);
            errors.push(`Profile created by webhook but could not be retrieved: ${fetchError.message}`);
            continue;
          }

          profileData = fetchedProfile;
        } else {
          // Fallback: if webhook didn't return profile_id, try to find by cv_url
          const { data: fetchedProfile, error: fetchError } = await supabaseAdmin
            .from('profile')
            .select('*')
            .eq('cv_url', cvUrl)
            .eq('vacant_id', parseInt(vacantId))
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (fetchError || !fetchedProfile) {
            console.error(`Error finding profile for ${fileName}:`, fetchError);
            errors.push(`Could not find profile created by webhook for ${fileName}`);
            continue;
          }

          profileData = fetchedProfile;
          profileId = fetchedProfile.id;
        }

        // Extract information from profile data for response
        const personalInfo = profileData.personal_information || {};
        const experience = profileData.experience || {};
        const education = profileData.education || {};
        const skills = profileData.skills || [];

        processedCVs.push({
          fileName,
          applicant: {
            id: profileId,
            name: personalInfo.name || fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Unknown Applicant',
            email: personalInfo.email || '',
            phone: personalInfo.phone || '',
            experience_years: experience.years || 0,
            skills: Array.isArray(skills) ? skills : [],
            education: education.degree || education.institution || '',
            match_score: 75, // Default, can be calculated later
            cv_url: cvUrl,
            status: profileData.status || 'pending',
          },
        });
      } catch (error: any) {
        errors.push(`Error processing ${fileName}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCVs.length,
      total: filesToProcess.length,
      applicants: processedCVs.map(cv => cv.applicant),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Upload CVs error:', error);
    return NextResponse.json(
      { error: `Failed to process CVs: ${error.message}` },
      { status: 500 }
    );
  }
}

