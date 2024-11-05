import CredentialsProvider from "next-auth/providers/credentials";
interface Credentials {
    mobile: string;
    otp: string;
  }
  
  interface User {
    id: string;
    mobile: string;
    token: string;
  }
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

export const authOptions: any = {
    providers: [
      CredentialsProvider({
        name: "Mobile OTP",
        credentials: {
          mobile: { label: "Mobile Number", type: "text" },
          otp: { label: "OTP", type: "text" },
        },
        async authorize(credentials: Credentials | undefined) {
          if (!credentials) {
            throw new Error("No credentials provided");
          }
  
          const { mobile, otp } = credentials;
        
          const response = await fetch(`${apiUrl}/auth/restaurants/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile, otp }),
          });
  
          const data = await response.json();

          if (response.ok && data.token) {
            return { id: data.restaurant.id, mobile:data.restaurant.mobile, token: data.token } as User;
          } else {
            throw new Error(data.error || "OTP verification failed");
          }
        },
      }),
    ],
    pages: {
      signIn: "/sign-in",  
    },
    callbacks: {
      async jwt({ token, user }: { token: any; user?: User }) {
        if (user) {
          token = { ...token, id: user.id, mobile: user.mobile, token: user.token };
        }
        return token;
      },
      async session({ session, token }: { session: any; token: any }) {
        session.user = { id: token.id, mobile: token.mobile, token: token.token };
        return session;
      },
    },
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
  };