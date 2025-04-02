'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react'

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

export default function Home() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchFacts();
  }, []);

  async function fetchFacts() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/facts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setFacts(data);
      
      // Fetch user's votes for each fact
      if (token) {
        const votes: Record<number, string> = {};
        for (const fact of data) {
          const voteRes = await fetch(`/api/facts/${fact.id}/vote`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const voteData = await voteRes.json();
          if (voteData?.rating) {
            votes[fact.id] = voteData.rating;
          }
        }
        setUserVotes(votes);
      }
    } catch (error) {
      console.error('Error fetching facts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/facts/${id}`, {
        method: 'DELETE',
      });
      await fetchFacts(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting fact:', error);
    }
  }

  async function handleVote(factId: number, rating: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = '/auth';
        return;
      }

      const res = await fetch(`/api/facts/${factId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state with new vote and vote counts
        setUserVotes(prev => ({
          ...prev,
          [factId]: rating,
        }));
        setFacts(prev => prev.map(fact => 
          fact.id === factId 
            ? { ...fact, voteCounts: data.voteCounts }
            : fact
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
              Fact Checker
            </h1>
          </div>
          <div className="text-gray-500">Loading facts...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Fact Cards</h1>
        {facts.length === 0 ? (
          <div className="text-gray-500">No facts added yet. Add some in the facts page!</div>
        ) : (
          facts.map((fact) => (
            <div key={fact.id} className="border-1 border-gray-300 rounded-lg p-6 max-w-[500px] shadow-md relative">
              <Link href={`/facts/${fact.id}`}>Link</Link>
                <button 
                  onClick={() => handleDelete(fact.id)} 
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"
                  aria-label="Delete fact"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <div className="mb-4">
                <h2 className="font-bold text-lg">Claim:</h2>
                <p className="mt-2">{fact.claim}</p>
              </div>
              <div>
                <h2 className="font-bold text-lg">Answer:</h2>
                <p className="mt-2">{fact.answer}</p>
              </div>
              <small className="text-gray-500 mt-4 block">
                Created on {new Date(fact.createdAt).toLocaleString()}
              </small>
              
              {/* Voting buttons */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(fact.id, 'helpful')}
                    className='px-3 py-1 rounded-md text-sm flex items-center gap-2 bg-green-500 text-white'
                  >
                    Helpful
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {fact.voteCounts.helpful}
                    </span>
                  </button>
                  <button
                    onClick={() => handleVote(fact.id, 'somewhat_helpful')}
                    className='px-3 py-1 rounded-md text-sm flex items-center gap-2 bg-yellow-500 text-white'
                  >
                    Somewhat Helpful
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {fact.voteCounts.somewhat_helpful}
                    </span>
                  </button>
                  <button
                    onClick={() => handleVote(fact.id, 'not_helpful')}
                    className='px-3 py-1 rounded-md text-sm flex items-center gap-2 bg-red-500 text-white'
                  >
                    Not Helpful
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {fact.voteCounts.not_helpful}
                    </span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Total votes: {fact.voteCounts.helpful + fact.voteCounts.somewhat_helpful + fact.voteCounts.not_helpful}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  )
}
