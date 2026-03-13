import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase } from "@/lib/supabase";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email ve Şifre",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const { data, error } = await supabase
          .from("kullanicilar")
          .select("id, ad, email, rol, password_hash")
          .eq("email", email)
          .maybeSingle();

        if (error) {
          console.error(
            "NextAuth authorize supabase error:",
            JSON.stringify(error, null, 2)
          );
          return null;
        }

        if (!data) {
          // Email bulunamadı → yanlış email gibi davran
          return null;
        }

        const hash = (data as any).password_hash as string | undefined;
        if (!hash) {
          console.error(
            "NextAuth authorize: user row has no password_hash",
            JSON.stringify(data, null, 2)
          );
          return null;
        }

        const ok = await compare(password, hash);

        console.log("NextAuth credentials authorize result:", {
          email,
          hasHash: !!hash,
          compareOk: ok,
          userId: (data as any).id,
        });

        if (!ok) return null;

        const user = {
          id: String((data as any).id),
          name: (data as any).ad ?? null,
          email: (data as any).email ?? null,
          role: (data as any).rol ?? "müşteri",
        };

        console.log("NextAuth credentials authorize user object:", user);

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});



