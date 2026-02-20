import { updateSession } from "@/lib/supabaseMiddleware";

export async function middleware(request) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
