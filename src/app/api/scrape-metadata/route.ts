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

// Fallback scraper using Cheerio
async function fallbackScraper(url: string) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DevLibrary/1.0; +https://devlibrary.com)",
    },
    timeout: 5000,
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
    // Try Microlink API first (fast & reliable)
    const microlinkResponse = await axios.get(
      `https://api.microlink.io?url=${encodeURIComponent(url)}`,
      { timeout: 3000 }
    );

    if (microlinkResponse.data.status === "success") {
      const data = microlinkResponse.data.data;
      const metadata = {
        title: data.title || null,
        description: data.description || null,
        image: data.image?.url || data.logo?.url || null,
      };

      const responseData = {
        metadata,
        success: true,
        source: "microlink",
      };

      cache.set(url, responseData);
      return NextResponse.json(responseData);
    }
  } catch (microlinkError) {
    console.log("Microlink failed, trying fallback scraper...");
  }

  // Fallback to custom scraper
  try {
    const metadata = await fallbackScraper(url);

    const responseData = {
      metadata,
      success: true,
      source: "fallback",
    };

    cache.set(url, responseData);
    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error("Both scrapers failed:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { error: "Request timeout. The website took too long to respond." },
          { status: 504 }
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
