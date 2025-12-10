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
    timeout: 8000,
  });

  const $ = cheerio.load(data);

  const title =
    $("head title").text() || $('meta[property="og:title"]').attr("content");
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content");

  const ogImage = $('meta[property="og:image"]').attr("content");
  const twitterImage = $('meta[name="twitter:image"]').attr("content");
  const favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href");

  let imageUrl = ogImage || twitterImage;

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
        { error: "Network error while fetching the URL. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
