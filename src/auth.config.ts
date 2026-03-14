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
          .select("id, ad, email, rol, password_hash, tesis_id")
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

        const userId = (data as any).id;
        let tesisId: string | null = null;
        if ((data as any).tesis_id) {
          tesisId = String((data as any).tesis_id);
        } else {
          const { data: personelRow } = await supabase
            .from("personel")
            .select("tesis_id")
            .eq("kullanici_id", userId)
            .maybeSingle();
          if ((personelRow as any)?.tesis_id) {
            tesisId = String((personelRow as any).tesis_id);
          }
        }

        const user = {
          id: String(userId),
          name: (data as any).ad ?? null,
          email: (data as any).email ?? null,
          role: (data as any).rol ?? "müşteri",
          tesis_id: tesisId,
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
        token.tesis_id = (user as any).tesis_id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tesis_id = token.tesis_id ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

