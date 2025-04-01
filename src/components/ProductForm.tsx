
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from '@/types/inventory';
import { addProduct } from '@/services/apiService';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

interface ProductFormProps {
  initialValues?: Partial<Product>;
  rawAnalysis?: string;
}

const PRODUCT_CATEGORIES = [
  'Grains', 'Dairy', 'Vegetables', 'Fruits', 'Meat', 'Seafood', 
  'Spices', 'Beverages', 'Snacks', 'Baked Goods', 'Canned Goods', 'Other'
];

const PRODUCT_UNITS = [
  'oz', 'lb', 'g', 'kg', 'ml', 'l', 'each', 'box', 'bag', 'bottle', 'can', 'jar', 'package'
];

const ProductForm = ({ initialValues, rawAnalysis }: ProductFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Other',
    unit: 'each',
    cost: 0,
    currentStock: 1,
    reorderPoint: 5,
    ...initialValues
  });

  const handleChange = (field: keyof Product, value: any) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!product.name || !product.category || !product.unit) {
        toast.error("Please fill in all required fields");
        return;
      }

      const newProduct = await addProduct({
        name: product.name,
        category: product.category,
        unit: product.unit,
        cost: typeof product.cost === 'number' ? product.cost : 0,
        currentStock: typeof product.currentStock === 'number' ? product.currentStock : 0,
        reorderPoint: typeof product.reorderPoint === 'number' ? product.reorderPoint : 5,
        image: product.image
      });

      toast.success("Product added successfully!");
      navigate("/inventory");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={product.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={product.category} 
              onValueChange={(val) => handleChange('category', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select 
              value={product.unit} 
              onValueChange={(val) => handleChange('unit', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_UNITS.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={product.cost}
              onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentStock">Current Stock</Label>
            <Input
              id="currentStock"
              type="number"
              step="1"
              value={product.currentStock}
              onChange={(e) => handleChange('currentStock', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderPoint">Reorder Point</Label>
            <Input
              id="reorderPoint"
              type="number"
              step="1"
              value={product.reorderPoint}
              onChange={(e) => handleChange('reorderPoint', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {rawAnalysis && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <Label className="block mb-2 font-medium">AI Analysis</Label>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">
                {rawAnalysis}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/inventory")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Add Product"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
