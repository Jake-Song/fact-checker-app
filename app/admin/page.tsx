'use client'
import { useState } from 'react'
import { useFacts } from '../components/FactsContext'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [claim, setClaim] = useState('')
  const [answer, setAnswer] = useState('')
  const { addFact } = useFacts()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically send this data to your backend
    console.log({ claim, answer })
    
    // Add the new fact
    addFact({ claim, answer })
    
    // Clear form after submission
    setClaim('')
    setAnswer('')
    
    // Redirect to the home page
    router.push('/')
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-[800px]">
        <h1 className="text-2xl font-bold">Create New Fact Check</h1>
        
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

          {/* Preview Card */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Preview</h2>
            <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
              <div className="mb-4">
                <h2 className="font-bold text-lg">Claim:</h2>
                <p className="mt-2">{claim || 'Your claim will appear here'}</p>
              </div>
              <div>
                <h2 className="font-bold text-lg">Answer:</h2>
                <p className="mt-2">{answer || 'Your answer will appear here'}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Save Fact Check
          </button>
        </form>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  )
}