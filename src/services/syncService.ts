
import { toast } from 'sonner';
import { useOfflineStore } from '@/stores/offlineStore';
import { addInventoryCounts, analyzeImageWithOpenAI, analyzeShelfImage } from '@/services/apiService';

export const syncPendingData = async () => {
  const {
    pendingImageRequests,
    pendingInventoryCounts,
    markImageRequestProcessed,
    markInventoryCountSynced,
    cacheRecognizedItems,
    setConnectionStatus
  } = useOfflineStore.getState();
  
  if (pendingImageRequests.length === 0 && pendingInventoryCounts.length === 0) {
    return { success: true, message: 'No pending data to sync' };
  }
  
  try {
    setConnectionStatus('syncing');
    toast.loading('Syncing offline data...');
    
    // Process pending image analyses first
    for (const request of pendingImageRequests.filter(req => !req.processed)) {
      try {
        let result;
        
        if (request.scanMode === 'shelf') {
          result = await analyzeShelfImage(request.imageData);
          if (result && result.items) {
            cacheRecognizedItems(request.id, result.items);
          }
        } else {
          const analysisText = await analyzeImageWithOpenAI(
            request.imageData,
            "Please analyze this image and identify all food inventory items you see. For each item, include the specific product name, size/volume information, and quantity as individual units."
          );
          
          // We don't have product information here to match items
          // Just store the raw analysis text
          if (analysisText) {
            cacheRecognizedItems(request.id, []);
          }
        }
        
        markImageRequestProcessed(request.id);
      } catch (error) {
        console.error('Failed to sync image request:', request.id, error);
        // Continue with other requests even if one fails
      }
    }
    
    // Sync inventory counts
    const unsyncedCounts = pendingInventoryCounts.filter(count => !count.synced);
    if (unsyncedCounts.length > 0) {
      const countsForApi = unsyncedCounts.map(count => ({
        productId: count.productId,
        count: count.count,
        countedAt: new Date(count.countedAt),
        countMethod: count.countMethod,
        notes: count.notes || 'Counted offline (synced later)'
      }));
      
      try {
        await addInventoryCounts(countsForApi);
        unsyncedCounts.forEach(count => markInventoryCountSynced(count.id));
      } catch (error) {
        console.error('Failed to sync inventory counts:', error);
        throw error;
      }
    }
    
    toast.dismiss();
    toast.success('Sync completed successfully');
    setConnectionStatus('online');
    
    return { success: true, message: 'Sync completed' };
  } catch (error) {
    toast.dismiss();
    toast.error('Sync failed. Will try again later.');
    setConnectionStatus('offline');
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error during sync' 
    };
  }
};
