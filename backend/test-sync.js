const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSync() {
  try {
    console.log('🔍 Testing calendar sync...');
    
    // Get user with Google tokens
    const user = await prisma.user.findFirst({
      where: {
        email: 'tsaidheeraj@gmail.com',
        googleTokens: {
          not: null
        }
      }
    });
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('✅ User ID:', user.id);
    console.log('✅ Has Google tokens:', !!user.googleTokens);
    
    // Check meetings in database
    const meetings = await prisma.meeting.findMany({
      where: {
        organizerId: user.id
      },
      include: {
        attendees: true
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    
    console.log(`\n📊 Found ${meetings.length} meetings in database:`);
    
    if (meetings.length > 0) {
      meetings.slice(0, 5).forEach((meeting, index) => {
        console.log(`\n${index + 1}. ${meeting.title}`);
        console.log(`   📅 ${meeting.startTime.toLocaleDateString()} ${meeting.startTime.toLocaleTimeString()}`);
        console.log(`   👥 ${meeting.attendees.length} attendees`);
        console.log(`   🔗 External ID: ${meeting.externalId}`);
        console.log(`   📍 Location: ${meeting.location || 'None'}`);
      });
    } else {
      console.log('❌ No meetings found in database');
      console.log('   This suggests calendar sync is not working properly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSync(); 