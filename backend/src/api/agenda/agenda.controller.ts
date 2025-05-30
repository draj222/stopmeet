import { Request, Response } from 'express';
import OpenAI from 'openai';
import { prisma } from '../../index';

// Initialize OpenAI client with demo mode support
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Generate a meeting agenda using OpenAI
 */
export const generateAgenda = async (req: Request, res: Response) => {
  const { meetingId, title, duration, attendees, context } = req.body;
  const userId = req.user.id;
  
  if (!title) {
    return res.status(400).json({ error: 'Meeting title is required' });
  }
  
  try {
    // Construct prompt for OpenAI
    let prompt = `Generate a professional and structured agenda for a ${duration || 30}-minute meeting titled "${title}".`;
    
    if (attendees && attendees.length > 0) {
      prompt += ` The meeting will include ${attendees.length} participants: ${attendees.join(', ')}.`;
    }
    
    if (context) {
      prompt += ` Additional context: ${context}`;
    }
    
    prompt += `\n\nProvide a clear agenda with time allocations for each item. Include an introduction, main discussion points, and time for next steps or action items at the end. Format the agenda as a numbered list with time allocations in parentheses. For example:

1. Introduction and meeting goals (5 min)
2. [Topic] (10 min)
3. [Another topic] (10 min)
4. Next steps and action items (5 min)

Please generate an agenda that is appropriate for this specific meeting:`;
    
    // Call OpenAI API using v4 syntax
    let generatedAgenda;
    
    if (openai) {
      const response = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      generatedAgenda = response.choices[0]?.text?.trim() || 'Failed to generate agenda.';
    } else {
      // Demo mode - return mock agenda
      console.log('🎭 DEMO MODE: Using mock agenda data');
      generatedAgenda = `1. Welcome & Introductions (5 min)
   - Brief check-in from all participants
   - Review meeting objectives

2. ${title} - Main Discussion (${Math.floor((duration || 30) * 0.6)} min)
   - Status updates and progress review
   - Key challenges and blockers
   - Solutions and next steps

3. Action Items & Next Steps (${Math.floor((duration || 30) * 0.2)} min)
   - Assign ownership and deadlines
   - Review timeline and milestones

4. Wrap-up & Next Meeting (5 min)
   - Confirm action items
   - Schedule follow-up if needed`;
    }
    
    // If we have a meeting ID, update the meeting's description
    if (meetingId) {
      // Fix Prisma query by using findFirst and update separately
      const meeting = await prisma.meeting.findFirst({
        where: {
          id: meetingId,
          organizerId: userId
        }
      });

      if (meeting) {
        await prisma.meeting.update({
          where: {
            id: meetingId
          },
          data: {
            description: generatedAgenda,
            hasAgenda: true
          }
        });
      }
    }
    
    res.status(200).json({ agenda: generatedAgenda });
  } catch (error) {
    console.error('Agenda generation error:', error);
    res.status(500).json({ error: 'Failed to generate agenda' });
  }
};

/**
 * Save an agenda for a meeting
 */
export const saveAgenda = async (req: Request, res: Response) => {
  const { meetingId, agenda } = req.body;
  const userId = req.user.id;
  
  if (!meetingId || !agenda) {
    return res.status(400).json({ error: 'Meeting ID and agenda are required' });
  }
  
  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        organizerId: userId
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        description: agenda,
        hasAgenda: true
      }
    });
    
    res.status(200).json({ meeting: updatedMeeting });
  } catch (error) {
    console.error('Save agenda error:', error);
    res.status(500).json({ error: 'Failed to save agenda' });
  }
};
