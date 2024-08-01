import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    // Check for user authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return new NextResponse('Unauthenticated session not found', { status: 401 });
    // }

    // Extract query parameters from the request URL
    // const url = new URL(req.url);
    // const latitude = url.searchParams.get('latitude');
    // const longitude = url.searchParams.get('longitude');
    const dataxxx = await req.json();
    console.log('Data received:', dataxxx);

    // Extract latitude and longitude
    const { latitude, longitude } = dataxxx;

    console.log('Data received:', dataxxx);

    if (!dataxxx.latitude || !dataxxx.longitude) {
      return new NextResponse('Latitude and longitude are required', { status: 400 });
    }

    // Fetch data from Ola Maps API
    const response = await fetch(`${process.env.OLA_URL}?latlng=${latitude},${longitude}&api_key=${process.env.OLA_API_KEY}`, {
      method: 'GET',
      headers: {
        'X-Request-Id': "ddddwwwwqs"
      },
    });
    const data = await response.json();

    // Check for response status
    if (!response.ok) {
      return new NextResponse('Failed to fetch data from Ola Maps API', { status: response.status });
    }

    // Parse and return the JSON response
    // const data = await response.json();
    return new NextResponse(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    
  } catch (error:any) {
    console.error('Error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Implement POST method if needed
}
