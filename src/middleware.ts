import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// セッショントークンをリフレッシュし、Cookieを更新するミドルウェア
export const middleware = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションを更新（必須：削除しないこと）
  const { data: { user } } = await supabase.auth.getUser();

  // 未ログイン（ゲスト含む）が保護ページにアクセスした場合はログインへ
  // ゲストユーザーはすべてのページにアクセス可能
  const protectedPaths = ["/posts/new", "/profile"]
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // 管理者ダッシュボードは admin_token Cookie がない場合はログインページへ
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    const adminToken = request.cookies.get("admin_token")?.value
    const adminSecret = process.env.ADMIN_SECRET
    if (!adminToken || !adminSecret || adminToken !== adminSecret) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
