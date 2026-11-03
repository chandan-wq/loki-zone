import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    if (!adminSession.authorized) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in form data." },
        { status: 400 }
      );
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/ogg",
      "video/x-m4v",
    ];

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file format. Supported formats: JPEG, PNG, WEBP, GIF, SVG for images; MP4, WebM, MOV for videos.",
        },
        { status: 400 }
      );
    }

    // Size limit: 15MB for images, 60MB for videos
    const MAX_SIZE = isVideo ? 60 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File exceeds maximum allowed size (${isVideo ? "60MB for video" : "15MB for image"}).`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const prefix = isVideo ? "video" : "media";
    const filename = `${prefix}_${cleanName}_${Date.now()}.${ext}`;

    const supabase = createAdminClient();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Admin Storage Upload Error]:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      filename,
      size: file.size,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin Upload Handler Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during image upload." },
      { status: 500 }
    );
  }
}
