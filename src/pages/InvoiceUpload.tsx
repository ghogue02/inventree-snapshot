
import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processInvoiceImage, addInvoice, getProducts } from "@/services/apiService";
import { Camera, FileText, Upload, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { InvoiceRecognitionResult, Product } from "@/types/inventory";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const InvoiceUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedInvoice, setRecognizedInvoice] = useState<InvoiceRecognitionResult | null>(null);
  
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!file.type.match('image.*')) {
      toast.error("Please select an image file");
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processInvoice = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);

    try {
      // Process the invoice with our mock API
      const result = await processInvoiceImage(selectedFile);
      setRecognizedInvoice(result);
      
    } catch (error) {
      console.error("Error processing invoice:", error);
      toast.error("Failed to process invoice");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveInvoice = async () => {
    if (!recognizedInvoice) {
      toast.error("No invoice data to save");
      return;
    }

    try {
      // Map recognized items to product IDs when possible
      const invoiceItems = recognizedInvoice.items.map(item => {
        // Try to find a matching product
        const matchedProduct = products.find(p => 
          p.name.toLowerCase() === item.name.toLowerCase()
        );
        
        return {
          id: "", // Will be set by the API
          invoiceId: "", // Will be set by the API
          productId: matchedProduct?.id || "",
          product: matchedProduct,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        };
      });
      
      // Create the invoice object
      const invoice = {
        supplierName: recognizedInvoice.supplierName || "Unknown Supplier",
        invoiceNumber: recognizedInvoice.invoiceNumber || `INV-${Date.now()}`,
        date: recognizedInvoice.date ? new Date(recognizedInvoice.date) : new Date(),
        total: recognizedInvoice.total || invoiceItems.reduce((sum, item) => sum + item.total, 0),
        paidStatus: "paid" as const,
        items: invoiceItems,
        imageUrl: previewUrl || undefined
      };
      
      // Add the invoice
      await addInvoice(invoice);
      
      toast.success("Invoice saved successfully");
      navigate("/invoices");
      
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <Layout 
      title="Upload Invoice" 
      description="Upload and process supplier invoices"
    >
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            {!previewUrl ? (
              // Upload area
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelection(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  ref={fileInputRef}
                />
                
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="p-4 rounded-full bg-gray-100">
                    <FileText className="h-10 w-10 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Upload Invoice Image</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Drag and drop an image file or click to browse
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleUploadClick} variant="default">
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                    <Button variant="outline" asChild>
                      <label htmlFor="camera" className="cursor-pointer">
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                        <input 
                          type="file" 
                          id="camera"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileSelection(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Preview and processing area
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image preview */}
                  <div className="w-full md:w-1/2">
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Invoice preview" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <div className="flex justify-between mt-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedFile(null);
                          setRecognizedInvoice(null);
                        }}
                      >
                        Change Image
                      </Button>
                      
                      {!recognizedInvoice && (
                        <Button
                          onClick={processInvoice}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Loader2 className="mr-2 h-4 w-4" />
                              Process Invoice
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Recognition results */}
                  <div className="w-full md:w-1/2">
                    {recognizedInvoice ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="supplier">Supplier</Label>
                              <Input 
                                id="supplier"
                                value={recognizedInvoice.supplierName || ""}
                                onChange={(e) => {
                                  setRecognizedInvoice({
                                    ...recognizedInvoice,
                                    supplierName: e.target.value
                                  });
                                }}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="invoice-number">Invoice Number</Label>
                              <Input 
                                id="invoice-number"
                                value={recognizedInvoice.invoiceNumber || ""}
                                onChange={(e) => {
                                  setRecognizedInvoice({
                                    ...recognizedInvoice,
                                    invoiceNumber: e.target.value
                                  });
                                }}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="date">Date</Label>
                              <Input 
                                id="date"
                                type="date"
                                value={recognizedInvoice.date || format(new Date(), "yyyy-MM-dd")}
                                onChange={(e) => {
                                  setRecognizedInvoice({
                                    ...recognizedInvoice,
                                    date: e.target.value
                                  });
                                }}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="total">Total</Label>
                              <Input 
                                id="total"
                                type="number"
                                value={recognizedInvoice.total || ""}
                                onChange={(e) => {
                                  setRecognizedInvoice({
                                    ...recognizedInvoice,
                                    total: parseFloat(e.target.value)
                                  });
                                }}
                              />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="font-medium mb-2">Items</h4>
                            
                            {recognizedInvoice.items.map((item, index) => (
                              <div 
                                key={index}
                                className="flex justify-between items-center mb-2 py-2 border-b"
                              >
                                <div className="flex-grow">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.quantity} x ${item.unitPrice.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-medium">${item.total.toFixed(2)}</p>
                              </div>
                            ))}
                            
                            <div className="flex justify-between font-medium mt-4">
                              <span>Total</span>
                              <span>
                                ${(recognizedInvoice.total || 
                                   recognizedInvoice.items.reduce((sum, item) => sum + item.total, 0)
                                  ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <Button onClick={saveInvoice} className="w-full">
                              <Check className="mr-2 h-4 w-4" />
                              Save Invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        {isProcessing ? (
                          <div className="space-y-4">
                            <div className="relative flex items-center justify-center">
                              <div className="absolute -inset-1.5 animate-pulse-light rounded-full bg-restaurant/20"></div>
                              <Loader2 className="h-10 w-10 animate-spin text-restaurant" />
                            </div>
                            <div>
                              <p className="font-medium">Analyzing Invoice...</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Extracting supplier information, items, and prices
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="font-medium">Click "Process Invoice" to analyze the image</p>
                            <p className="text-sm text-muted-foreground">
                              Our AI will extract items, quantities, and prices automatically
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InvoiceUpload;
