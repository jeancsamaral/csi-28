import { NextRequest } from "next/server";
import { setAuthCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { clientConfig, serverConfig } from "../../../config";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Verifica se já existe um cookie de autenticação
  const cookieStore = cookies();
  const authCookie = cookieStore.get(serverConfig.cookieName);
  
  if (authCookie) {
    return new Response("Already logged in", { status: 200 });
  }

  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];

  try {
    const tokens = await getTokens(cookieStore, {
      apiKey: clientConfig.apiKey,
      serviceAccount: serverConfig.serviceAccount,
    });

    if (!tokens) {
      return new Response("Unauthorized", { status: 401 });
    }

    const response = new Response("Logged in");

    await setAuthCookies(tokens, {
      cookies: cookieStore,
      maxAge: 12 * 60 * 60 * 24, // 12 days
    });

    return response;
  } catch (error) {
    console.error("Error setting auth cookies:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Adicionar rota para verificar estado de autenticação
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get(serverConfig.cookieName);

  if (!authCookie) {
    return new Response("Not logged in", { status: 401 });
  }

  try {
    const tokens = await getTokens(cookieStore, {
      apiKey: clientConfig.apiKey,
      serviceAccount: serverConfig.serviceAccount,
    });

    if (!tokens) {
      return new Response("Invalid session", { status: 401 });
    }

    return new Response("Authenticated", { status: 200 });
  } catch (error) {
    console.error("Error verifying auth:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 