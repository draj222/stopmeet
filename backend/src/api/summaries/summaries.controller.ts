import { Request, Response } from 'express';
import OpenAI from 'openai';
import { prisma } from '../../index';

// Initialize OpenAI client with demo mode support
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Generate a meeting summary from a transcript using OpenAI
 */
export const generateSummary = async (req: Request, res: Response) => {
  const { meetingId, transcript } = req.body;
  const userId = req.user.id;
  
  if (!meetingId || !transcript) {
    return res.status(400).json({ error: 'Meeting ID and transcript are required' });
  }
  
  try {
    // Find the meeting
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        organizerId: userId
      },
      include: {
        attendees: true
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Get attendee list for context
    const attendees = meeting.attendees.map(a => a.name || a.email).join(', ');
    
    // Create summarization prompt
    const summaryPrompt = `Summarize the key points from this meeting transcript. 
    Meeting title: "${meeting.title}"
    Attendees: ${attendees}
    
    Provide a concise summary (2-3 paragraphs) covering the main topics discussed and decisions made.
    
    Transcript:
    ${transcript.substring(0, 4000)}`;  // Limit to avoid token overflow
    
    // Create action items prompt
    const actionItemsPrompt = `Extract all action items and follow-up tasks from this meeting transcript.
    Meeting title: "${meeting.title}"
    Attendees: ${attendees}
    
    Format each action item as: "Person: Task (Due date if mentioned)"
    
    Transcript:
    ${transcript.substring(0, 4000)}`;  // Limit to avoid token overflow
    
    // Call OpenAI API for summary using v4 syntax
    let summarizedText, actionItemsText;
    
    if (openai) {
      const summaryResponse = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: summaryPrompt,
        max_tokens: 500,
        temperature: 0.5,
      });
      
      summarizedText = summaryResponse.choices[0]?.text?.trim() || 'Failed to generate summary.';
      
      // Call OpenAI API for action items using v4 syntax
      const actionItemsResponse = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: actionItemsPrompt,
        max_tokens: 500,
        temperature: 0.5,
      });
      
      actionItemsText = actionItemsResponse.choices[0]?.text?.trim() || 'No action items identified.';
    } else {
      // Demo mode - return mock data
      console.log('🎭 DEMO MODE: Using mock summary data');
      summarizedText = `**Meeting Summary:**

The team discussed the weekly project status and upcoming milestones. Key topics included:

• Project timeline review and current progress
• Resource allocation for next quarter 
• Risk mitigation strategies for identified blockers
• Action items and next steps for team members

Overall, the meeting was productive with clear outcomes and accountability established.`;

      actionItemsText = `• John: Complete API documentation review by Friday
• Sarah: Schedule follow-up meeting with stakeholders next week  
• Mike: Provide updated budget estimates by Wednesday
• Team: Submit weekly status reports by EOD Monday`;
    }
    
    // Parse action items into structured format
    const actionItems = parseActionItems(actionItemsText);
    
    // Save summary to database
    const summary = await prisma.summary.create({
      data: {
        meetingId,
        userId,
        summary: summarizedText,
        actionItems: JSON.stringify(actionItems)
      }
    });
    
    res.status(201).json({
      summary: {
        id: summary.id,
        meetingId,
        summary: summarizedText,
        actionItems
      }
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

/**
 * Get all summaries for a user
 */
export const getSummaries = async (req: Request, res: Response) => {
  const { meetingId } = req.query;
  const userId = req.user.id;
  
  try {
    const filters: any = { userId };
    
    if (meetingId) {
      filters.meetingId = meetingId as string;
    }
    
    const summaries = await prisma.summary.findMany({
      where: filters,
      include: {
        meeting: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({ summaries });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'Failed to get summaries' });
  }
};

/**
 * Get a summary by ID
 */
export const getSummaryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const summary = await prisma.summary.findFirst({
      where: {
        id,
        userId
      },
      include: {
        meeting: true
      }
    });
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }
    
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
};

/**
 * Parse action items from text into structured format
 */
function parseActionItems(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const actionItems = [];
  
  for (const line of lines) {
    // Look for patterns like "Person: Task (Due date)" or "Person - Task"
    const personMatch = line.match(/^[-•\*]?\s*([^:]+)[:|-]\s*(.+)$/);
    
    if (personMatch) {
      const person = personMatch[1].trim();
      let task = personMatch[2].trim();
      let dueDate = null;
      
      // Check for due date in parentheses
      const dueDateMatch = task.match(/(.*)\(([^)]+)\)$/);
      if (dueDateMatch) {
        task = dueDateMatch[1].trim();
        dueDate = dueDateMatch[2].trim();
      }
      
      actionItems.push({
        assignee: person,
        task,
        dueDate
      });
    } else if (line.length > 10) {
      // Fallback for lines that don't match the pattern but look like tasks
      actionItems.push({
        assignee: 'Unassigned',
        task: line,
        dueDate: null
      });
    }
  }
  
  return actionItems;
}
