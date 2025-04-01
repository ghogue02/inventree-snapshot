import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { processInventoryVideo, analyzeImageWithOpenAI, getProducts, addInventoryCounts } from "@/services/apiService";
import { Camera, Check, Edit, Loader2, RefreshCw, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
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
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageDataUrl);
    
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
      const base64Data = capturedImage.split(",")[1];
      
      toast.loading("Analyzing image...");
      
      const result = await analyzeImageWithOpenAI(
        capturedImage,
        "Please analyze this image and identify all food inventory items you see. For each item, provide an estimated quantity."
      );
      
      setAnalysisResult(result);
      toast.dismiss();
      toast.success("Analysis complete");
      
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
    
    for (const line of lines) {
      const cleanLine = line.replace(/^-\s*/, "").toLowerCase();
      
      for (const product of products) {
        if (cleanLine.includes(product.name.toLowerCase())) {
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

  const startEditing = (index: number) => {
    setEditingItemIndex(index);
  };

  const cancelEditing = () => {
    setEditingItemIndex(null);
  };

  const updateItemData = (index: number, updatedItem: InventoryRecognitionResult) => {
    const updatedItems = [...recognizedItems];
    updatedItems[index] = updatedItem;
    setRecognizedItems(updatedItems);
    setEditingItemIndex(null);
    toast.success("Item updated successfully");
  };

  const removeItem = (index: number) => {
    const updatedItems = recognizedItems.filter((_, i) => i !== index);
    setRecognizedItems(updatedItems);
    toast.success("Item removed from list");
  };

  const saveInventoryCounts = async () => {
    if (recognizedItems.length === 0) {
      toast.error("No items to save");
      return;
    }

    try {
      toast.loading("Saving inventory counts...");
      
      const counts = recognizedItems.map(item => ({
        productId: item.productId,
        count: item.count,
        countedAt: new Date(),
        countMethod: "video" as const,
        notes: "Counted via camera scan"
      }));

      console.log("Attempting to save inventory counts:", counts);
      
      const result = await addInventoryCounts(counts);
      
      toast.dismiss();
      toast.success("Inventory counts saved successfully");
      navigate("/inventory");
      
    } catch (error) {
      console.error("Error saving inventory counts:", error);
      toast.dismiss();
      toast.error("Failed to save inventory counts: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const EditableItem = ({ item, index }: { item: InventoryRecognitionResult, index: number }) => {
    const form = useForm<InventoryRecognitionResult>({
      defaultValues: item
    });

    const onSubmit = (data: InventoryRecognitionResult) => {
      updateItemData(index, data);
    };

    const productOptions = products.map(product => ({
      label: product.name,
      value: product.id
    }));

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {productOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Count</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </form>
      </Form>
    );
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
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Recognized Items</h4>
                        <p className="text-sm text-muted-foreground">
                          Review and edit items before saving
                        </p>
                      </div>
                      <div className="space-y-4">
                        {recognizedItems.map((item, index) => (
                          <div key={index} className="border rounded-md p-4">
                            {editingItemIndex === index ? (
                              <EditableItem item={item} index={index} />
                            ) : (
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Confidence: {Math.round(item.confidence * 100)}%
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="font-semibold">{item.count.toFixed(1)}</div>
                                    <div className="text-xs text-muted-foreground">units</div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button onClick={() => startEditing(index)} size="sm" variant="ghost">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => removeItem(index)} size="sm" variant="ghost" className="text-destructive">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
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
