
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";
import useScanAnalysis from "@/hooks/useScanAnalysis";
import ProductFormDialog from "@/components/scan/ProductFormDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { syncPendingData } from "@/services/syncService";
import { useConnectivity } from "@/hooks/use-connectivity";
import { useOfflineStore } from "@/stores/offlineStore";
import ScanHeader from "@/components/scan/ScanHeader";
import CameraScanTab from "@/components/scan/CameraScanTab";
import VideoScanTab from "@/components/scan/VideoScanTab";

const Scan = () => {
  const [tab, setTab] = useState("camera");
  const isMobile = useIsMobile();
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
    if (isMobile && tab === "camera") {
      // Set body overflow to hidden when camera is active on mobile
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, tab]);
  
  useEffect(() => {
    const attemptAutoSync = async () => {
      try {
        await syncPendingData();
        await refetchProducts();
      } catch (err) {
        console.error("Auto sync error:", err);
      }
    };
    
    // Check for pending items in offline store
    const pendingCounts = useOfflineStore.getState().pendingInventoryCounts.filter(c => !c.synced).length;
    const pendingImages = useOfflineStore.getState().pendingImageRequests.filter(r => !r.processed).length;
    
    if (pendingCounts > 0 || pendingImages > 0) {
      const { isOnline } = useConnectivity.getState();
      if (isOnline) {
        attemptAutoSync();
      }
    }
  }, [refetchProducts]);

  return (
    <Layout 
      title="Scan Inventory" 
      description="Use your camera to automatically count inventory items"
    >
      <div className={`${isMobile ? 'p-0 sm:p-2' : 'p-6'}`}>
        <ScanHeader onSyncData={handleSync} isSyncing={isSyncing} />
        
        <Tabs defaultValue="camera" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera">
            <CameraScanTab
              capturedImage={capturedImage}
              onImageCaptured={handleImageCaptured}
              onResetCapture={resetCapture}
              isAnalyzing={isAnalyzing}
              scanMode={scanMode}
              setScanMode={setScanMode}
              analysisResult={analysisResult}
              recognizedItems={recognizedItems}
              products={products}
              onSaveInventoryCounts={saveInventoryCounts}
              onGoToAddProduct={goToAddProduct}
              onUpdateItem={updateRecognizedItem}
              onRemoveItem={removeRecognizedItem}
              onAddToInventory={addToInventory}
              checkIfItemExists={checkIfItemExists}
              selectedItemIndex={selectedItemIndex}
              onSelectItem={selectItem}
              onUndoLastAction={undoLastAction}
              autoAdvance={autoAdvance}
              setAutoAdvance={setAutoAdvance}
            />
          </TabsContent>

          <TabsContent value="upload">
            <VideoScanTab
              isProcessing={isUploading}
              onVideoSelected={handleFileSelected}
              onProcessVideo={processVideo}
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
              analysisResult={analysisResult}
            />
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
