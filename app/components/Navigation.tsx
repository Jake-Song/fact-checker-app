import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="absolute left-1/2 transform -translate-x-1/2 top-24 flex gap-4">
      <Link href="/" className="hover:underline">Home</Link>
      <Link href="/blog" className="hover:underline">Blog</Link>
      <Link href="/admin" className="hover:underline">Admin</Link>
    </nav>
  )
}