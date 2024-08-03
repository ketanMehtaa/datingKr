// src/app/api/upload-photos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../prisma'; // Adjust the import path as necessary
import { auth } from '../auth/[...nextauth]/auth';

// export async function POST(request: Request) {
//   try {
//     const { userId, photos } = await request.json(); // `photos` is an array of { url, isPrivate }

//     // Save the photo metadata to the database
//     const newPhotos = await prisma.userPhoto.createMany({
//       data: photos.map(photo => ({
//         userId,
//         url: photo.url,
//         isPrivate: photo.isPrivate,
//       })),
//     });

//     return NextResponse.json(newPhotos);
//   } catch (error) {
//     console.error('Error saving photo metadata:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// app/api/S3upload/route.ts or pages/api/S3upload.ts (depending on your setup)
export async function POST(request: Request) {
  try {

    const session = await auth();

    if (!session || !session.user?.email) {
      return new NextResponse('Unauthenticated session not found', { status: 401 });
    }
    const userId = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: { id: true }
    })

    const { photos } = await request.json() as { photos: PhotoData[] };

    // Validate the request body



    if (!userId?.id || !photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    

    // Save metadata to the database
    const savedPhotos = await prisma.userPhoto.createMany({
      data: photos.map((photo: PhotoData) => ({
        userId: userId.id,
        url: photo.url,
        isPrivate: photo.isPrivate,
      })),
    });
  
    return NextResponse.json(savedPhotos, { status: 200 });
  } catch (error) {
    console.error('Error saving photo metadata:', error);
    return NextResponse.json({ error: 'Failed to save photo metadata' }, { status: 500 });
  }
}
interface PhotoData {
  url: string;
  isPrivate: boolean;
}
