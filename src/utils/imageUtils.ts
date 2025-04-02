
/**
 * Optimizes an image by resizing it to fit within maxWidth/maxHeight
 * and compressing it to the specified quality
 */
export const optimizeImage = async (
  imageDataUrl: string, 
  maxWidth = 1280, 
  maxHeight = 1280, 
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`Original image dimensions: ${img.width}x${img.height}`);
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      // Don't upscale images that are already smaller
      if (width > maxWidth) {
        height = Math.floor((height * maxWidth) / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.floor((width * maxHeight) / height);
        height = maxHeight;
      }
      
      console.log(`Resized dimensions: ${width}x${height}`);
      
      // Create canvas with new dimensions
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas with new dimensions
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Clear canvas with white background first
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get optimized data URL
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Check if optimization actually reduced the size
      if (optimizedDataUrl.length < imageDataUrl.length || width !== img.width || height !== img.height) {
        resolve(optimizedDataUrl);
      } else {
        // If optimization didn't help, return original
        resolve(imageDataUrl);
      }
    };
    
    img.onerror = (err) => {
      console.error('Error loading image for optimization', err);
      reject(new Error('Failed to load image for optimization'));
    };
    
    img.src = imageDataUrl;
  });
};

/**
 * Gets approximate size of a data URL in KB
 */
export const getDataUrlSize = (dataUrl: string): number => {
  // Rough estimation: base64 encoded size is about 4/3 of the actual binary size
  const base64 = dataUrl.split(',')[1];
  return base64 ? Math.round((base64.length * 3) / 4 / 1024) : 0;
};
