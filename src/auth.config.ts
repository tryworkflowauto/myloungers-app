import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase } from "@/lib/supabase";

export default {
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
        console.log("Auth.js v5 credentials.authorize çağrıldı. Raw credentials:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        const email = ((credentials?.email as string) ?? "").toLowerCase().trim();
        const password = (credentials?.password as string) ?? "";
        if (!email || !password) {
          console.log("Auth.js v5 authorize: email veya password boş", { email, hasPassword: !!password });
          return null;
        }

        const { data, error } = await supabase
          .from("kullanicilar")
          .select("id, ad, email, rol, password_hash")
          .eq("email", email)
          .maybeSingle();

        console.log("Auth.js v5 authorize: supabase select sonucu:", {
          error,
          hasData: !!data,
        });

        if (error) {
          console.error(
            "Auth.js v5 authorize supabase error:",
            JSON.stringify(error, null, 2)
          );
          return null;
        }

        if (!data) {
          console.log("Auth.js v5 authorize: kullanıcı bulunamadı", { email });
          return null;
        }

        const hash = (data as any).password_hash as string | undefined;
        if (!hash) {
          console.error(
            "Auth.js v5 authorize: user row has no password_hash",
            JSON.stringify(data, null, 2)
          );
          return null;
        }

        const ok = await compare(password, hash);

        console.log(
          "Auth.js v5 credentials authorize — sonuç:",
          JSON.stringify(
            {
              email,
              userId: (data as any).id,
              hasHash: !!hash,
              compareOk: ok,
            },
            null,
            2
          )
        );

        if (!ok) return null;

        const user = {
          id: String((data as any).id),
          name: (data as any).ad ?? null,
          email: (data as any).email ?? null,
          role: (data as any).rol ?? "müşteri",
        };

        console.log("Auth.js v5 credentials authorize user object:", user);

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
} satisfies NextAuthConfig;

