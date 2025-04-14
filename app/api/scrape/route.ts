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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000, // 10 seconds timeout
    });
    
    const html = response.data;
    
    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .ad, .advertisement, .social-share, .comments, .related-posts, .sidebar, .menu, .navigation, .cookie-notice, .newsletter-signup, .popup, .modal, .banner, .ad-container, .ad-wrapper, .advertisement-container, .advertisement-wrapper, .social-share-container, .social-share-wrapper, .comments-container, .comments-wrapper, .related-posts-container, .related-posts-wrapper, .sidebar-container, .sidebar-wrapper, .menu-container, .menu-wrapper, .navigation-container, .navigation-wrapper, .cookie-notice-container, .cookie-notice-wrapper, .newsletter-signup-container, .newsletter-signup-wrapper, .popup-container, .popup-wrapper, .modal-container, .modal-wrapper, .banner-container, .banner-wrapper').remove();
    
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim();
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || 
                        $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') || '';
    
    // Extract main content - try different selectors
    let mainContent = '';
    
    // Try to find the main content area
    const mainContentSelectors = [
      'article', 
      'main', 
      '.main-content', 
      '.content', 
      '.post-content', 
      '.article-content', 
      '.entry-content',
      '#content',
      '.post',
      '.article'
    ];
    
    for (const selector of mainContentSelectors) {
      const content = $(selector).text().trim();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }
    
    // If no main content found, use body text
    if (!mainContent) {
      mainContent = $('body').text().trim();
    }
    
    // Clean up the main content
    mainContent = mainContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with a single newline
      .trim();
    
    // Extract paragraphs
    const paragraphs = $('p').map((_, el) => {
      const text = $(el).text().trim();
      return text;
    }).get().filter(p => p.length > 20); // Filter out short paragraphs
    
    // Extract headings
    const headings = $('h1, h2, h3').map((_, el) => {
      return $(el).text().trim();
    }).get();
    
    // Extract links with their text
    const links = $('a').map((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      return { text, href };
    }).get().filter(link => link.text && link.href);
    
    // Extract images with their alt text
    const images = $('img').map((_, el) => {
      const alt = $(el).attr('alt') || '';
      const src = $(el).attr('src') || '';
      return { alt, src };
    }).get().filter(img => img.src);

    return NextResponse.json({
      title,
      description,
      mainContent,
      paragraphs,
      headings,
      links,
      images,
      url
    });
  } catch (error) {
    console.error('Error scraping webpage:', error);
    return NextResponse.json(
      { error: 'Failed to scrape webpage' },
      { status: 500 }
    );
  }
}
