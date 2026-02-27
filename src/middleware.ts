import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        console.log('Middleware Debug:', { path, hasUser: !!token });

        // Don't let logged in users see login/signup page
        if (['/login', '/signup'].includes(path) && token) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname
                // Dashboard routes require token
                if (path.startsWith('/dashboard')) {
                    return !!token
                }
                // Public routes are always authorized
                return true
            },
        },
    }
)

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/signup',
    ],
}
