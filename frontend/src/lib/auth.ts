import NextAuth, { DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Spotify from "next-auth/providers/spotify";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

declare module "next-auth" {
  interface Session {
    accessToken?: unknown;
    provider?: unknown;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: unknown;
    provider?: unknown;
  }
}



/**
 * Raw Auth.js config, exported so route.ts can call @auth/core
 * directly with a plain Request (bypassing NextRequest URL normalization).
 */
export const authConfig: NextAuthConfig = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL || "https://placeholder.supabase.co",
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key-for-build",
  }),

  providers: [
    Spotify({
      clientId: process.env.AUTH_SPOTIFY_ID!,
      clientSecret: process.env.AUTH_SPOTIFY_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email user-read-private playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private&show_dialog=true",
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, user, token }) {
      if (user) {
        session.user.id = user.id;
      }
      if (token) {
        // Prioritize token.id (the DB UUID) over token.sub (which might be the provider ID)
        if (token.id) {
            session.user.id = token.id as string;
        } else if (token.sub) {
          session.user.id = token.sub as string;
        }
        session.accessToken = token.accessToken;
        session.provider = token.provider;
      }
      return session;
    },
  },

  // Debug: enable to see full Auth.js internal logs in terminal
  debug: process.env.NODE_ENV === "development",

  events: {
    async signIn({ user, account }) {
      console.log("[AUTH DEBUG] signIn event fired", {
        provider: account?.provider,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });
      
      if (account && user && user.id && account.provider) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: "next_auth" }
          });
          
          const updates: any = {
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          };
          
          if (account.refresh_token) {
            updates.refresh_token = account.refresh_token;
          }
          
          const { error } = await supabase
            .from("accounts")
            .update(updates)
            .eq("userId", user.id)
            .eq("provider", account.provider);
            
          if (error) {
            console.error("[AUTH DEBUG] Failed to update account tokens:", error);
          } else {
            console.log(`[AUTH DEBUG] Successfully updated tokens for ${account.provider}`);
          }
        }
      }
    },
  },

  basePath: "/api/auth",
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
