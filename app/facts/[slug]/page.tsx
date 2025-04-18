'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

type Fact = {
  id: number;
  claim: string;
  answer: string;
  slug: string;
  status: string;
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

export default function FactPage({ params }: { params: Promise<{ slug: string }> }) {
  const [fact, setFact] = useState<Fact | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchFact = useCallback(async () => {
    try {
      const { slug } = await params;
      const res = await fetch(`/api/facts/${slug}`);
      const data = await res.json();
      setFact(data);
     
      // Fetch user's vote if authenticated
      if (status === 'authenticated') {
        const voteRes = await fetch(`/api/facts/${slug}/vote`);
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
  }, [params, status]);

  useEffect(() => {
    fetchFact();
  }, [fetchFact]);

  async function handleVote(rating: string) {
    try {
      if (status !== 'authenticated') {
        router.push('/auth');
        return;
      }

      const { slug } = await params;
      const res = await fetch(`/api/facts/${slug}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

        <article className="w-full p-6">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown
                  components={{
                    // Override default heading components to ensure proper styling
                    h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold mb-2" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-xl font-bold mb-2" {...props} />,
                    // Override list components
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    // Override paragraph component
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    // Keep the existing code component
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {fact.answer || '*No content to preview*'}
            </ReactMarkdown>
            </div>
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
        </article>
      </main>
    </div>
  );
}
