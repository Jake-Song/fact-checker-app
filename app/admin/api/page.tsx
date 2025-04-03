'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ApiTokenInfo = {
  token: string;
  expiresAt: string;
};

type StoredToken = {
  id: number;
  token: string;
  name: string | null;
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
};

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
  const [tokenInfo, setTokenInfo] = useState<ApiTokenInfo | null>(null);
  const [storedTokens, setStoredTokens] = useState<StoredToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showToken, setShowToken] = useState(false);
  const [deletingTokenId, setDeletingTokenId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    fetchStoredTokens();
  }, [router]);

  const fetchStoredTokens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tokens', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setStoredTokens(data.tokens);
    } catch (err) {
      console.error('Error fetching tokens:', err);
    }
  };

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
      setTokenInfo(data);
      setShowToken(true);
      await fetchStoredTokens(); // Refresh the token list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteToken = async (tokenId: number) => {
    if (!confirm('Are you sure you want to revoke this API token? This action cannot be undone.')) {
      return;
    }

    setDeletingTokenId(tokenId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke token');
      }

      // Refresh the token list
      await fetchStoredTokens();
    } catch (err) {
      console.error('Error revoking token:', err);
      alert('Failed to revoke token. Please try again.');
    } finally {
      setDeletingTokenId(null);
    }
  };

  const copyToClipboard = () => {
    if (tokenInfo) {
      navigator.clipboard.writeText(tokenInfo.token);
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  const getMaskedToken = (token: string) => {
    const firstFour = token.substring(0, 4);
    const lastFour = token.substring(token.length - 4);
    const maskedLength = token.length - 8;
    const masked = '*'.repeat(maskedLength);
    return `${firstFour}${masked}${lastFour}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                    {tokenInfo && (
                      <>
                        <button
                          onClick={copyToClipboard}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Copy Token
                        </button>
                        <button
                          onClick={toggleTokenVisibility}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          {showToken ? 'Hide Token' : 'Show Token'}
                        </button>
                      </>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-600">{error}</p>
                  )}
                  {tokenInfo && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Your API Token:</p>
                        <pre className="p-4 rounded-md break-all border border-gray-200">
                          {getMaskedToken(tokenInfo.token)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Expires on:</p>
                        <p className="text-gray-600">{formatDate(tokenInfo.expiresAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Your API Tokens</h2>
                <div className="space-y-4">
                  {storedTokens.length === 0 ? (
                    <p className="text-gray-600">No API tokens found. Generate a new token to get started.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {storedTokens.map((token) => (
                            <tr key={token.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                {getMaskedToken(token.token)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(token.createdAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(token.expiresAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(token.lastUsed)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(token.token);
                                      const button = document.activeElement as HTMLButtonElement;
                                      const originalText = button.textContent;
                                      button.textContent = 'Copied!';
                                      setTimeout(() => {
                                        button.textContent = originalText;
                                      }, 2000);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => deleteToken(token.id)}
                                    disabled={deletingTokenId === token.id}
                                    className="text-red-600 hover:text-red-800 focus:outline-none disabled:opacity-50"
                                  >
                                    {deletingTokenId === token.id ? 'Revoking...' : 'Revoke'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 