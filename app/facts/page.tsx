'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FactsPage() {
  const [claim, setClaim] = useState('')
  const [answer, setAnswer] = useState('')
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Create new fact with authentication
      await fetch('/api/facts', {
        method: 'POST',
        body: JSON.stringify({ claim, answer, tag }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Clear form after submission
      setClaim('')
      setAnswer('')
      setTag('')
      
      // Redirect to the home page
      router.push('/')
    } catch (error) {
      console.error('Error saving fact:', error);
      if (error instanceof Error && error.message.includes('401')) {
        // If unauthorized, redirect to login
        router.push('/auth');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-[800px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Fact Check</h1>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/auth');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
        
        {/* Writing Interface */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Claim Input */}
          <div className="space-y-2">
            <label htmlFor="claim" className="block font-semibold">
              Claim
            </label>
            <textarea
              id="claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="w-full h-24 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter the claim to be fact-checked..."
              required
            />
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label htmlFor="answer" className="block font-semibold">
              Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter the fact-check answer..."
              required
            />
          </div>

          {/* Tag Input */}
          <div className="space-y-2">
            <label htmlFor="tag" className="block font-semibold">
              Tag
            </label>
            <input
              type="text"
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter a tag for this fact check..."
            />
          </div>

          {/* Preview Card */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Preview</h2>
            <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
              <div className="mb-4">
                <h2 className="font-bold text-lg">Claim:</h2>
                <p className="mt-2">{claim || 'Your claim will appear here'}</p>
              </div>
              <div className="mb-4">
                <h2 className="font-bold text-lg">Answer:</h2>
                <p className="mt-2">{answer || 'Your answer will appear here'}</p>
              </div>
              <div>
                <h2 className="font-bold text-lg">Tag:</h2>
                <p className="mt-2">{tag || 'Your tag will appear here'}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Fact Check'}
          </button>
        </form>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  )
}