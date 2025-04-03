'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SideMenu() {
  return (
    <div className="w-64 h-screen text-white p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/admin" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <span className="material-icons mr-2">article</span>
              Blog
            </Link>
          </li>
          <li>
            <Link href="/admin/api" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <span className="material-icons mr-2">api</span>
              API
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default function ApiPage() {
  const router = useRouter();
  const [apiToken, setApiToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
  }, [router]);

  const generateApiToken = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/generate-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate API token');
      }

      const data = await response.json();
      setApiToken(data.token);
      setShowToken(true); // Show token by default when generated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiToken);
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  // Function to mask the token for display
  const getMaskedToken = () => {
    if (!apiToken) return '';
    if (showToken) return apiToken;
    
    // Show first 4 and last 4 characters, mask the rest
    const firstFour = apiToken.substring(0, 4);
    const lastFour = apiToken.substring(apiToken.length - 4);
    const maskedLength = apiToken.length - 8;
    const masked = '*'.repeat(maskedLength);
    
    return `${firstFour}${masked}${lastFour}`;
  };

  return (
    <div className="flex min-h-screen mt-40">
      <SideMenu />
      <div className="flex-1 p-8">
        <main className="max-w-[800px] mx-auto">
          <div className="w-full">
            <div className="space-y-6">
              <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">API Token</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Generate an API token to access the API endpoints. Keep this token secure and never share it publicly.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={generateApiToken}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate New Token'}
                    </button>
                    {apiToken && (
                      <>
                        <button
                          onClick={copyToClipboard}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Copy Token
                        </button>
                        <button
                          onClick={toggleTokenVisibility}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          {showToken ? 'Hide Token' : 'Show Token'}
                        </button>
                      </>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-600">{error}</p>
                  )}
                  {apiToken && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your API Token:</p>
                      <pre className="p-4 rounded-md break-all">
                        {getMaskedToken()}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Authentication</h2>
                <p className="text-gray-700 mb-4">
                  All API endpoints require authentication using a Bearer token. Include the token in the Authorization header:
                </p>
                <pre className="p-4 rounded-md">
                  Authorization: Bearer your-token-here
                </pre>
              </div>

              <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">GET /api/posts</h3>
                    <p className="text-gray-700">Retrieve all blog posts</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">POST /api/posts</h3>
                    <p className="text-gray-700">Create a new blog post</p>
                    <pre className="p-4 rounded-md mt-2">
                      {`{
  "title": "Post Title",
  "content": "Post Content",
  "status": "draft" | "published"
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold">PUT /api/posts/:id</h3>
                    <p className="text-gray-700">Update an existing blog post</p>
                  </div>

                  <div>
                    <h3 className="font-semibold">DELETE /api/posts/:id</h3>
                    <p className="text-gray-700">Delete a blog post</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 