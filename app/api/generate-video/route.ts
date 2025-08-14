import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      duration = 4,
      aspectRatio = "16:9",
      model = "veo-3-fast",
    } = await request.json();

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: "Google AI API key not configured",
          setup: {
            message: "To enable video generation with Google Gemini, please:",
            steps: [
              "1. Get your API key from https://aistudio.google.com/app/apikey",
              "2. Add GOOGLE_AI_API_KEY to your environment variables",
              "3. Restart your development server",
            ],
          },
        },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // The "Video" response modality is not supported in the current API version
    return NextResponse.json(
      {
        error: "Video generation not yet available",
        message:
          "Video generation through the Gemini API is currently not available via the direct API. This feature is still in development.",
        details: {
          prompt: prompt.trim(),
          requestedDuration: duration,
          requestedAspectRatio: aspectRatio,
          requestedModel: model,
        },
        status: "coming_soon",
        alternatives: [
          "Video generation may be available through Google Cloud Vertex AI",
          "Check back for updates as Google continues to expand Gemini capabilities",
        ],
      },
      { status: 501 } // Not Implemented
    );
  } catch (error: any) {
    console.error("Video generation error:", error);

    return NextResponse.json(
      {
        error: "Video generation service unavailable",
        details: error.message || "Unknown error occurred",
        note: "Video generation with Gemini is not yet supported through the direct API",
      },
      { status: 503 }
    );
  }
}
