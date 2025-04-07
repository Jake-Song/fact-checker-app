'use client'

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react'

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
 
  const fetchFacts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/facts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setFacts(data);
      }
    } catch (error) {
      console.error('Error fetching facts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

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

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="text-gray-500">Loading facts...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Claims</h1>
        {facts.length === 0 ? (
          <div className="text-gray-500">No facts added yet. Add some in the facts page!</div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center w-full">
            {facts.map((fact) => (
              <Link 
                key={fact.id} 
                href={`/facts/${fact.id}`}
                className="block border border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-200"
              >
                <div className="p-6 max-w-[500px] shadow-md relative">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(fact.id);
                    }} 
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"
                    aria-label="Delete fact"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                  <div className="mb-4">
                    <p className="mt-2">{fact.claim}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  )
}
