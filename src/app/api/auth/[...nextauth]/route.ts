import nextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { prisma } from '/prisma/schema.prisma';

import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text', value: 'admin@gmail.com' },
        password: { label: 'Password', type: 'password', value: 'admin' },
      },
      async authorize(credentials, req) {
        // await ensureDbConnected()
        if (!credentials) {
          return null;
        }
        const email = credentials.email;
        const password = credentials.password;
        // Add logic here to look up the user from the credentials supplied
        // const admin = await Admin.findOne({ email });
        const admin = await prisma.admin.findUnique({
          where: {
            email: email, // Assuming 'body' contains the incoming request's data
          },
        });

        if (!admin) {
          const admin = await prisma.admin.create({
            data: {
              email: email,
              password: password,
            },
          });
          console.log('newAdmin', admin);
          return {
            id: admin.id, // Replace 'id' with the actual ID field from your admin object
            email: admin.email, // Replace 'email' with the field containing the email
            name: admin.name,
            image: admin.image,
          };

          // const obj = { email: email, password: password };
          // const newAdmin = new Admin(obj);
          // let adminDb = await newAdmin.save();
          // console.log(adminDb);
          // return {
          //   id: adminDb._id,
          //   email: adminDb.email,
          // };
        } else {
          //TODO:: Make this safer, encrypt passwords
          // if (admin.password !== password) {
          //   return null;
          // }
          if (admin && admin.password !== password) {
            return null;
          }
          // User is authenticated
          // return {
          //   id: admin._id,
          //   email: admin.email,
          // };
          console.log('admin ', admin);
          return {
            id: admin.id, // Replace 'id' with the actual ID field from your admin object
            email: admin.email, // Replace 'email' with the field containing the email
            name: admin.name,
            image: admin.image,
          };
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // encryption: true,
  },
  callbacks: {
    async signIn({ user: admin, account, profile, email, credentials }) {
      console.log('callback admin signin', { admin, account, profile, email, credentials });
      if (!admin.email) {
        return false;
      }
      if (account?.provider === 'google') {
        const adminExists = await prisma.admin.findUnique({
          where: { email: admin.email },
          select: { name: true },
        });
        // if the admin already exists via email,
        // update the admin with their name and image from Google
        if (adminExists && !adminExists.name) {
          await prisma.admin.update({
            where: { email: admin?.email },
            data: {
              name: profile?.name,
              // @ts-ignore - this is a bug in the types, `picture` is a valid on the `Profile` type
              image: profile?.picture,
            },
          });
        } else if (!adminExists) {
          await prisma.admin.create({
            data: {
              image: profile?.picture,
              name: profile?.name,
              email: admin.email,
            },
          });
        }
        return true;
      } else if (account?.provider === 'credentials') {
        return true;
      } else return false;
      // check error above if facing problem in sign in
    },
    // async redirect({ url, baseUrl }) {
    //   return baseUrl;
    // },
    async session({ session, token }) {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
        // select: { id: true, name: true },
      });
      session.user.id = admin.id;
      // session.admin.name = admin?.name;

      return session;
    },
    // async jwt({ token, admin, account, profile, isNewUser }) {
    //   return token;
    // },
  },
  cookies: {
    sessionToken:{
      name: `Admin-Session-Token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },

};

const handler = nextAuth(authOptions);

export { handler as GET, handler as POST };