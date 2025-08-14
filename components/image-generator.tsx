"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Download, Loader2, AlertCircle, Sparkles, Copy, Check } from "lucide-react"

interface ApiError {
  error: string
  setup?: {
    message: string
    steps: string[]
  }
  details?: string
}

interface GeneratedImage {
  url: string
  prompt: string
  revisedPrompt?: string
  timestamp: Date
  settings: {
    size: string
    quality: string
    style: string
  }
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [size, setSize] = useState("1024x1024")
  const [quality, setQuality] = useState("standard")
  const [style, setStyle] = useState("vivid")
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)

  const generateImage = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          quality,
          style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data as ApiError)
        return
      }

      const newImage: GeneratedImage = {
        url: data.imageUrl,
        prompt: prompt.trim(),
        revisedPrompt: data.revisedPrompt,
        timestamp: new Date(),
        settings: { size, quality, style },
      }

      setGeneratedImages((prev) => [newImage, ...prev])
      setPrompt("")
    } catch (error) {
      console.error("Error generating image:", error)
      setError({
        error: "Network error occurred. Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `generated-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPrompt(text)
      setTimeout(() => setCopiedPrompt(null), 2000)
    } catch (err) {
      console.error("Failed to copy prompt:", err)
    }
  }

  const examplePrompts = [
    "A futuristic cityscape at sunset with flying cars and neon lights",
    "A serene mountain landscape with a crystal clear lake reflecting the sky",
    "A cozy coffee shop interior with warm lighting and vintage furniture",
    "An abstract digital art piece with vibrant colors and geometric shapes",
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">Generate Images</h3>
            <p className="text-sm text-muted-foreground">Create stunning images with AI using detailed descriptions</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{error.error}</p>
                  {error.details && <p className="text-sm">{error.details}</p>}
                  {error.setup && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">{error.setup.message}</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {error.setup.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="min-h-[120px]"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{prompt.length}/1000 characters</p>
            </div>

            {/* Example Prompts */}
            <div>
              <label className="text-sm font-medium mb-2 block">Example Prompts</label>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 bg-transparent"
                    onClick={() => setPrompt(example)}
                  >
                    {example.slice(0, 30)}...
                  </Button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                    <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                    <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Quality</label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD (Higher Cost)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vivid">Vivid</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Output Panel */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">Generated Images</h3>

          {generatedImages.length === 0 ? (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Your generated images will appear here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {generatedImages.map((image, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Generated: ${image.prompt}`}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => downloadImage(image.url, image.prompt)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => copyPrompt(image.prompt)}
                      >
                        {copiedPrompt === image.prompt ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    {image.revisedPrompt && image.revisedPrompt !== image.prompt && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium">AI Revised:</p>
                        <p className="line-clamp-2">{image.revisedPrompt}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {image.settings.size}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {image.settings.quality}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {image.settings.style}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {image.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
