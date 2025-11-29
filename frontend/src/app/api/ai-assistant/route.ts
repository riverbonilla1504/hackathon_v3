'use server';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context } = body as {
      question: string;
      context?: {
        currentPage?: string;
        workOffersCount?: number;
        hasProfile?: boolean;
        enterpriseName?: string;
        companyId?: number;
        isCreatingOffer?: boolean;
        workOfferDraft?: {
          name?: string;
          rol?: string;
          salary?: number;
          description?: string;
          availability?: string;
          location?: string;
        };
        workOffers?: Array<{
          vacant_id: number;
          name: string;
          rol: string;
          salary: number;
          description: string;
          availability: string;
          location: string;
          created_at: string;
        }>;
        applicants?: Array<{
          id: number;
          vacant_id: number;
          name: string;
          email: string;
          experience_years: number;
          skills: string[];
          education: string;
          match_score: number;
          status: string;
          applied_at: string;
        }>;
      };
    };

    if (!openaiKey) {
      return NextResponse.json(
        { answer: '¡Estoy aquí para ayudarte! Sin embargo, el asistente de IA no está completamente configurado. Aún puedo brindarte orientación general sobre Worky AI:\n\nWorky AI ayuda a las empresas a gestionar ofertas de trabajo y encontrar los mejores candidatos. Puedes crear ofertas de trabajo, revisar aplicantes y usar el emparejamiento con IA para encontrar el candidato perfecto para tus posiciones.' },
        { status: 200 },
      );
    }

    const client = new OpenAI({ apiKey: openaiKey });

    // Build work offers summary for the prompt
    let workOffersSummary = '';
    if (context?.workOffers && context.workOffers.length > 0) {
      workOffersSummary = '\n\n**YOUR WORK OFFERS:**\n';
      context.workOffers.forEach((offer, index) => {
        const applicantsForOffer = context.applicants?.filter(app => app.vacant_id === offer.vacant_id) || [];
        const approvedCount = applicantsForOffer.filter(app => app.status === 'approved').length;
        const rejectedCount = applicantsForOffer.filter(app => app.status === 'rejected').length;
        const pendingCount = applicantsForOffer.filter(app => app.status === 'pending').length;
        
        workOffersSummary += `\n**Offer ${index + 1}: ${offer.name}** (ID: ${offer.vacant_id})\n`;
        workOffersSummary += `- Role: ${offer.rol}\n`;
        workOffersSummary += `- Salary: $${offer.salary?.toLocaleString() || 'Not specified'}\n`;
        workOffersSummary += `- Location: ${offer.location || 'Not specified'}\n`;
        workOffersSummary += `- Type: ${offer.availability || 'Not specified'}\n`;
        workOffersSummary += `- Total Applicants: ${applicantsForOffer.length}\n`;
        workOffersSummary += `  - Approved: ${approvedCount}\n`;
        workOffersSummary += `  - Rejected: ${rejectedCount}\n`;
        workOffersSummary += `  - Pending: ${pendingCount}\n`;
        if (applicantsForOffer.length > 0) {
          const avgMatchScore = applicantsForOffer.reduce((sum, app) => sum + app.match_score, 0) / applicantsForOffer.length;
          workOffersSummary += `- Average Match Score: ${Math.round(avgMatchScore)}%\n`;
        }
      });
      
      // Add applicants summary
      if (context.applicants && context.applicants.length > 0) {
        workOffersSummary += `\n\n**APPLICANTS SUMMARY:**\n`;
        workOffersSummary += `Total Applicants: ${context.applicants.length}\n`;
        workOffersSummary += `- Approved: ${context.applicants.filter(app => app.status === 'approved').length}\n`;
        workOffersSummary += `- Rejected: ${context.applicants.filter(app => app.status === 'rejected').length}\n`;
        workOffersSummary += `- Pending: ${context.applicants.filter(app => app.status === 'pending').length}\n`;
      }
    } else if (context?.workOffersCount === 0) {
      workOffersSummary = '\n\n**WORK OFFERS:** No work offers created yet.';
    }

    const systemPrompt = `You are Worky AI, a helpful assistant for the Worky AI recruitment platform. Your role is to:
- Answer questions about how to use the application
- Guide users through navigation and features
- Explain how the platform works
- Help with creating work offers interactively by asking for missing information
- **Answer questions about the user's work offers, applicants, and statistics using the data provided**
- Analyze and provide insights about applicants, match scores, and work offers
- Provide friendly, clear, and concise answers (2-4 sentences when possible, but can be longer for analysis)
- Be encouraging and helpful
- Use the enterprise name when addressing the user to personalize the experience
- **ALWAYS answer in Spanish**
- **ALWAYS use markdown formatting to make responses visually appealing and well-structured**

**MARKDOWN FORMATTING GUIDELINES:**
- Use **bold** for important numbers, names, titles, and key information
- Use *italic* for emphasis on secondary information
- Use lists (- or •) for multiple items, statistics, or steps
- Use numbered lists (1. 2. 3.) for sequential instructions
- Use headings (## or ###) to organize sections when providing detailed analysis
- When showing statistics, format them clearly with bold numbers and organized lists
- Use code formatting (\`text\`) for IDs, codes, or technical terms
- Always structure responses with clear sections and readable formatting

**Example of well-formatted response:**
## Resumen de Participantes

Tienes un total de **${context?.applicants?.length || 0} aplicantes** en tus ofertas.

### Por Oferta:
- **Oferta 1:** X aplicantes
- **Oferta 2:** Y aplicantes

### Estado:
- Aprobados: **X**
- Pendientes: **Y**
- Rechazados: **Z**

Current context:
${context?.enterpriseName ? `Enterprise name: ${context.enterpriseName}` : ''}
${context?.companyId ? `Company ID: ${context.companyId}` : ''}
${context?.currentPage ? `User is on: ${context.currentPage}` : ''}
${context?.workOffersCount !== undefined ? `User has ${context.workOffersCount} work offer(s)` : ''}
${context?.hasProfile ? 'User has completed their profile' : ''}
${context?.isCreatingOffer ? `User is currently creating a work offer. Draft: ${JSON.stringify(context.workOfferDraft || {})}` : ''}
${workOffersSummary}

**IMPORTANT:**
- When asked about work offers, participants, applicants, or statistics, use the work offers and applicants data provided above
- You can analyze specific offers by their name or ID
- You can provide statistics about applicants per offer
- You can discuss match scores, skills, experience, and applicant status
- Always provide accurate numbers and insights based on the data provided
- Use the data to give specific, helpful answers
- **Format statistics clearly with markdown** - use headings, lists, and bold numbers
- When showing multiple statistics, organize them with headings and bullet points

When helping with work offer creation:
- If user provides partial information, ask for the missing fields one by one or all at once
- Required fields: name (job title), rol (position type), salary (number), description, availability (remote/hybrid/on site), location
- Be conversational and friendly when asking for information
- Once all information is collected, confirm the details before creating
- Format confirmation messages nicely with markdown (use **bold** for field names, lists for details)

Always address the user by their enterprise name when provided. Be helpful and guide users to the right features. Make responses visually appealing and easy to read using markdown formatting.`;

    const userContent = question;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      '¡Estoy aquí para ayudarte! Puedes preguntarme cualquier cosa sobre cómo usar Worky AI.';

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error('AI assistant error:', error);
    return NextResponse.json(
      { answer: 'Encontré un error, ¡pero sigo aquí para ayudarte! Puedes preguntarme sobre:\n\n- Cómo crear ofertas de trabajo\n- Cómo ver y gestionar aplicantes\n- Cómo usar las funciones de IA\n- Consejos de navegación\n\n¿Qué te gustaría saber?' },
      { status: 200 },
    );
  }
}

