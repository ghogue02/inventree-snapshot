import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { optimizeImage } from "@/utils/imageUtils";
import { toast } from "sonner";

interface CameraCaptureProps {
  capturedImage: string | null;
  onImageCaptured: (imageData: string) => void;
  onResetCapture: () => void;
  isAnalyzing: boolean;
  scanMode: 'single' | 'shelf';
}

const CameraCapture = ({
  onImageCaptured,
  isAnalyzing,
  scanMode
}: CameraCaptureProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setIsOptimizing(true);

      // Read the file
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Optimize the image
      const quality = scanMode === 'shelf' ? 0.9 : 0.95;
      const maxWidth = scanMode === 'shelf' ? 1800 : 1600;
      console.log(`Optimizing image with quality ${quality} and max width ${maxWidth}`);

      const optimizedImage = await optimizeImage(imageData, maxWidth, maxWidth, quality);
      console.log(`Optimized image size: ${Math.round(optimizedImage.length / 1024)}KB`);

      onImageCaptured(optimizedImage);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleFileUpload}
              disabled={isAnalyzing || isOptimizing}
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">Upload an Image</p>
                <p className="text-sm text-muted-foreground">
                  {scanMode === 'single' 
                    ? 'Upload a photo of a single inventory item'
                    : 'Upload a photo of multiple items on a shelf'}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {(isAnalyzing || isOptimizing) && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isOptimizing ? 'Processing image...' : 'Analyzing image...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
