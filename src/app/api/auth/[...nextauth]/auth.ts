import NextAuth from "next-auth";
import { authOptions } from "./xyz";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authOptions);
