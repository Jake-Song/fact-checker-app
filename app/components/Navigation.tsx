'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="w-full border-b border-gray-100/30 mt-8 pb-2">
      <nav className="flex items-end pl-8 gap-6">
        <Link href="/" className="pr-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
            Fact Checker
          </h1> 
        </Link>
        
        <Link href="/blog" className="hover:text-gray-600 transition-colors duration-200">Blog</Link>
        <Link href="/facts" className="hover:text-gray-600 transition-colors duration-200">Facts</Link>
       
        
        {status === 'authenticated' ? (
          <>
            <Link href="/scrape-llm" className="hover:text-gray-600 transition-colors duration-200">Scrape LLM</Link>
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