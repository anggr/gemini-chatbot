import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: "Google AI API key not configured",
          setup: {
            message: "To enable image generation with Gemini, please:",
            steps: [
              "1. Get a Google AI API key from https://aistudio.google.com/app/apikey",
              "2. Add GOOGLE_AI_API_KEY to your environment variables",
              "3. Restart your development server",
            ],
          },
        },
        { status: 400 },
      )
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    })

    const result = await model.generateContent([
      {
        text: `Generate an image based on this prompt: ${prompt.trim()}`,
      },
    ])

    const response = await result.response

    // Find the image part in the response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.mimeType?.startsWith("image/"),
    )

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        {
          error: "No image generated",
          details: "Gemini did not return an image in the response",
        },
        { status: 500 },
      )
    }

    // Convert base64 image data to data URL
    const imageData = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType
    const imageUrl = `data:${mimeType};base64,${imageData}`

    return NextResponse.json({
      imageUrl,
      success: true,
      model: "gemini-2.0-flash-exp",
    })
  } catch (error: any) {
    console.error("Gemini image generation error:", error)

    // Handle specific Gemini API errors
    if (error.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        {
          error: "Invalid Google AI API key",
          setup: {
            message: "Please check your Google AI API key",
            steps: ["Verify your API key is correct and active"],
          },
        },
        { status: 401 },
      )
    }

    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return NextResponse.json(
        {
          error: "API quota exceeded",
          details: "You've reached your Google AI API usage limit",
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
