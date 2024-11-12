// // middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/sign-in",  // Ensure this matches the path in authOptions
  },
});

export const config = {
  matcher: [
    '/:path*',      // Protects all routes under /
    
  ],
};
