import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: "Google AI API key not configured",
          setup: {
            message: "To enable Gemini chat functionality, please:",
            steps: [
              "1. Get a Google AI API key from https://makersuite.google.com/app/apikey",
              "2. Add it to your environment variables as GOOGLE_AI_API_KEY",
              "3. Restart your development server",
            ],
          },
        },
        { status: 400 },
      )
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Start a chat session with history
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    })

    // Send message and get response
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      response: text,
      success: true,
    })
  } catch (error: any) {
    console.error("Gemini API error:", error)

    // Handle specific API errors
    if (error.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        {
          error: "Invalid Google AI API key",
          setup: {
            message: "Please check your API key configuration",
            steps: ["Verify your API key at https://makersuite.google.com/app/apikey"],
          },
        },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to get response from Gemini",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
