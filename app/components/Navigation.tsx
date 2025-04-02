import Link from 'next/link'

export default function Navigation() {
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
        <Link href="/admin" className="hover:text-gray-600 transition-colors duration-200">Admin</Link>      
    
      </nav>
    </div>
  )
}