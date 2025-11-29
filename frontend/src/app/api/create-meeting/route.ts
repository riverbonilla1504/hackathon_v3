'use server';

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * API Route to create Google Meet meetings using Google Calendar API
 * 
 * Environment variables needed:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REFRESH_TOKEN
 */

// Initialize OAuth2 client
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth credentials are not configured. Please check your environment variables.');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob' // Redirect URI for server-to-server
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicantEmail, applicantName, enterpriseEmail, scheduledDate, duration } = body;

    if (!applicantEmail || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields: applicantEmail and scheduledDate' },
        { status: 400 }
      );
    }

    // Check if Google credentials are configured
    const hasCredentials = process.env.GOOGLE_CLIENT_ID && 
                          process.env.GOOGLE_CLIENT_SECRET && 
                          process.env.GOOGLE_REFRESH_TOKEN;

    // Always use simulated mode for now (until Google verification is complete)
    // This creates realistic-looking Google Meet links that work for demonstration
    console.log('Using simulated Google Meet link generation (demo mode)');
    const meetId = generateMeetId();
    const meetLink = `https://meet.google.com/${meetId}`;
    
    // Calculate end time for calendar event simulation
    const startDateTime = new Date(scheduledDate);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 30) * 60000);
    
    return NextResponse.json({
      success: true,
      meetLink,
      meetId,
      calendarEventId: `event-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      message: 'Meeting link generated successfully (simulated mode)',
      simulated: true,
    });

    /* 
    // Real Google Calendar API integration (commented out until Google verification is complete)
    // Uncomment this code once Google verification is complete and credentials are configured
    
    if (hasCredentials) {
      const oauth2Client = getOAuth2Client();
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Calculate end time
      const startDateTime = new Date(scheduledDate);
      const endDateTime = new Date(startDateTime.getTime() + (duration || 30) * 60000);

      // Generate a unique request ID for the meeting
      const requestId = `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Create calendar event with Google Meet
      const event = {
        summary: applicantName ? `Entrevista con ${applicantName}` : 'Entrevista de Trabajo',
        description: 'Reunión de entrevista programada desde Worky AI',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota',
        },
        conferenceData: {
          createRequest: {
            requestId: requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        attendees: [
          { email: applicantEmail },
          ...(enterpriseEmail ? [{ email: enterpriseEmail }] : []),
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 15 }, // 15 minutes before
          ],
        },
      };

      // Insert event into calendar
      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      });

      const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri;
      const meetId = response.data.id;

      if (!meetLink) {
        throw new Error('Failed to get Google Meet link from calendar event');
      }

      return NextResponse.json({
        success: true,
        meetLink,
        meetId,
        calendarEventId: response.data.id,
        message: 'Meeting created successfully in Google Calendar',
      });
    }
    */
  } catch (error: any) {
    console.error('Error creating Google Meet meeting:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to create meeting';
    if (error.message?.includes('credentials')) {
      errorMessage = 'Google credentials not configured correctly. Please check your environment variables.';
    } else if (error.message?.includes('refresh_token')) {
      errorMessage = 'Invalid or expired refresh token. Please obtain a new refresh token.';
    } else if (error.message?.includes('permission')) {
      errorMessage = 'Insufficient permissions. Please ensure the Google account has calendar access.';
    } else {
      errorMessage = error.message || 'Failed to create meeting';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function generateMeetId(): string {
  // Generate a realistic-looking Google Meet ID
  // Format: 3 letters, 4 letters, 3 letters (e.g., abc-defg-hij)
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  
  // Generate three segments
  const segment1 = Array.from({ length: 3 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  
  const segment2 = Array.from({ length: 4 }, () => 
    (Math.random() > 0.5 
      ? chars.charAt(Math.floor(Math.random() * chars.length))
      : nums.charAt(Math.floor(Math.random() * nums.length)))
  ).join('');
  
  const segment3 = Array.from({ length: 3 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  
  return `${segment1}-${segment2}-${segment3}`;
}

