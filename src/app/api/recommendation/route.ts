// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { auth } from '../auth/[...nextauth]/auth';
import { prisma } from '../../../../prisma/index';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return new NextResponse('Unauthenticated session not found', { status: 401 });
    }

    const userLocation = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        location: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!userLocation?.location) {
      return new NextResponse('User location not found', { status: 404 });
    }

    const nearbyUsers = await prisma.$queryRaw`
    WITH UserDistances AS (
      SELECT 
        u.id, 
        u."firstName",
        u."lastName",
        u."profilePicture",
        l.city,
        l.state,
        l.country,
        ST_Distance(
          l.coordinates::geography,
          ST_SetSRID(ST_MakePoint(${userLocation.location.longitude}, ${userLocation.location.latitude}), 4326)::geography
        ) as distance
      FROM "User" u
      JOIN "Location" l ON u.id = l."userId"
      WHERE u.email != ${session.user.email}
        AND ST_DWithin(
          l.coordinates::geography,
          ST_SetSRID(ST_MakePoint(${userLocation.location.longitude}, ${userLocation.location.latitude}), 4326)::geography,
          50000  -- 50km radius
        )
    )
    SELECT * FROM UserDistances
    ORDER BY RANDOM()  -- Randomize the order of results
    LIMIT 10;
  `;
  
    return new NextResponse(JSON.stringify(nearbyUsers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}