'use server';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, offer, applicants } = body as {
      question: string;
      offer: {
        name: string;
        rol: string;
        salary: number;
        location: string;
        availability: string;
      };
      applicants: Array<{
        experience_years: number;
        skills: string[];
        education: string;
        match_score: number;
        status: string;
      }>;
    };

    if (!openaiKey) {
      return NextResponse.json(
        { answer: 'OPENAI_KEY is not configured on the server.' },
        { status: 200 },
      );
    }

    const client = new OpenAI({ apiKey: openaiKey });

    const systemPrompt = `
You are a recruitment analytics assistant for Worky AI.
You receive:
- A job offer (role, salary, location, availability)
- A list of anonymous applicants (experience years, skills, education, match score, status)

Your job:
- Answer clearly and briefly (max ~4 sentences).
- Avoid exposing any personal identifiers (names, emails, phones).
- Focus on patterns, recommendations, and comparisons using the provided numeric and skill data.
`;

    const content = `
USER QUESTION:
${question}

JOB OFFER:
Role: ${offer.rol}
Name: ${offer.name}
Salary: ${offer.salary}
Location: ${offer.location}
Availability: ${offer.availability}

APPLICANTS SUMMARY (anonymous JSON):
${JSON.stringify(
  applicants.map(a => ({
    experience_years: a.experience_years,
    skills: a.skills,
    education: a.education,
    match_score: a.match_score,
    status: a.status,
  })),
)}
`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user', content: content.trim() },
      ],
      temperature: 0.4,
      max_tokens: 300,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      'I could not generate an answer at this time.';

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { answer: 'There was an error calling the AI assistant. Please try again later.' },
      { status: 200 },
    );
  }
}


