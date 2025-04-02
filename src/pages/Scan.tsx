
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";
import useScanAnalysis from "@/hooks/useScanAnalysis";
import CameraCapture from "@/components/scan/CameraCapture";
import VideoUploader from "@/components/scan/VideoUploader";
import AnalysisResults from "@/components/scan/AnalysisResults";
import BatchScanResults from "@/components/scan/BatchScanResults";
import { Camera, Scan as ScanIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Scan = () => {
  const [tab, setTab] = useState("camera");
  const isMobile = useIsMobile();

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
    scanMode,
    setScanMode,
    selectedItemIndex,
    selectItem,
    resetCapture,
    analyzeImage,
    processVideo,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    goToAddProduct,
    handleFileSelected,
    checkIfItemExists,
    addToInventory
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
      <div className={`${isMobile ? 'p-2' : 'p-6'}`}>
        <Tabs defaultValue="camera" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <Card className={isMobile ? "overflow-hidden shadow-sm" : ""}>
              <CardContent className={isMobile ? "p-3" : "p-6 space-y-4"}>
                <div className="flex justify-center mb-4">
                  <ToggleGroup type="single" value={scanMode} onValueChange={(value) => value && setScanMode(value as 'single' | 'shelf')}>
                    <ToggleGroupItem value="single" className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      Single Item
                    </ToggleGroupItem>
                    <ToggleGroupItem value="shelf" className="flex items-center gap-1">
                      <ScanIcon className="h-4 w-4" />
                      Shelf Scan
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <CameraCapture 
                  capturedImage={capturedImage}
                  onImageCaptured={handleImageCaptured}
                  onResetCapture={resetCapture}
                  isAnalyzing={isAnalyzing}
                  scanMode={scanMode}
                />
              </CardContent>
            </Card>

            {analysisResult && recognizedItems.length > 0 && (
              scanMode === 'shelf' ? (
                <BatchScanResults
                  analysisResult={analysisResult}
                  recognizedItems={recognizedItems}
                  products={products}
                  onSaveInventoryCounts={saveInventoryCounts}
                  onGoToAddProduct={goToAddProduct}
                  onResetCapture={resetCapture}
                  onUpdateItem={updateRecognizedItem}
                  onRemoveItem={removeRecognizedItem}
                  onAddToInventory={addToInventory}
                  checkIfItemExists={checkIfItemExists}
                />
              ) : (
                <AnalysisResults 
                  analysisResult={analysisResult}
                  recognizedItems={recognizedItems}
                  products={products}
                  onSaveInventoryCounts={saveInventoryCounts}
                  onGoToAddProduct={goToAddProduct}
                  onResetCapture={resetCapture}
                  onUpdateItem={updateRecognizedItem}
                  onRemoveItem={removeRecognizedItem}
                  onAddToInventory={addToInventory}
                  checkIfItemExists={checkIfItemExists}
                />
              )
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardContent className={isMobile ? "p-3" : "p-6 space-y-4"}>
                <VideoUploader 
                  onVideoSelected={handleFileSelected}
                  isProcessing={isUploading} 
                  onProcessVideo={processVideo}
                />

                {recognizedItems.length > 0 && (
                  <BatchScanResults
                    analysisResult={analysisResult || ""}
                    recognizedItems={recognizedItems}
                    products={products}
                    onSaveInventoryCounts={saveInventoryCounts}
                    onGoToAddProduct={goToAddProduct}
                    onResetCapture={resetCapture}
                    onUpdateItem={updateRecognizedItem}
                    onRemoveItem={removeRecognizedItem}
                    onAddToInventory={addToInventory}
                    checkIfItemExists={checkIfItemExists}
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
