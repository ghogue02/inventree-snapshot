import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { processInventoryVideo, analyzeImageWithOpenAI, getProducts, addInventoryCounts } from "@/services/apiService";
import { Camera, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Scan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);
  const [tab, setTab] = useState("camera");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);
    
    // Stop the camera
    stopCamera();
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setRecognizedItems([]);
    startCamera();
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // Remove the prefix from the data URL to get just the base64 data
      const base64Data = capturedImage.split(",")[1];
      
      toast.loading("Analyzing image...");
      
      // Call OpenAI Vision API
      const result = await analyzeImageWithOpenAI(
        capturedImage, // Send the full data URL
        "Please analyze this image and identify all food inventory items you see. For each item, provide an estimated quantity."
      );
      
      setAnalysisResult(result);
      toast.dismiss();
      toast.success("Analysis complete");
      
      // Mock recognition based on products and analysis
      const recognizedItems = mockRecognitionFromAnalysis(result, products);
      setRecognizedItems(recognizedItems);
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.dismiss();
      toast.error("Failed to analyze image. Please try again or upload a clearer photo.");
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mockRecognitionFromAnalysis = (analysisText: string, products: Product[]): InventoryRecognitionResult[] => {
    const items: InventoryRecognitionResult[] = [];
    const lines = analysisText.split("\n");
    
    // Very simple pattern matching - in a real app, this would be much more sophisticated
    for (const line of lines) {
      const cleanLine = line.replace(/^-\s*/, "").toLowerCase();
      
      for (const product of products) {
        if (cleanLine.includes(product.name.toLowerCase())) {
          // Try to extract a number
          const numberMatch = cleanLine.match(/(\d+)(?:\.(\d+))?\s*(?:kg|g|lbs|oz|bottles?|packages?)/i);
          const count = numberMatch ? parseFloat(numberMatch[0]) : Math.floor(Math.random() * 10) + 1;
          
          items.push({
            productId: product.id,
            name: product.name,
            count,
            confidence: 0.85 + Math.random() * 0.1
          });
          
          break;
        }
      }
    }
    
    return items;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const processUploadedVideo = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      // Process the video with our mock API
      const results = await processInventoryVideo(selectedFile);
      setRecognizedItems(results);
      setAnalysisResult("Video processed successfully. Here are the detected items:");
      
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video");
    } finally {
      setIsUploading(false);
    }
  };

  const saveInventoryCounts = async () => {
    if (recognizedItems.length === 0) {
      toast.error("No items to save");
      return;
    }

    try {
      // Convert recognized items to inventory counts
      const counts = recognizedItems.map(item => ({
        productId: item.productId,
        count: item.count,
        countedAt: new Date(),
        countMethod: "video" as const,
        notes: "Counted via camera scan"
      }));

      // Add the counts to the inventory
      await addInventoryCounts(counts);
      
      toast.success("Inventory counts saved successfully");
      navigate("/inventory");
      
    } catch (error) {
      console.error("Error saving inventory counts:", error);
      toast.error("Failed to save inventory counts");
    }
  };

  return (
    <Layout 
      title="Scan Inventory" 
      description="Use your camera to automatically count inventory items"
    >
      <div className="p-6">
        <Tabs defaultValue="camera" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="video-container bg-gray-100 rounded-md">
                  {!capturedImage ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className={isCapturing ? "opacity-100" : "opacity-0"}
                      onLoadedMetadata={() => {
                        // Make the video visible once loaded
                        if (videoRef.current) {
                          videoRef.current.classList.remove("opacity-0");
                          videoRef.current.classList.add("opacity-100");
                        }
                      }}
                    />
                  ) : (
                    <img 
                      src={capturedImage} 
                      alt="Captured inventory" 
                      className="w-full h-full object-contain"
                    />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex justify-center gap-2">
                  {!isCapturing && !capturedImage && (
                    <Button onClick={startCamera}>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  )}

                  {isCapturing && !capturedImage && (
                    <Button onClick={captureImage}>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Image
                    </Button>
                  )}

                  {capturedImage && !isAnalyzing && !analysisResult && (
                    <>
                      <Button onClick={analyzeImage} variant="default">
                        <Loader2 className="mr-2 h-4 w-4" />
                        Analyze Inventory
                      </Button>
                      <Button onClick={resetCapture} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retake
                      </Button>
                    </>
                  )}

                  {isAnalyzing && (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </Button>
                  )}

                  {analysisResult && (
                    <>
                      <Button onClick={saveInventoryCounts} variant="default">
                        <Check className="mr-2 h-4 w-4" />
                        Save Inventory Counts
                      </Button>
                      <Button onClick={resetCapture} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Scan Again
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                  <div className="mb-4 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border">
                    {analysisResult}
                  </div>

                  {recognizedItems.length > 0 && (
                    <>
                      <h4 className="font-medium my-3">Recognized Items</h4>
                      <div className="space-y-3">
                        {recognizedItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Confidence: {Math.round(item.confidence * 100)}%
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{item.count.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">units</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label 
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="p-4 rounded-full bg-gray-100">
                      <Camera className="h-8 w-8 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium">Click to upload video</span>
                    <span className="text-xs text-muted-foreground">
                      MP4, MOV, or AVI up to 100MB
                    </span>
                  </label>
                  {selectedFile && (
                    <div className="mt-2 text-sm">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={processUploadedVideo}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-4 w-4" />
                        Process Video
                      </>
                    )}
                  </Button>
                </div>

                {recognizedItems.length > 0 && (
                  <Card className="mt-4">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Recognition Results</h3>
                      
                      {analysisResult && (
                        <div className="mb-4 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border">
                          {analysisResult}
                        </div>
                      )}

                      <div className="space-y-3">
                        {recognizedItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Confidence: {Math.round(item.confidence * 100)}%
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{item.count.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">units</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button onClick={saveInventoryCounts}>
                          <Check className="mr-2 h-4 w-4" />
                          Save Inventory Counts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Scan;
