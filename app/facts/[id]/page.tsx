'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Fact = {
  id: number;
  claim: string;
  answer: string;
  createdAt: string;
  votes?: {
    rating: string;
  }[];
  voteCounts: {
    helpful: number;
    somewhat_helpful: number;
    not_helpful: number;
  };
};

export default function FactPage({ params }: { params: { id: string } }) {
  const [fact, setFact] = useState<Fact | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFact();
  }, [params]);

  async function fetchFact() {
    try {
      const token = localStorage.getItem('token');
      const { id } = await params;
      const res = await fetch(`/api/facts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setFact(data);
     
      // Fetch user's vote if authenticated
      if (token) {
        const voteRes = await fetch(`/api/facts/${id}/vote`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const voteData = await voteRes.json();
        if (voteData?.rating) {
          setUserVote(voteData.rating);
        }
      }
    } catch (error) {
      console.error('Error fetching fact:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(rating: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }
      const { id } = await params;
      const res = await fetch(`/api/facts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserVote(rating);
        setFact(prev => prev ? {
          ...prev,
          voteCounts: data.voteCounts,
        } : null);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          <div className="text-gray-500">Loading fact...</div>
        </main>
      </div>
    );
  }

  if (!fact) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          <div className="text-gray-500">Fact not found</div>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Return to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-[800px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Fact Check Details</h1>
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-600"
          >
            ← Back to Facts
          </Link>
        </div>

        <div className="w-full border-1 border-gray-300 rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <h2 className="font-bold text-xl mb-2">Claim:</h2>
            <p className="mt-2">{fact.claim}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="font-bold text-xl mb-2">Answer:</h2>
            <p className="mt-2">{fact.answer}</p>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            Created on {new Date(fact.createdAt).toLocaleString()}
          </div>
          
          {/* Voting section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Was this fact check helpful?</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote('helpful')}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                    userVote === 'helpful' 
                      ? 'bg-green-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  Helpful
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {fact.voteCounts.helpful}
                  </span>
                </button>
                <button
                  onClick={() => handleVote('somewhat_helpful')}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                    userVote === 'somewhat_helpful' 
                      ? 'bg-yellow-600' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white`}
                >
                  Somewhat Helpful
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {fact.voteCounts.somewhat_helpful}
                  </span>
                </button>
                <button
                  onClick={() => handleVote('not_helpful')}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                    userVote === 'not_helpful' 
                      ? 'bg-red-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  Not Helpful
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {fact.voteCounts.not_helpful}
                  </span>
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Total votes: {fact.voteCounts.helpful + fact.voteCounts.somewhat_helpful + fact.voteCounts.not_helpful}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
