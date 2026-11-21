import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    let session = null;
    try {
      session = await auth.api.getSession({
        headers: reqHeaders,
      });
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json(
        { error: "Image file is required under the 'image' field." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(image.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid image type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image size must not exceed 4 MB." },
        { status: 400 }
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: "Server upload service is not configured." },
        { status: 500 }
      );
    }

    const upstreamFormData = new FormData();
    upstreamFormData.append("image", image);

    const upstreamResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey.trim()}`,
      {
        method: "POST",
        body: upstreamFormData,
      }
    );

    const data = await upstreamResponse.json().catch(() => null);

    if (!upstreamResponse.ok || !data?.success || !data?.data?.url) {
      return NextResponse.json(
        { error: "Failed to upload image. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: data.data.url });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during image upload." },
      { status: 500 }
    );
  }
}
