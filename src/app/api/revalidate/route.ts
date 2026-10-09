import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";

// Simple secret to prevent public abuse — set REVALIDATE_SECRET in .env
const SECRET = process.env.REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  const { secret, tags } = await req.json();

  if (SECRET && secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validTags = Object.values(CACHE_TAGS);
  const tagsToRevalidate: string[] = Array.isArray(tags)
    ? tags.filter((t) => validTags.includes(t))
    : validTags; // revalidate everything if no tags specified

  tagsToRevalidate.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ revalidated: tagsToRevalidate });
}
