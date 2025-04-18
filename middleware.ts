import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Create a response object that we'll modify and return
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  try {
    // Handle admin routes
    if (path.startsWith('/admin')) {
      const session = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Check if the user is not authenticated or not an admin
      if (!session) {
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      if (!session.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (path.startsWith('/scrape-llm')) {
      const session = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Check if the user is not authenticated or not an admin
      if (!session) {
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      if (!session.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (path.startsWith('/chat')) {
      const session = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Check if the user is not authenticated or not an admin
      if (!session) {
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      if (!session.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Handle API routes
    if (path.startsWith('/api')) {
      // Add API-specific headers
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: response.headers });
      }
      
      // For protected API routes, check authentication
      if (path.startsWith('/api/admin')) {
        const session = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!session?.isAdmin) {
          return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(response.headers)
            }
          });
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Return appropriate error response based on the request type
    if (path.startsWith('/api')) {
      return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(response.headers)
        }
      });
    }
    
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    // Match admin routes
    '/admin/:path*',
    // Match scrape-llm routes
    '/scrape-llm/:path*',
    // Match API routes
    '/api/:path*',
    // Exclude static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}; 