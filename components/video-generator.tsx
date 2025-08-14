"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Video,
  Download,
  Loader2,
  AlertCircle,
  Play,
  Copy,
  Check,
  Clock,
} from "lucide-react";

interface ApiError {
  error: string;
  setup?: {
    message: string;
    steps: string[];
  };
  details?: string;
}

interface GeneratedVideo {
  url: string;
  prompt: string;
  timestamp: Date;
  settings: {
    duration: number;
    aspectRatio: string;
    model: string;
  };
  taskId?: string;
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([4]);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [model, setModel] = useState("gen3a_turbo");
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const generateVideo = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + Math.random() * 10, 90));
    }, 2000);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: duration[0],
          aspectRatio,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          error:
            typeof data.error === "string" ? data.error : "An error occurred",
          details:
            typeof data.details === "string"
              ? data.details
              : typeof data.message === "string"
              ? data.message
              : "Please try again",
          setup:
            data.setup && typeof data.setup === "object"
              ? data.setup
              : undefined,
        });
        return;
      }

      if (
        data.message &&
        typeof data.message === "string" &&
        data.message.includes("coming soon")
      ) {
        setError({
          error: "Video Generation Coming Soon",
          details: data.message,
        });
        return;
      }

      if (data.status === "processing") {
        setError({
          error: "Video generation in progress",
          details:
            typeof data.message === "string"
              ? data.message
              : "Your video is being processed",
        });
        return;
      }

      if (data.videoUrl) {
        const newVideo: GeneratedVideo = {
          url: data.videoUrl,
          prompt: prompt.trim(),
          timestamp: new Date(),
          settings: { duration: duration[0], aspectRatio, model },
          taskId: data.taskId,
        };

        setGeneratedVideos((prev) => [newVideo, ...prev]);
        setPrompt("");
      }
      setLoadingProgress(100);
    } catch (error) {
      console.error("Error generating video:", error);
      setError({
        error:
          "Network error occurred. Please check your connection and try again.",
      });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const downloadVideo = async (videoUrl: string, prompt: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(text);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const examplePrompts = [
    "A time-lapse of a flower blooming in a garden with morning sunlight",
    "Ocean waves crashing against rocky cliffs during a dramatic sunset",
    "A bustling city street with people walking and cars passing by",
    "Clouds moving across a mountain landscape in fast motion",
    "A campfire crackling with sparks flying up into the night sky",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">
              Generate Videos
            </h3>
            <p className="text-sm text-muted-foreground">
              Create dynamic videos with AI using detailed descriptions
            </p>
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
                placeholder="Describe the video you want to create..."
                className="min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {prompt.length}/500 characters
              </p>
            </div>

            {/* Example Prompts */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Example Prompts
              </label>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 bg-transparent"
                    onClick={() => setPrompt(example)}>
                    {example.slice(0, 35)}...
                  </Button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Duration: {duration[0]} seconds
                </label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={10}
                  min={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2s</span>
                  <span>10s</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Aspect Ratio
                  </label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Model
                  </label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gen3a_turbo">
                        Gen-3 Alpha Turbo
                      </SelectItem>
                      <SelectItem value="gen3a">Gen-3 Alpha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Loading Progress */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating video...</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={generateVideo}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700"
              size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Video generation typically takes 1-3 minutes
            </p>
          </div>
        </div>
      </Card>

      {/* Output Panel */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg">Generated Videos</h3>

          {generatedVideos.length === 0 ? (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Your generated videos will appear here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {generatedVideos.map((video, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative group">
                    <video
                      src={video.url || "/placeholder.svg"}
                      controls
                      className="w-full h-auto object-cover"
                      poster="/placeholder.svg?height=200&width=300"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadVideo(video.url, video.prompt)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-2">
                        {video.prompt}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => copyPrompt(video.prompt)}>
                        {copiedPrompt === video.prompt ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {video.settings.duration}s
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {video.settings.aspectRatio}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {video.settings.model}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {video.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
  );
}
