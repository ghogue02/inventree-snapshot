
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "@/components/ProductForm";
import { analyzeProductWithOpenAI } from "@/services/api/visionService"; 

const AddProduct = () => {
  const [tab, setTab] = useState("form");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaStreamRef, setMediaStreamRef] = useState<MediaStream | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef) {
        videoRef.srcObject = stream;
        setMediaStreamRef(stream);
        setIsCapturing(true);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef) {
      mediaStreamRef.getTracks().forEach(track => track.stop());
      setMediaStreamRef(null);
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (!videoRef || !canvasRef) return;
    
    const video = videoRef;
    const canvas = canvasRef;
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
    startCamera();
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      toast.loading("Analyzing product...");
      
      const result = await analyzeProductWithOpenAI(capturedImage);
      
      setAnalysisResult(result);
      toast.dismiss();
      toast.success("Analysis complete");
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.dismiss();
      toast.error("Failed to analyze product. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCapturedImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout 
      title="Add Product" 
      description="Add a new product to your inventory"
    >
      <div className="p-6">
        <Tabs defaultValue="form" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="form">Manual Entry</TabsTrigger>
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Card>
              <CardContent className="p-6">
                <ProductForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="camera">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="video-container bg-gray-100 rounded-md aspect-video relative">
                  {!capturedImage ? (
                    <video 
                      ref={node => setVideoRef(node)}
                      autoPlay 
                      playsInline
                      className={`w-full h-full object-cover ${isCapturing ? "opacity-100" : "opacity-0"}`}
                      onLoadedMetadata={() => {
                        if (videoRef) {
                          videoRef.classList.remove("opacity-0");
                          videoRef.classList.add("opacity-100");
                        }
                      }}
                    />
                  ) : (
                    <img 
                      src={capturedImage} 
                      alt="Captured product" 
                      className="w-full h-full object-contain"
                    />
                  )}
                  <canvas ref={node => setCanvasRef(node)} className="hidden" />
                </div>

                <div className="flex justify-center gap-2">
                  {!isCapturing && !capturedImage && (
                    <button 
                      onClick={startCamera}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </button>
                  )}

                  {isCapturing && !capturedImage && (
                    <button 
                      onClick={captureImage}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Capture Image
                    </button>
                  )}

                  {capturedImage && !isAnalyzing && !analysisResult && (
                    <>
                      <button 
                        onClick={analyzeImage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
                      >
                        <Loader2 className="h-4 w-4" />
                        Analyze Product
                      </button>
                      <button 
                        onClick={resetCapture}
                        className="border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Retake
                      </button>
                    </>
                  )}

                  {isAnalyzing && (
                    <button 
                      disabled
                      className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 opacity-70"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <ProductForm 
                    initialValues={analysisResult.product} 
                    rawAnalysis={analysisResult.rawAnalysis} 
                  />
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
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="product-upload"
                  />
                  <label 
                    htmlFor="product-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="p-4 rounded-full bg-gray-100">
                      <Upload className="h-8 w-8 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG or GIF up to 10MB
                    </span>
                  </label>
                  
                  {capturedImage && (
                    <div className="mt-4">
                      <img 
                        src={capturedImage} 
                        alt="Uploaded product" 
                        className="max-h-[200px] mx-auto object-contain"
                      />
                      <div className="flex justify-center gap-2 mt-4">
                        {!analysisResult && (
                          <>
                            <button 
                              onClick={analyzeImage}
                              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Loader2 className="h-4 w-4" />
                                  Analyze Product
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => setCapturedImage(null)}
                              className="border border-gray-300 px-4 py-2 rounded-md"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {analysisResult && (
                  <ProductForm 
                    initialValues={analysisResult.product} 
                    rawAnalysis={analysisResult.rawAnalysis} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AddProduct;
