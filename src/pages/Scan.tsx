import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
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

const Scan = () => {
  const isMobile = useIsMobile();
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = useConnectivity();
  
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
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    goToAddProduct,
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

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-4">
        <ScanHeader
          isOnline={isOnline}
          isSyncing={isSyncing}
          onSync={handleSync}
        />
        
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
