import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Find or create demo user
  let demoUser = await prisma.user.findFirst({
    where: { email: 'demo@stopmeet.com' }
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@stopmeet.com',
        name: 'Demo User',
        averageHourlyCost: 75
      }
    });
  }

  // Clear existing demo data
  await prisma.meetingFlag.deleteMany({ where: { userId: demoUser.id } });
  await prisma.attendee.deleteMany({ where: { meeting: { organizerId: demoUser.id } } });
  await prisma.meeting.deleteMany({ where: { organizerId: demoUser.id } });
  await prisma.weeklyStat.deleteMany({ where: { userId: demoUser.id } });

  // Create realistic meetings for the past 30 days
  const now = new Date();
  const meetings = [];

  // Generate meetings for the past 4 weeks
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (week * 7));

    // Monday meetings
    const monday = new Date(weekStart);
    monday.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    meetings.push(
      // Weekly standup - efficient
      {
        title: 'Weekly Team Standup',
        description: 'Quick sync on weekly progress and blockers',
        startTime: new Date(monday.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endTime: new Date(monday.getTime() + 9.5 * 60 * 60 * 1000), // 9:30 AM
        hasAgenda: true,
        attendeeCount: 6,
        estimatedCost: 225, // 6 people * 0.5 hours * $75
        status: 'completed'
      },
      // Product planning - too long, too many people
      {
        title: 'Q1 Product Planning Session',
        description: 'Planning session for Q1 product roadmap',
        startTime: new Date(monday.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endTime: new Date(monday.getTime() + 16 * 60 * 60 * 1000), // 4 PM
        hasAgenda: false,
        attendeeCount: 15,
        estimatedCost: 2250, // 15 people * 2 hours * $75
        status: 'completed'
      }
    );

    // Tuesday meetings
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);
    
    meetings.push(
      // 1:1 - good meeting
      {
        title: '1:1 with Sarah (Engineering)',
        description: 'Weekly 1:1 check-in',
        startTime: new Date(tuesday.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        endTime: new Date(tuesday.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
        hasAgenda: true,
        attendeeCount: 2,
        estimatedCost: 75, // 2 people * 0.5 hours * $75
        status: 'completed'
      },
      // Design review - back to back issue
      {
        title: 'Design Review - Mobile App',
        description: 'Review new mobile app designs',
        startTime: new Date(tuesday.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
        endTime: new Date(tuesday.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
        hasAgenda: false,
        attendeeCount: 8,
        estimatedCost: 600, // 8 people * 1 hour * $75
        status: 'completed'
      }
    );

    // Wednesday meetings
    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);
    
    meetings.push(
      // All hands - necessary but large
      {
        title: 'All Hands Meeting',
        description: 'Monthly company update',
        startTime: new Date(wednesday.getTime() + 15 * 60 * 60 * 1000), // 3 PM
        endTime: new Date(wednesday.getTime() + 16 * 60 * 60 * 1000), // 4 PM
        hasAgenda: true,
        attendeeCount: 45,
        estimatedCost: 3375, // 45 people * 1 hour * $75
        status: 'completed'
      }
    );

    // Thursday meetings
    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    
    meetings.push(
      // Sprint planning - long but necessary
      {
        title: 'Sprint Planning',
        description: 'Planning for next 2-week sprint',
        startTime: new Date(thursday.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endTime: new Date(thursday.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        hasAgenda: true,
        attendeeCount: 8,
        estimatedCost: 1200, // 8 people * 2 hours * $75
        status: 'completed'
      },
      // Duplicate meeting - should be flagged
      {
        title: 'Sprint Planning Follow-up',
        description: 'Additional planning discussion',
        startTime: new Date(thursday.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endTime: new Date(thursday.getTime() + 15 * 60 * 60 * 1000), // 3 PM
        hasAgenda: false,
        attendeeCount: 8,
        estimatedCost: 600, // 8 people * 1 hour * $75
        status: 'completed'
      }
    );

    // Friday meetings
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    meetings.push(
      // Demo - good meeting
      {
        title: 'Sprint Demo',
        description: 'Demo of completed work',
        startTime: new Date(friday.getTime() + 16 * 60 * 60 * 1000), // 4 PM
        endTime: new Date(friday.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        hasAgenda: true,
        attendeeCount: 12,
        estimatedCost: 900, // 12 people * 1 hour * $75
        status: 'completed'
      }
    );
  }

  // Create meetings in database
  const createdMeetings = [];
  for (const meetingData of meetings) {
    const meeting = await prisma.meeting.create({
      data: {
        ...meetingData,
        organizerId: demoUser.id,
        externalId: `demo-${Math.random().toString(36).substr(2, 9)}`
      }
    });
    createdMeetings.push(meeting);

    // Add attendees
    const attendeeEmails = [
      'sarah@company.com',
      'mike@company.com', 
      'jessica@company.com',
      'david@company.com',
      'lisa@company.com',
      'tom@company.com',
      'anna@company.com',
      'chris@company.com'
    ];

    for (let i = 0; i < Math.min(meetingData.attendeeCount, attendeeEmails.length); i++) {
      await prisma.attendee.create({
        data: {
          meetingId: meeting.id,
          email: attendeeEmails[i],
          name: attendeeEmails[i].split('@')[0],
          status: 'attended',
          estimatedHourlyCost: 75
        }
      });
    }
  }

  // Create flags for problematic meetings
  const flaggedMeetings = createdMeetings.filter(m => 
    !m.hasAgenda || 
    (m.attendeeCount && m.attendeeCount > 10) || 
    m.title.includes('Follow-up') ||
    (m.endTime.getTime() - m.startTime.getTime()) > 2 * 60 * 60 * 1000 // > 2 hours
  );

  for (const meeting of flaggedMeetings) {
    let issueType = 'NO_AGENDA';
    let description = 'Meeting lacks a clear agenda';
    let severity = 'MEDIUM';

    if (meeting.attendeeCount && meeting.attendeeCount > 15) {
      issueType = 'TOO_MANY_ATTENDEES';
      description = `${meeting.attendeeCount} attendees - consider if all are necessary`;
      severity = 'HIGH';
    } else if (meeting.title.includes('Follow-up')) {
      issueType = 'REDUNDANT_MEETING';
      description = 'Potential duplicate of existing meeting';
      severity = 'HIGH';
    } else if ((meeting.endTime.getTime() - meeting.startTime.getTime()) > 2 * 60 * 60 * 1000) {
      issueType = 'LONG_MEETING';
      description = 'Meeting longer than 2 hours - consider breaking up';
      severity = 'MEDIUM';
    }

    await prisma.meetingFlag.create({
      data: {
        meetingId: meeting.id,
        userId: demoUser.id,
        issueType,
        description,
        severity,
        autoDetected: true
      }
    });
  }

  // Create weekly stats
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (week * 7));
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week

    const weekMeetings = createdMeetings.filter(m => {
      const meetingWeekStart = new Date(m.startTime);
      meetingWeekStart.setDate(meetingWeekStart.getDate() - meetingWeekStart.getDay());
      return meetingWeekStart.getTime() === weekStart.getTime();
    });

    const totalHours = weekMeetings.reduce((sum, m) => {
      return sum + (m.endTime.getTime() - m.startTime.getTime()) / (1000 * 60 * 60);
    }, 0);

    const flaggedCount = weekMeetings.filter(m => 
      flaggedMeetings.some(fm => fm.id === m.id)
    ).length;

    // Simulate hours saved from optimization
    const hoursSaved = flaggedCount * 0.5 + Math.random() * 2;

    await prisma.weeklyStat.create({
      data: {
        userId: demoUser.id,
        weekStart,
        totalMeetingHours: totalHours,
        hoursSaved,
        meetingsFlagged: flaggedCount,
        meetingsCancelled: Math.floor(flaggedCount * 0.3),
        focusTimeCreated: hoursSaved * 1.5
      }
    });
  }

  console.log(`✅ Created ${createdMeetings.length} demo meetings`);
  console.log(`🚩 Flagged ${flaggedMeetings.length} problematic meetings`);
  console.log(`📊 Generated 4 weeks of stats`);
  console.log('🎯 Demo data ready for pitch!');
}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 