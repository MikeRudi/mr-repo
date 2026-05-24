import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(req) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error: "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN.",
        },
        { status: 501 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing image file." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported image type." },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image must be 5MB or smaller." },
        { status: 413 }
      );
    }

    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const pathname = `builder-images/${Date.now()}-${safeName || "image"}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Failed to upload image." },
      { status: 500 }
    );
  }
}
