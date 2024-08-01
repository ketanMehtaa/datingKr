import nextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '../../../../../prisma/index';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || '',
    }),
    // CredentialsProvider({
    //   id: 'credentials',
    //   name: 'Credentials',
    //   type: 'credentials',
    //   credentials: {
    //     email: { label: 'Email', type: 'text' },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials || !credentials.email || !credentials.password) {
    //       throw new Error('Invalid credentials');
    //     }

    //     try {
    //       const user = await prisma.user.findUnique({
    //         where: {
    //           email: credentials.email,
    //         },
    //       });

    //       if (!user) {
    //         // Create new user if not found
    //         const newUser = await prisma.user.create({
    //           data: {
    //             email: credentials.email,
    //             password: credentials.password,
    //             // Include default values for other required fields
    //           },
    //         });

    //         return {
    //           id: newUser.id,
    //           email: newUser.email,
    //           name: newUser.firstName || 'User',
    //           // image: newUser.profilePicture || '',
    //         };
    //       } else {
    //         // Check password (consider using a hashing method for production)
    //         if (user.password !== credentials.password) {
    //           throw new Error('Incorrect password');
    //         }

    //         return {
    //           id: user.id,
    //           email: user.email,
    //           name: user.firstName || 'User',
    //           // image: user.profilePicture || '',
    //         };
    //       }
    //     } catch (error) {
    //       console.error('Authorization error:', error);
    //       throw new Error('Authentication error');
    //     }
    //   },
    // }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          throw new Error('No email found');
        }

        if (account?.provider === 'google') {
          const userExists = await prisma.user.findUnique({
            where: { email: user.email },
            select: { firstName: true },
          });

          if (userExists && !userExists.firstName) {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                firstName: profile?.name || '',
                lastName: profile?.name || '',
                // image: profile?.picture || '',
              },
            });
          } else if (!userExists) {
            await prisma.user.create({
              data: {
                email: user.email,
                firstName: profile?.name || '',
                // image: profile?.picture || '',
              },
            });
          }

          return true;
        } 
        // else if (account?.provider === 'credentials') {
        //   return true;
        // } else {
        //   return false;
        // }
      } catch (error) {
        console.error('Sign-in callback error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, firstName: true, lastName: true },
        });

        if (!user) {
          throw new Error('User not found');
        }

        session.user.id = user.id;
        session.user.name = `${user.firstName || ''} ${user.lastName || ''}`;

        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    // Add jwt callback if needed
    // async jwt({ token, user, account, profile, isNewUser }) {
    //   return token;
    // },
  },
  cookies: {
    sessionToken: {
      name: 'User-Session-Token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

const handler = nextAuth(authOptions);

export { handler as GET, handler as POST };
