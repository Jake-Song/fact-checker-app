'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ChatMessage from '../components/ChatMessage'

type Fact = {
  id: number;
  claim: string;
  answer: string;
  slug: string;
  status: string;
  createdAt: string;
  tag?: string;
  author?: {
    id: number;
    name: string | null;
    email: string | null;
  };
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function SideMenu({ facts, handleEdit, handleDelete, handlePublish }: { 
  facts: Fact[]; 
  handleEdit: (fact: Fact) => void;
  handleDelete: (slug: string) => void;
  handlePublish: (slug: string) => void;
}) {
  return (
    <div className="w-64 h-screen text-white p-4 mt-8 overflow-y-auto">
      {/* Facts List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Fact Checks</h2>
        <div className="space-y-4">
          {facts.map((fact) => (
            <div key={fact.id} className="border border-gray-700 rounded-lg p-3 shadow-md bg-gray-800">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold line-clamp-2">{fact.claim}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                    fact.status === 'published' 
                      ? 'bg-green-900 text-green-200' 
                      : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {fact.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              {fact.tag && (
                <p className="text-gray-400 text-xs mb-2">
                  <span className="font-semibold">Tag:</span> {fact.tag}
                </p>
              )}
              <div className="flex justify-between items-center mt-2">
                <small className="text-gray-400 text-xs">
                  {new Date(fact.createdAt).toLocaleDateString()}
                </small>
                <div className="flex gap-1">
                   {fact.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(fact.slug)}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Publish
                      </button>
                    )}
                  <button
                    onClick={() => handleEdit(fact)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(fact.slug)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {facts.length === 0 && (
            <p className="text-gray-400 text-center py-4 text-sm">No fact checks yet. Create your first one!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FactsPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [claim, setClaim] = useState('')
  const [answer, setAnswer] = useState('')
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(false);
  const [editingFactSlug, setEditingFactSlug] = useState<string | null>(null);
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFacts = useCallback(async () => {
    try {
      const res = await fetch('/api/facts');
      if (res.ok) {
        const data = await res.json();
        setFacts(data);
      }
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    
    // Fetch facts when component mounts
    fetchFacts();
  }, [status, router, fetchFacts]);

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true);

    try {
      if (editingFactSlug) {
        // Edit mode
        const response = await fetch(`/api/facts/${editingFactSlug}`, {
          method: 'PUT',
          body: JSON.stringify({ claim, answer, tag, status }),
          headers: { 
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to update fact');
        }
        
        setEditingFactSlug(null);
      } else {
        // Create mode
        const response = await fetch('/api/facts', {
          method: 'POST',
          body: JSON.stringify({ claim, answer, tag, status }),
          headers: { 
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to save fact');
        }
      }
      
      // Clear form after submission
      setClaim('')
      setAnswer('')
      setTag('')
      
      // Refresh facts list
      await fetchFacts();
    } catch (error) {
      console.error('Error saving fact:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/facts/${slug}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchFacts();
      }
    } catch (error) {
      console.error('Error deleting fact:', error);
    }
  }

  const handlePublish = async (slug: string) => {
    try {
      const response = await fetch(`/api/facts/${slug}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'published' }),
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchFacts();
      }
    } catch (error) {
      console.error('Error publishing fact:', error);
    }
  }

  const handleEdit = (fact: Fact) => {
    setEditingFactSlug(fact.slug);
    setClaim(fact.claim);
    setAnswer(fact.answer);
    setTag(fact.tag || '');
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: Message = { role: 'user', content: chatInput.trim() };
    setMessages((prev) => [...prev, userMessage]);
    
    // Set the claim field to the user's question
    setClaim(chatInput.trim());
    
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.output_text,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Set the answer field to the AI's response
      setAnswer(data.output_text);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen mt-8">
      <SideMenu 
        facts={facts} 
        handleEdit={handleEdit} 
        handleDelete={handleDelete} 
        handlePublish={handlePublish} 
      />
      <div className="flex-1 p-8">
        <main className="max-w-[800px] mx-auto">

         {/* Chat Interface */}
         <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>
          <div className="rounded-lg shadow-lg p-6">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask for help with your fact check..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={isChatLoading}
                className={`px-4 py-2 rounded-lg text-white ${
                  isChatLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isChatLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Writing Interface */}
        <form onSubmit={(e) => handleSubmit(e, 'draft')} className="w-full space-y-6">
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

           {/* Preview Section */}
           <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600">
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
                  {answer || '*No content to preview*'}
                </ReactMarkdown>
              </div>
            </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {editingFactSlug ? (loading ? 'Saving...' : 'Save as Draft') : (loading ? 'Creating...' : 'Save as Draft')}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {editingFactSlug ? (loading ? 'Publishing...' : 'Publish') : (loading ? 'Creating...' : 'Publish')}
            </button>
            {editingFactSlug && (
              <button
                type="button"
                onClick={() => {
                  setEditingFactSlug(null);
                  setClaim('');
                  setAnswer('');
                  setTag('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
            
      </main>
      </div>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  )
}