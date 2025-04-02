
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";
import ProductFormDialog from "@/components/scan/ProductFormDialog";
import { Product } from "@/types/inventory";
import CameraScanTab from "@/components/scan/CameraScanTab";
import VideoScanTab from "@/components/scan/VideoScanTab";

const Scan = () => {
  const [tab, setTab] = useState("camera");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [capturedImageForForm, setCapturedImageForForm] = useState<string | undefined>(undefined);
  const [analysisForForm, setAnalysisForForm] = useState<string | undefined>(undefined);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });

  const handleOpenProductForm = (imageData?: string, analysisResult?: string) => {
    setCapturedImageForForm(imageData);
    setAnalysisForForm(analysisResult);
    setProductFormOpen(true);
  };

  const handleProductSuccess = (product: Product) => {
    setProductFormOpen(false);
    // Could refresh products here if needed
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
            <CameraScanTab
              products={products}
              onOpenProductForm={handleOpenProductForm}
            />
          </TabsContent>

          <TabsContent value="upload">
            <VideoScanTab
              products={products}
              onOpenProductForm={handleOpenProductForm}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        initialValues={{
          image: capturedImageForForm,
        }}
        rawAnalysis={analysisForForm}
        onSuccess={handleProductSuccess}
      />
    </Layout>
  );
};

export default Scan;
