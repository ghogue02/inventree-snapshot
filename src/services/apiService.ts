
// Re-export all API services from their individual modules
export * from "./api/productService";
export * from "./api/invoiceService";
export * from "./api/inventoryService";
export * from "./api/visionService";

// For local development & testing without a real video processing service
export const processInventoryVideo = async (file: File): Promise<any[]> => {
  try {
    // Create FormData object to send file
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://mxaclcxvjvmnhkwkjsic.supabase.co/functions/v1/process-inventory', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process video');
    }

    const data = await response.json();
    
    // Transform response into the expected inventory items format
    const items = data.items.map((item: any) => ({
      productId: '',  // Will need to be matched against inventory
      name: item.name,
      count: item.count || 1,
      confidence: 0.9,
      size: item.size || ''
    }));

    return items;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};
