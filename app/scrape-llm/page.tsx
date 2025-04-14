'use client'

import { useState } from 'react'

type ScrapedData = {
  title: string;
  description: string;
  mainContent: string;
  paragraphs: string[];
  headings: string[];
  links: { text: string; href: string }[];
  images: { alt: string; src: string }[];
  url: string;
}

type LLMResponse = {
  content: string;
  role: string;
}

export default function ScrapeLLMPage() {
  const [url, setUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [llmResponse, setLLMResponse] = useState<LLMResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScrapedData, setShowScrapedData] = useState(true);
 
  const handleScrape = async () => {
    if (!url) return;
    
    setScraping(true);
    setError(null);
    setScrapedData(null);
    setLLMResponse(null);

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

  const handleProcessWithLLM = async () => {
    if (!scrapedData) return;
    
    setProcessing(true);
    setError(null);
    setLLMResponse(null);

    try {
      // Use the new API endpoint
      const response = await fetch('/api/scrape-llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scrapedData,
          model: 'claude-3-5-sonnet-20240620'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process with LLM');
      }

      const data = await response.json();
      setLLMResponse({
        content: data.content[0].text,
        role: data.content[0].type
      });
      
    } catch (error) {
      console.error('Error processing with LLM:', error);
      setError(error instanceof Error ? error.message : 'Failed to process with LLM');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-[800px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Web Scraper with LLM Analysis</h1>
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

          {/* LLM Processing Section */}
          {scrapedData && (
            <div className="space-y-4 mt-8">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Process with LLM</h2>
                
                {/* Analysis Type Selection */}
                <div className="flex flex-col gap-2">
                    <button
                    onClick={handleProcessWithLLM}
                    disabled={processing || !scrapedData}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed self-end"
                  >
                    {processing ? 'Processing...' : 'Process with LLM'}
                  </button>
                </div>
              </div>

              {/* LLM Response */}
              {llmResponse && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">LLM Analysis</h2>
                  <div className="p-4 rounded-lg whitespace-pre-wrap">
                    {llmResponse.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scraped Data Display */}
          {scrapedData && (
            <div className="space-y-6 mt-8">
              <div className="w-full flex justify-between items-center">
                <h2 className="text-xl font-semibold">Scraped Content</h2>
                <button
                  onClick={() => setShowScrapedData(!showScrapedData)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showScrapedData ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showScrapedData && (
                <>
                  {/* Title */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Title</h3>
                    <div className="p-4 rounded-lg">
                      {scrapedData.title || 'No title found'}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Meta Description</h3>
                    <div className="p-4 rounded-lg">
                      {scrapedData.description || 'No description found'}
                    </div>
                  </div>

                 {/* Main Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Main Content</h3>
                    <div className="p-4 rounded-lg max-h-[300px] overflow-y-auto">
                      {scrapedData.mainContent || 'No main content found'}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 