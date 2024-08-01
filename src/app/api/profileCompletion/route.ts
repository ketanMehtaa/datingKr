// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { auth } from '../auth/[...nextauth]/auth';
import { prisma } from '../../../../prisma/index';

export async function PUT(req: Request) {
  //   try {
  //     // Check for user authentication
  //     const session = await getServerSession(authOptions);
  //     if (!session) {
  //       return new NextResponse('Unauthenticated session not found', { status: 401 });
  //     }
  //     const dataxxx = await req.json();
  //   } catch (error:any) {
  //     console.error('Error:', error);
  //     return new NextResponse(`Error: ${error.message}`, { status: 500 });
  //   }
}

// export async function POST(req: Request) {
//   try {
//     // Check for user authentication
//     const session = await auth();
//     if (!session) {
//       return new NextResponse('Unauthenticated session not found', { status: 401 });
//     }

//     const data = await req.json();
//     console.log('data',data);
//   } catch (error: any) {
//     console.error('Error:', error);
//     return new NextResponse(`Error: ${error.message}`, { status: 500 });
//   }
// }
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
  
      // Update the user record
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: dateOfBirth,
          gender: data.gender,
          bio: data.bio,
          profileCompleted: true, // Assuming this completes the profile
          location: {
            create: {
              latitude: parseFloat(data.latitude) || 0,
              longitude: parseFloat(data.longitude) || 0,
              localAddress: data.localAddress,
              city: data.city,
              state: data.state,
              country: data.country,
            },
          },
        },
      });
  
      return new NextResponse(JSON.stringify(updatedUser), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error: any) {
      console.error('Error:', error);
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    } finally {
    //   await prisma.$disconnect();
    }
  }
export async function GET(req: Request) {
  // Implement POST method if needed
}
