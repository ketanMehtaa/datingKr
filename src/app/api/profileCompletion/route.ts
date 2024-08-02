import { NextResponse } from 'next/server';
import { auth } from '../auth/[...nextauth]/auth';
import { prisma } from '../../../../prisma/index';

export async function POST(req: Request) {
  try {
    // Check for user authentication
    const session = await auth();
    if (!session || !session.user?.email) {
      return new NextResponse('Unauthenticated session not found', { status: 401 });
    }

    const data = await req.json();
    console.log('data', data);

    // Parse the date string to a Date object
    const dateOfBirth = new Date(data.dateOfBirth);

    // Update the user record and create/update location
    const updatedUser = await prisma.$transaction(async (prisma) => {
      // Update user
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: dateOfBirth,
          gender: data.gender,
          bio: data.bio,
          profileCompleted: true, // Assuming this completes the profile
        },
      });

      // Create or update location
      const location = await prisma.$executeRaw`
        INSERT INTO "Location" (
          id, latitude, longitude, coordinates, "localAddress", city, state, country, "userId", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${parseFloat(data.latitude)},
          ${parseFloat(data.longitude)},
          ST_SetSRID(ST_MakePoint(${parseFloat(data.longitude)}, ${parseFloat(data.latitude)}), 4326),
          ${data.localAddress},
          ${data.city},
          ${data.state},
          ${data.country},
          ${user.id},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT ("userId")
        DO UPDATE SET
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          coordinates = EXCLUDED.coordinates,
          "localAddress" = EXCLUDED."localAddress",
          city = EXCLUDED.city, 
          state = EXCLUDED.state,
          country = EXCLUDED.country,
          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING id, latitude, longitude, "localAddress", city, state, country, "updatedAt"
      `;

      return { ...user, location: location[0] };
    });

    return new NextResponse(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Implement GET method if needed
}

export async function PUT(req: Request) {
  // Implement PUT method if needed
}