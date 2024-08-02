enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 1000; i++) {
    try {
      // Step 1: Create a User
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          dateOfBirth: faker.date.past({ years: 30 }).toISOString(), // Updated syntax
          gender: faker.helpers.arrayElement(Object.values(Gender)),
          bio: faker.lorem.sentence(),
          profilePicture: faker.image.avatar(),
          profileCompleted: faker.datatype.boolean(),
        }
      });

      console.log(`Created user with ID: ${user.id}`);
      
      const locationData = {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        localAddress: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
      };

      try {
        // Step 2: Insert or Update Location using raw SQL
        const location = await prisma.$executeRaw`
          INSERT INTO "Location" (
            id, latitude, longitude, coordinates, "localAddress", city, state, country, "userId", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(),
            ${locationData.latitude},
            ${locationData.longitude},
            ST_SetSRID(ST_MakePoint(${locationData.longitude}, ${locationData.latitude}), 4326),
            ${locationData.localAddress},
            ${locationData.city},
            ${locationData.state},
            ${locationData.country},
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

        console.log(`Created or updated location with ID: ${location}`);
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
