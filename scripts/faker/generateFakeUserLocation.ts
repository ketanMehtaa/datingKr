const { faker } = require('@faker-js/faker');

// Define the interfaces for User and Location
interface Location {
  latitude: string;
  longitude: string;
  localAddress?: string;
  city: string;
  state: string;
  country: string;
}

interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female';
  bio?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  profileCompleted: boolean;
  location?: Location;
}

// Function to generate fake location data
const generateLocation = (): Location => ({
  latitude: faker.address.latitude(),
  longitude: faker.address.longitude(),
  localAddress: faker.address.streetAddress(),
  city: faker.address.city(),
  state: faker.address.state(),
  country: faker.address.country(),
});

// Function to generate fake user data
const generateUser = (): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  dateOfBirth: faker.date.birthdate({ min: 18, max: 90 }),
  gender: faker.helpers.arrayElement(['Male', 'Female']),
  bio: faker.lorem.paragraph(),
  profilePicture: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  profileCompleted: faker.datatype.boolean(),
  location: generateLocation(),
});

// Generate a list of fake users
const generateUsers = (numUsers: number): User[] => {
  return Array.from({ length: numUsers }, () => generateUser());
};

// Example usage
const users = generateUsers(5);
console.log(users);
