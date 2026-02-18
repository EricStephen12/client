import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    console.log('Middleware Debug:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
        cookies: request.cookies.getAll().map(c => c.name)
    });

    // PROTECTED ROUTES LOGIC
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            console.log('Middleware: Blocking access to dashboard (No User)');
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // AUTH ROUTES LOGIC (Don't let logged in users see login page)
    if (['/login', '/signup'].includes(request.nextUrl.pathname)) {
        if (user) {
            console.log('Middleware: Redirecting logged-in user to dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
