import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the webpage content
    const response = await axios.get(url);
    const html = response.data;
    console.log("scraping html", html);
    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    
    // Extract relevant information
    // This is a basic example - customize based on your needs
    const pageData = {
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content') || '',
      // Get main content - adjust selectors based on target websites
      mainContent: $('article, main, .main-content').text().trim() || $('body').text().trim(),
      // Get all paragraphs
      paragraphs: $('p').map((_, el: any) => $(el).text().trim()).get(),
    };

    return NextResponse.json(pageData);
  } catch (error) {
    console.error('Error scraping webpage:', error);
    return NextResponse.json(
      { error: 'Failed to scrape webpage' },
      { status: 500 }
    );
  }
}
