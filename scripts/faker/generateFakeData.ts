enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

function getRandomCoordinates(centerLat: any, centerLng: any, radiusKm: any) {
  // Radius of the Earth in kilometers
  const R = 6371;

  // Random distance and angle
  // const d = radiusKm * Math.random();
  const d = 25;
  
  const theta = Math.random() * 2 * Math.PI;

  // Latitude and longitude in radians
  const lat1 = centerLat * (Math.PI / 180);
  const lng1 = centerLng * (Math.PI / 180);

  // Offset latitude and longitude
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) +
    Math.cos(lat1) * Math.sin(d / R) * Math.cos(theta));
  const lng2 = lng1 + Math.atan2(Math.sin(theta) * Math.sin(d / R) * Math.cos(lat1),
    Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

  // Convert radians back to degrees
  return {
    latitude: lat2 * (180 / Math.PI),
    longitude: lng2 * (180 / Math.PI)
  };
}

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Coordinates of Bengaluru, India
const BENGALURU_LAT = 12.9716;
const BENGALURU_LNG = 77.5946;

async function main() {
  for (let i = 0; i < 100000; i++) {
    try {
      // Step 1: Create a User
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          dateOfBirth: faker.date.past({ years: 30 }).toISOString(),
          gender: faker.helpers.arrayElement(Object.values(Gender)),
          bio: faker.lorem.sentence(),
          profilePicture: faker.image.avatar(),
          profileCompleted: faker.datatype.boolean(),
        }
      });

      console.log(`Created user with ID: ${user.id}`);

      // Generate random coordinates within 10 km radius of Bengaluru
      const locationData = getRandomCoordinates(BENGALURU_LAT, BENGALURU_LNG, 10);

      const location = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        localAddress: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
      };

      try {
        // Step 2: Insert or Update Location using raw SQL
        const locationResult = await prisma.$executeRaw`
          INSERT INTO "Location" (
            id, latitude, longitude, coordinates, "localAddress", city, state, country, "userId", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(),
            ${location.latitude},
            ${location.longitude},
            ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326),
            ${location.localAddress},
            ${location.city},
            ${location.state},
            ${location.country},
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

        console.log(`Created or updated location with ID: ${locationResult}`);
      } catch (locationError) {
        console.error(`Error creating or updating location for user with ID: ${user.id}`);
        console.error(locationError);
      }

    } catch (userError) {
      console.error('Error creating user:');
      console.error(userError);
    }
  }
}

main()
  .catch(e => {
    console.error('Unexpected error in main function:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
