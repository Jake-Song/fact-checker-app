'use client'

import { useState } from 'react'

type ScrapedData = {
  title: string;
  description: string;
  mainContent: string;
  paragraphs: string[];
}

export default function ScrapeTestPage() {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url) return;
    
    setScraping(true);
    setError(null);
    setScrapedData(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape webpage');
      }

      const data = await response.json();
      setScrapedData(data);
      
    } catch (error) {
      console.error('Error scraping webpage:', error);
      setError(error instanceof Error ? error.message : 'Failed to scrape webpage');
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-[800px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Web Scraper Test Page</h1>
        </div>

        {/* URL Input Section */}
        <div className="w-full space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter URL to scrape..."
            />
            <button
              onClick={handleScrape}
              disabled={scraping || !url}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {scraping ? 'Scraping...' : 'Scrape'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Results Display */}
          {scrapedData && (
            <div className="space-y-6 mt-8">
              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Title</h2>
                <div className="p-4 rounded-lg">
                  {scrapedData.title || 'No title found'}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Meta Description</h2>
                <div className="p-4 rounded-lg">
                  {scrapedData.description || 'No description found'}
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Main Content</h2>
                <div className="p-4 rounded-lg max-h-[300px] overflow-y-auto">
                  {scrapedData.mainContent || 'No main content found'}
                </div>
              </div>

              {/* Paragraphs */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Paragraphs</h2>
                <div className="space-y-2">
                  {scrapedData.paragraphs.length > 0 ? (
                    scrapedData.paragraphs.map((paragraph, index) => (
                      <div key={index} className="p-4 rounded-lg">
                        {paragraph}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg">
                      No paragraphs found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 