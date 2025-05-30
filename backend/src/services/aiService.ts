import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI | null;
  private isDemoMode: boolean;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.isDemoMode = !apiKey;
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.openai = null;
      console.log('🎭 Running in DEMO MODE - AI features will return mock data');
    }
  }

  async generateAgenda(params: {
    title: string;
    description: string;
    duration: number;
    attendeeCount: number;
    isRecurring: boolean;
  }) {
    if (this.isDemoMode) {
      return {
        items: [
          { title: "Welcome & Introductions", duration: 5, type: "discussion" },
          { title: "Review Previous Action Items", duration: 10, type: "review" },
          { title: `${params.title} - Main Discussion`, duration: Math.max(params.duration - 25, 15), type: "discussion" },
          { title: "Next Steps & Action Items", duration: 8, type: "planning" },
          { title: "Wrap-up", duration: 2, type: "closing" }
        ],
        objectives: [
          `Align team on ${params.title.toLowerCase()} priorities`,
          "Identify key action items and owners",
          "Ensure clear next steps"
        ],
        preparationNotes: `Please review previous meeting notes and come prepared to discuss ${params.title.toLowerCase()}.`
      };
    }

    try {
      const prompt = `Generate a structured agenda for a meeting with the following details:
Title: ${params.title}
Description: ${params.description}
Duration: ${params.duration} minutes
Number of attendees: ${params.attendeeCount}
Is recurring: ${params.isRecurring}

Please provide:
1. A list of agenda items with estimated time allocations
2. Clear objectives for the meeting
3. Any preparation notes for attendees

Format the response as JSON with the following structure:
{
  "items": [{"title": "Item name", "duration": minutes, "type": "discussion|presentation|decision|review"}],
  "objectives": ["objective 1", "objective 2"],
  "preparationNotes": "Notes for attendees"
}

Make sure the total duration of agenda items doesn't exceed ${params.duration} minutes, leaving 5-10 minutes buffer for informal discussion.`;

      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert meeting facilitator. Generate practical, time-efficient agendas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      if (!response?.choices[0]?.message?.content) {
        throw new Error('No response from AI service');
      }

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating agenda:', error);
      // Fallback to demo data
      return {
        items: [
          { title: "Welcome & Introductions", duration: 5, type: "discussion" },
          { title: "Review Previous Action Items", duration: 10, type: "review" },
          { title: `${params.title} - Main Discussion`, duration: Math.max(params.duration - 25, 15), type: "discussion" },
          { title: "Next Steps & Action Items", duration: 8, type: "planning" },
          { title: "Wrap-up", duration: 2, type: "closing" }
        ],
        objectives: [
          `Align team on ${params.title.toLowerCase()} priorities`,
          "Identify key action items and owners",
          "Ensure clear next steps"
        ],
        preparationNotes: `Please review previous meeting notes and come prepared to discuss ${params.title.toLowerCase()}.`
      };
    }
  }

  async analyzeMeetingTranscript(transcript: string, meetingTitle: string) {
    if (this.isDemoMode) {
      return {
        summary: `Demo analysis of ${meetingTitle}: This was a productive meeting with good engagement from all participants. Key topics were discussed and several action items were identified.`,
        actionItems: [
          { task: "Follow up on project timeline", assignee: "Team Lead", priority: "high", dueDate: "2024-01-15" },
          { task: "Review budget allocation", assignee: "Finance Team", priority: "medium", dueDate: "2024-01-20" },
          { task: "Update stakeholders", assignee: "Project Manager", priority: "low", dueDate: "2024-01-25" }
        ],
        keyDecisions: [
          "Approved budget increase for Q1",
          "Decided to move deadline to end of month",
          "Agreed on weekly check-ins"
        ],
        nextSteps: [
          "Schedule follow-up meeting for next week",
          "Distribute meeting notes to all attendees",
          "Begin implementation of discussed changes"
        ],
        sentiment: "positive",
        topics: ["Budget Planning", "Timeline Management", "Team Coordination", "Stakeholder Communication"],
        effectivenessScore: 8.5
      };
    }

    try {
      const prompt = `Analyze this meeting transcript and provide insights:

Meeting: ${meetingTitle}
Transcript: ${transcript}

Please provide a JSON response with:
{
  "summary": "Brief summary of the meeting",
  "actionItems": [{"task": "description", "assignee": "person", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD"}],
  "keyDecisions": ["decision 1", "decision 2"],
  "nextSteps": ["step 1", "step 2"],
  "sentiment": "positive|neutral|negative",
  "topics": ["topic 1", "topic 2"],
  "effectivenessScore": number_between_1_and_10
}`;

      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert meeting analyst. Provide detailed, actionable insights from meeting transcripts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      if (!response?.choices[0]?.message?.content) {
        throw new Error('No response from AI service');
      }

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      // Fallback to demo data
      return {
        summary: `Analysis of ${meetingTitle}: This was a productive meeting with good engagement from all participants. Key topics were discussed and several action items were identified.`,
        actionItems: [
          { task: "Follow up on project timeline", assignee: "Team Lead", priority: "high", dueDate: "2024-01-15" },
          { task: "Review budget allocation", assignee: "Finance Team", priority: "medium", dueDate: "2024-01-20" }
        ],
        keyDecisions: ["Approved budget increase", "Decided to move deadline"],
        nextSteps: ["Schedule follow-up meeting", "Distribute meeting notes"],
        sentiment: "positive",
        topics: ["Budget Planning", "Timeline Management"],
        effectivenessScore: 8.0
      };
    }
  }

  async generateMeetingSummary(params: {
    title: string;
    duration: number;
    attendees: string[];
    notes?: string;
  }) {
    if (this.isDemoMode) {
      return {
        summary: `${params.title} meeting completed successfully with ${params.attendees.length} attendees over ${params.duration} minutes. Key discussions and decisions were made.`,
        actionItems: [
          { task: "Review meeting outcomes", assignee: params.attendees[0] || "Team Lead", priority: "medium" }
        ],
        decisions: ["Agreed on next steps", "Approved proposed changes"],
        nextSteps: ["Schedule follow-up", "Implement decisions"],
        sentiment: "positive"
      };
    }

    try {
      const prompt = `Generate a meeting summary based on:
Title: ${params.title}
Duration: ${params.duration} minutes
Attendees: ${params.attendees.join(', ')}
Notes: ${params.notes || 'No additional notes'}

Provide JSON response:
{
  "summary": "Brief meeting summary",
  "actionItems": [{"task": "description", "assignee": "person", "priority": "high|medium|low"}],
  "decisions": ["decision 1", "decision 2"],
  "nextSteps": ["step 1", "step 2"],
  "sentiment": "positive|neutral|negative"
}`;

      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      if (!response?.choices[0]?.message?.content) {
        throw new Error('No response from AI service');
      }

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        summary: `${params.title} meeting completed with ${params.attendees.length} attendees.`,
        actionItems: [],
        decisions: [],
        nextSteps: [],
        sentiment: "neutral"
      };
    }
  }

  async detectMeetingIssues(meetings: any[]) {
    try {
      const meetingData = meetings.map(m => ({
        id: m.id,
        title: m.title,
        duration: Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)),
        attendeeCount: m.attendees?.length || 0,
        hasAgenda: m.hasAgenda,
        isRecurring: m.isRecurring,
        dayOfWeek: new Date(m.startTime).getDay(),
        hour: new Date(m.startTime).getHours(),
      }));

      const prompt = `Analyze these meetings for potential efficiency issues:

${JSON.stringify(meetingData, null, 2)}

Identify issues and provide a JSON response:
{
  "issues": [
    {
      "type": "NO_AGENDA|REDUNDANT_MEETING|OVERBOOKED|TOO_MANY_ATTENDEES|BAD_TIMING",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "title": "Brief issue title",
      "description": "Detailed description",
      "affectedMeetings": ["meeting IDs"],
      "estimatedTimeSavings": number_in_hours,
      "suggestions": ["Specific actionable suggestions"]
    }
  ]
}`;

      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying meeting inefficiencies and providing actionable recommendations. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      if (!response?.choices[0]?.message?.content) {
        throw new Error('No response from AI service');
      }

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error detecting meeting issues:', error);
      throw error;
    }
  }

  async suggestAttendeeOptimization(meeting: any, teamMembers: any[]) {
    if (this.isDemoMode) {
      return {
        recommendations: [
          { type: "remove", attendee: "optional-attendee@company.com", reason: "Not essential for core discussion" },
          { type: "add", attendee: "key-stakeholder@company.com", reason: "Should be involved in decision making" }
        ],
        optimalSize: Math.max(3, Math.min(meeting.attendees?.length || 5, 7)),
        estimatedTimeSavings: 15
      };
    }

    try {
      const prompt = `Optimize attendee list for meeting: ${meeting.title}
Current attendees: ${meeting.attendees?.map((a: any) => a.email).join(', ') || 'None'}
Available team members: ${teamMembers.map(m => m.email).join(', ')}

Suggest optimizations in JSON:
{
  "recommendations": [{"type": "add|remove", "attendee": "email", "reason": "explanation"}],
  "optimalSize": number,
  "estimatedTimeSavings": minutes
}`;

      const response = await this.openai?.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      });

      if (!response?.choices[0]?.message?.content) {
        throw new Error('No response from AI service');
      }

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error optimizing attendees:', error);
      return {
        recommendations: [],
        optimalSize: meeting.attendees?.length || 5,
        estimatedTimeSavings: 0
      };
    }
  }
} 