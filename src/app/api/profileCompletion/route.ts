import { NextResponse } from 'next/server';
import { auth } from '../auth/[...nextauth]/auth';
import { prisma } from '../../../../prisma/index';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return new NextResponse('Unauthenticated session not found', { status: 401 });
    }

    const data = await req.json();
    console.log('data', data);

    const dateOfBirth = new Date(data.dateOfBirth);

    // Generate presigned URLs for image uploads
    const imageUploadUrls = await Promise.all(
      data.images.map((image: { filename: string; contentType: string }) =>
        getPresignedPostUrl(image.filename, image.contentType)
      )
    );

    const updatedUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: dateOfBirth,
          gender: data.gender,
          bio: data.bio,
          profileCompleted: true,
        },
      });

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

      // Create UserPhoto entries
      const userPhotos = await prisma.userPhoto.createMany({
        data: imageUploadUrls.map((url, index) => ({
          userId: user.id,
          url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(url.fields.key)}`,
          isPrivate: false,
        })),
      });

      return { ...user, location: location[0], photos: userPhotos };
    });

    return new NextResponse(JSON.stringify({ ...updatedUser, imageUploadUrls }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}

async function getPresignedPostUrl(filename: string, contentType: string) {
  const client = new S3Client({ region: process.env.AWS_REGION });

  // Sanitize the filename
  const sanitizedFilename = sanitizeFilename(filename);

  const { url, fields } = await createPresignedPost(client, {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}-${sanitizedFilename}`,
    Conditions: [
      ['content-length-range', 0, 10485760], // up to 10 MB
      ['starts-with', '$Content-Type', contentType],
    ],
    Fields: {
      acl: 'public-read',
      'Content-Type': contentType,
    },
    Expires: 600, // 10 minutes
  });

  return { url, fields };
}
function sanitizeFilename(filename: string): string {
  // Replace spaces with underscores and remove any non-alphanumeric characters except for dots and underscores
  return filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
}
