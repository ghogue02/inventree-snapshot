
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";
import { useScanAnalysis } from "@/hooks/useScanAnalysis";
import CameraCapture from "@/components/scan/CameraCapture";
import VideoUploader from "@/components/scan/VideoUploader";
import AnalysisResults from "@/components/scan/AnalysisResults";

const Scan = () => {
  const [tab, setTab] = useState("camera");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });

  const {
    capturedImage,
    setCapturedImage,
    isAnalyzing,
    analysisResult,
    recognizedItems,
    isUploading,
    resetCapture,
    analyzeImage,
    processVideo,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    goToAddProduct,
    handleFileSelected
  } = useScanAnalysis(products);

  const handleImageCaptured = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    analyzeImage(imageDataUrl);
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
                <CameraCapture 
                  capturedImage={capturedImage}
                  onImageCaptured={handleImageCaptured}
                  onResetCapture={resetCapture}
                  isAnalyzing={isAnalyzing}
                />
              </CardContent>
            </Card>

            {analysisResult && (
              <AnalysisResults 
                analysisResult={analysisResult}
                recognizedItems={recognizedItems}
                products={products}
                onSaveInventoryCounts={saveInventoryCounts}
                onGoToAddProduct={goToAddProduct}
                onResetCapture={resetCapture}
                onUpdateItem={updateRecognizedItem}
                onRemoveItem={removeRecognizedItem}
              />
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardContent className="p-6 space-y-4">
                <VideoUploader 
                  onVideoSelected={handleFileSelected}
                  isProcessing={isUploading} 
                  onProcessVideo={processVideo}
                />

                {recognizedItems.length > 0 && (
                  <AnalysisResults 
                    analysisResult={analysisResult || ""}
                    recognizedItems={recognizedItems}
                    products={products}
                    onSaveInventoryCounts={saveInventoryCounts}
                    onGoToAddProduct={goToAddProduct}
                    onResetCapture={resetCapture}
                    onUpdateItem={updateRecognizedItem}
                    onRemoveItem={removeRecognizedItem}
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

export default Scan;
