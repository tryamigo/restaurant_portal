// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;  // Required by NextAuth
    mobile: string;
    token: string;
  }
  
  interface Session {
    user: User;
  }
}
