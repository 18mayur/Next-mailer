import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
        maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB per image
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}