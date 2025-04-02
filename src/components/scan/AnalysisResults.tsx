
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, Plus, RefreshCw, Printer, BarChart2 } from "lucide-react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import RecognizedItemsList from "./RecognizedItemsList";
import { useState } from "react";
import { toast } from "sonner";

interface AnalysisResultsProps {
  analysisResult: string;
  recognizedItems: InventoryRecognitionResult[];
  products: Product[];
  onSaveInventoryCounts: () => void;
  onGoToAddProduct: () => void;
  onResetCapture: () => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory?: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists?: (name: string) => Product | undefined;
}

const AnalysisResults = ({
  analysisResult,
  recognizedItems,
  products,
  onSaveInventoryCounts,
  onGoToAddProduct,
  onResetCapture,
  onUpdateItem,
  onRemoveItem,
  onAddToInventory,
  checkIfItemExists
}: AnalysisResultsProps) => {
  const [showVisualization, setShowVisualization] = useState(false);
  
  const exportToCsv = () => {
    try {
      // Prepare CSV content
      const headers = "Product Name,Size,Count,Confidence\n";
      const rows = recognizedItems.map(item => 
        `"${item.name}","${item.size || 'N/A'}",${item.count},${Math.round(item.confidence * 100)}%`
      ).join('\n');
      
      const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
      const encodedUri = encodeURI(csvContent);
      
      // Create temporary link element to trigger download
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory-scan-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      
      // Trigger download and cleanup
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };
  
  const printReport = () => {
    try {
      // Create a printable version of the data
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups for printing.");
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Inventory Scan Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Inventory Scan Report - ${new Date().toLocaleDateString()}</h1>
            <table>
              <tr>
                <th>Product Name</th>
                <th>Size</th>
                <th>Count</th>
              </tr>
              ${recognizedItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.size || 'N/A'}</td>
                  <td>${item.count}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      toast.success("Print preview opened");
    } catch (error) {
      console.error("Error printing report:", error);
      toast.error("Failed to print report");
    }
  };
  
  const toggleVisualization = () => {
    setShowVisualization(!showVisualization);
  };
  
  const SimpleVisualization = () => {
    if (!showVisualization) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md border">
        <h4 className="text-sm font-medium mb-2">Items by Count Visualization</h4>
        <div className="flex items-end h-40 gap-2">
          {recognizedItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-blue-500 w-10" 
                style={{ 
                  height: `${Math.min(Math.max(item.count * 20, 10), 100)}px`,
                  opacity: item.confidence
                }}
              />
              <span className="text-xs mt-1 w-16 truncate text-center" title={item.name}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-center mt-2 text-gray-500">
          Hover over item names to see full product name
        </div>
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
        <div className="mb-4 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border">
          {analysisResult}
        </div>

        {recognizedItems.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Recognized Items</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={exportToCsv} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
                <Button 
                  onClick={printReport} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
                <Button 
                  onClick={toggleVisualization} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  {showVisualization ? "Hide Chart" : "Show Chart"}
                </Button>
              </div>
            </div>
            
            <SimpleVisualization />
            
            <RecognizedItemsList 
              items={recognizedItems}
              products={products}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              onAddToInventory={onAddToInventory}
              checkIfItemExists={checkIfItemExists}
            />
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <Button onClick={onSaveInventoryCounts} variant="default">
                <Check className="mr-2 h-4 w-4" />
                Save Inventory Counts
              </Button>
              <Button onClick={onGoToAddProduct} variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add as Product
              </Button>
              <Button onClick={onResetCapture} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Again
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
