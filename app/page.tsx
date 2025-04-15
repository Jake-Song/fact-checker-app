'use client'

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react'

type Fact = {
  id: number;
  claim: string;
  answer: string;
  slug: string;
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
      const res = await fetch('/api/facts');
      
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

  async function handleDelete(slug: string) {
    try {
      const res = await fetch(`/api/facts/${slug}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setFacts(facts.filter(fact => fact.slug !== slug));
      }
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
                href={`/facts/${fact.slug}`}
                className="block border border-gray-200 rounded-lg hover:border-blue-500 transition-all duration-200 w-[400px]"
              >
                <div className="p-8 shadow-sm relative">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(fact.slug);
                    }} 
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"
                    aria-label="Delete fact"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                  <div className="relative">
                    <svg className="absolute -top-4 -left-4 w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="text-lg italic pl-4 line-clamp-2">{fact.claim}</p>
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
