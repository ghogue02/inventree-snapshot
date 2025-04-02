import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";
import useScanAnalysis from "@/hooks/useScanAnalysis";
import CameraCapture from "@/components/scan/CameraCapture";
import VideoUploader from "@/components/scan/VideoUploader";
import AnalysisResults from "@/components/scan/AnalysisResults";
import BatchScanResults from "@/components/scan/BatchScanResults";
import ProductFormDialog from "@/components/scan/ProductFormDialog";
import { Camera, Scan as ScanIcon, RefreshCcw, WifiOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConnectivity } from "@/hooks/use-connectivity";
import { useOfflineStore } from "@/stores/offlineStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { syncPendingData } from "@/services/syncService";

const Scan = () => {
  const [tab, setTab] = useState("camera");
  const isMobile = useIsMobile();
  const { isOnline, connectionStatus } = useConnectivity();
  const pendingCounts = useOfflineStore(
    state => state.pendingInventoryCounts.filter(c => !c.synced).length
  );
  const pendingImages = useOfflineStore(
    state => state.pendingImageRequests.filter(r => !r.processed).length
  );
  
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: products = [], refetch: refetchProducts } = useQuery({
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
    addToInventory,
    productFormOpen,
    setProductFormOpen,
    currentItemToAdd,
    handleProductAdded,
    undoLastAction,
    autoAdvance,
    setAutoAdvance
  } = useScanAnalysis(products);

  const handleImageCaptured = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    analyzeImage(imageDataUrl);
  };

  const handleProductSuccess = async (product) => {
    await refetchProducts();
    handleProductAdded(product);
  };
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingData();
      await refetchProducts();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  useEffect(() => {
    if (isOnline && (pendingCounts > 0 || pendingImages > 0)) {
      syncPendingData()
        .then(() => refetchProducts())
        .catch(err => console.error("Auto sync error:", err));
    }
  }, [isOnline, pendingCounts, pendingImages, refetchProducts]);

  return (
    <Layout 
      title="Scan Inventory" 
      description="Use your camera to automatically count inventory items"
    >
      <div className={`${isMobile ? 'p-0 sm:p-2' : 'p-6'}`}>
        {(pendingCounts > 0 || pendingImages > 0) && (
          <Alert variant={isOnline ? "default" : "destructive"} className="mb-4 bg-amber-50">
            <AlertDescription className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {!isOnline && <WifiOff className="h-4 w-4" />}
                <span>
                  {isOnline 
                    ? `You have ${pendingCounts + pendingImages} items waiting to sync`
                    : `You're offline with ${pendingCounts + pendingImages} pending items`}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                disabled={!isOnline || isSyncing}
                onClick={handleSync}
              >
                <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="camera" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <Card className={isMobile ? "overflow-hidden shadow-sm border-0 sm:border" : ""}>
              <CardContent className={isMobile ? "p-0 sm:p-3" : "p-6 space-y-4"}>
                <div className={`flex justify-between items-center ${isMobile ? 'p-3' : 'mb-4'}`}>
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
                  
                  {scanMode === 'shelf' && (
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="auto-advance" 
                        checked={autoAdvance}
                        onCheckedChange={setAutoAdvance}
                      />
                      <Label htmlFor="auto-advance" className="text-sm">Auto-advance</Label>
                    </div>
                  )}
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
                  selectedItemIndex={selectedItemIndex}
                  onSelectItem={selectItem}
                  onUndoLastAction={undoLastAction}
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
                    selectedItemIndex={selectedItemIndex}
                    onSelectItem={selectItem}
                    onUndoLastAction={undoLastAction}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        initialValues={currentItemToAdd ? {
          name: currentItemToAdd.name,
          size: currentItemToAdd.size,
          currentStock: currentItemToAdd.count
        } : undefined}
        rawAnalysis={analysisResult || undefined}
        onSuccess={handleProductSuccess}
      />
    </Layout>
  );
};

export default Scan;
