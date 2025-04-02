
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";
import useScanAnalysis from "@/hooks/useScanAnalysis";
import CameraCapture from "@/components/scan/CameraCapture";
import VideoUploader from "@/components/scan/VideoUploader";
import AnalysisResults from "@/components/scan/AnalysisResults";
import BatchScanResults from "@/components/scan/BatchScanResults";

const Scan = () => {
  const [tab, setTab] = useState("camera");
  const [scanMode, setScanMode] = useState<'single' | 'shelf'>('single');

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
      <div className="p-6">
        <Tabs defaultValue="camera" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => setScanMode('single')}
                      className={`px-4 py-2 text-sm font-medium ${
                        scanMode === 'single' 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-200 rounded-l-lg`}
                    >
                      Single Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanMode('shelf')}
                      className={`px-4 py-2 text-sm font-medium ${
                        scanMode === 'shelf' 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-200 rounded-r-lg`}
                    >
                      Shelf Scan
                    </button>
                  </div>
                </div>
                
                <CameraCapture 
                  capturedImage={capturedImage}
                  onImageCaptured={handleImageCaptured}
                  onResetCapture={resetCapture}
                  isAnalyzing={isAnalyzing}
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
              <CardContent className="p-6 space-y-4">
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
