import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { isAllowed, isAdmin } from "@/lib/allowlist"

const handler = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: "read:user user:email" }, // ensures private emails are accessible
      },
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      return isAllowed(user.email)
    },
    async session({ session, token }) {
      if (session.user?.email) {
        session.user.isAdmin = isAdmin(session.user.email);
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // redirect auth errors to login page
  },
})

export { handler as GET, handler as POST }
