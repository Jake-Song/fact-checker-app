'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [pathname]) // Run when pathname changes

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <div className="absolute left-0 top-24 w-full border-b border-gray-100/30 pb-2">
      <nav className="max-w-7xl mx-auto flex items-end gap-4 px-16">
        <Link href="/" className="pr-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
            Fact Checker
          </h1> 
        </Link>
        
        <Link href="/blog" className="hover:text-gray-600 transition-colors duration-200">Blog</Link>
        <Link href="/facts" className="hover:text-gray-600 transition-colors duration-200">Facts</Link>
        
        {isAuthenticated ? (
          <>
            <Link href="/admin" className="hover:text-gray-600 transition-colors duration-200">Admin</Link>
            <button 
              onClick={handleSignOut}
              className="hover:text-gray-600 transition-colors duration-200"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/auth" className="hover:text-gray-600 transition-colors duration-200">Login</Link>
        )}
      </nav>
    </div>
  )
}