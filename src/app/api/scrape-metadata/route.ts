import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

interface CacheData {
  metadata: {
    title: string | null;
    description: string | null;
    image: string | null;
  };
  success: boolean;
  source: string;
}

const cache = new Map<string, CacheData>();

// Direct scraper using Cheerio
async function scrapeMetadata(url: string) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "Connection": "keep-alive",
    },
    timeout: 10000,
    maxRedirects: 5,
  });

  const $ = cheerio.load(data);

  const title =
    $("head title").text() || $('meta[property="og:title"]').attr("content");
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content");

  // Try multiple image sources like your deployed app
  const ogImage = $('meta[property="og:image"]').attr("content");
  const twitterImage = $('meta[name="twitter:image"]').attr("content");
  const twitterImageSrc = $('meta[name="twitter:image:src"]').attr("content");
  const favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href");
  
  // Try to find any img tag as fallback
  const firstImg = $('img').first().attr('src');
  
  let imageUrl: string | null = ogImage || twitterImage || twitterImageSrc || firstImg || null;

  // Convert relative URLs to absolute
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      imageUrl = new URL(imageUrl, url).href;
    } catch (e) {
      imageUrl = null;
    }
  }
  
  // Fallback to favicon if no other image found
  if (!imageUrl && favicon) {
    imageUrl = favicon.startsWith("http") ? favicon : new URL(favicon, url).href;
  }

  return {
    title: title || null,
    description: description || null,
    image: imageUrl || null,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid URL format. Please check and try again." },
      { status: 400 }
    );
  }

  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return NextResponse.json(
      { error: "URL must start with 'https://' or 'http://'" },
      { status: 400 }
    );
  }

  if (cache.has(url)) {
    return NextResponse.json(cache.get(url));
  }

  try {
    const metadata = await scrapeMetadata(url);

    const responseData = {
      metadata,
      success: true,
      source: "direct",
    };

    cache.set(url, responseData);
    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error("Scraper failed:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { error: "Request timeout. The website took too long to respond." },
          { status: 504 }
        );
      }
      if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
        return NextResponse.json(
          { error: "This URL doesn't exist or can't be reached. Please check the address." },
          { status: 404 }
        );
      }
      if (error.code === "ECONNREFUSED") {
        return NextResponse.json(
          { error: "Connection refused. The website may be down or blocking requests." },
          { status: 503 }
        );
      }
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: "Page not found. Please check the URL and try again." },
          { status: 404 }
        );
      }
      if (error.response?.status === 500) {
        return NextResponse.json(
          { error: "The target website is currently unavailable (server error)." },
          { status: 502 }
        );
      }
      if (error.response?.status === 403 || error.response?.status === 401) {
        return NextResponse.json(
          { error: "Access denied by the target website." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Unable to reach this URL. Please verify it's correct and accessible." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
