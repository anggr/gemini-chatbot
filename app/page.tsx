"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ImageIcon, Video, Sparkles } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import ImageGenerator from "@/components/image-generator"
import VideoGenerator from "@/components/video-generator"

type ActiveTool = "chat" | "image" | "video"

export default function Home() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("chat")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-50/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-black text-xl text-foreground">Gemini AI Studio</h1>
                <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Button
                variant={activeTool === "chat" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("chat")}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
              <Button
                variant={activeTool === "image" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("image")}
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Images
              </Button>
              <Button
                variant={activeTool === "video" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTool("video")}
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                Videos
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Only show when no tool is active or on first load */}
      {!activeTool && (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-black text-5xl md:text-6xl text-foreground mb-6 leading-tight">
              Unleash Your Creativity with AI
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Chat, Create, and Collaborate with Google Gemini
            </p>
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg font-semibold"
              onClick={() => setActiveTool("chat")}
            >
              Start Creating Now
            </Button>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {activeTool === "chat" && <ChatInterface />}
          {activeTool === "image" && <ImageGenerator />}
          {activeTool === "video" && <VideoGenerator />}
        </div>
      </main>
    </div>
  )
}
