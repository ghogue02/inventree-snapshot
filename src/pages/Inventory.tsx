import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/inventory";
import { Search, Plus, Trash2, Pencil, X, Check, Database, Image } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProduct, deleteProduct, loadMockProducts, generateAllProductImages, loadMockInvoices } from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [hasData, setHasData] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      setHasData(data && data.length > 0);
      return data || [];
    }
  });

  // Calculate if any products need images
  const productsNeedingImages = products.filter(product => !product.image);
  const allProductsHaveImages = products.length > 0 && productsNeedingImages.length === 0;

  const handleLoadMockData = async () => {
    setIsLoading(true);
    try {
      // First load the products
      await loadMockProducts();
      
      // Then load the invoices which will update stock levels
      await loadMockInvoices();
      
      // Refresh both products and invoices data
      await queryClient.invalidateQueries(["products"]);
      await queryClient.invalidateQueries(["invoices"]);
      
      toast.success("Sample data loaded successfully");
    } catch (error) {
      console.error("Error loading mock data:", error);
      toast.error("Failed to load sample data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    setIsGeneratingImages(true);
    try {
      await generateAllProductImages(products);
      queryClient.invalidateQueries(["products"]);
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setIsGeneratingImages(false);
    }
  };
  
  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group products by category
  const groupedByCategory = filteredProducts.reduce<Record<string, Product[]>>((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <Layout 
      title="Inventory" 
      description="Manage and track your restaurant inventory"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateImages} 
              disabled={isGeneratingImages || products.length === 0 || allProductsHaveImages}
              variant={allProductsHaveImages ? "secondary" : "default"}
            >
              <Image className="mr-2 h-4 w-4" />
              {allProductsHaveImages 
                ? "All Images Generated" 
                : productsNeedingImages.length > 0 
                  ? `Generate ${productsNeedingImages.length} Images`
                  : "Generate Images"
              }
            </Button>
            <Button 
              onClick={handleLoadMockData} 
              disabled={isLoading || hasData}
              variant={hasData ? "secondary" : "default"}
            >
              <Database className="mr-2 h-4 w-4" />
              {hasData ? "Sample Data Loaded" : "Load Sample Data"}
            </Button>
            <Button onClick={() => navigate("/add-product")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-24 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No products found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCategory).map(([category, products]) => (
              <Card key={category}>
                <CardHeader className="py-4">
                  <CardTitle className="text-md font-medium">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const PRODUCT_CATEGORIES = [
  'Grains', 'Dairy', 'Vegetables', 'Fruits', 'Meat', 'Seafood', 
  'Spices', 'Beverages', 'Snacks', 'Baked Goods', 'Canned Goods', 'Other'
];

const PRODUCT_UNITS = [
  'oz', 'lb', 'g', 'kg', 'ml', 'l', 'each', 'box', 'bag', 'bottle', 'can', 'jar', 'package'
];

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product: initialProduct }: ProductCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState(initialProduct);
  const queryClient = useQueryClient();

  // Determine if product is low on stock
  const isLowStock = product.currentStock <= product.reorderPoint;

  // Calculate value, handling undefined/null values
  const calculateValue = () => {
    const stock = product.currentStock || 0;
    const cost = product.cost || 0;
    return (stock * cost).toFixed(2);
  };

  const handleChange = (field: keyof Product, value: any) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProduct(product);
      queryClient.invalidateQueries(["products"]);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setIsLoading(true);
    try {
      await deleteProduct(product.id);
      queryClient.invalidateQueries(["products"]);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inventory-card border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isLowStock ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
            {product.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Input
              value={product.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Product name"
              className="mb-2"
            />
            <Select 
              value={product.category} 
              onValueChange={(val) => handleChange('category', val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                value={product.currentStock}
                onChange={(e) => handleChange('currentStock', parseInt(e.target.value) || 0)}
                placeholder="Current stock"
              />
            </div>
            <div>
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
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                value={product.reorderPoint}
                onChange={(e) => handleChange('reorderPoint', parseInt(e.target.value) || 0)}
                placeholder="Reorder point"
              />
            </div>
            <div>
              <Input
                type="number"
                step="0.01"
                value={product.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="Cost per unit"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-card border rounded-lg p-4 bg-white shadow-sm relative">
      <div className="absolute top-2 right-2 flex gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isLowStock ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-medium text-sm">{product.name}</h3>
          <p className="text-xs text-muted-foreground">
            {product.category} • {product.unit}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Current Stock</p>
          <p className="font-medium">
            {product.currentStock || 0}
            {isLowStock && (
              <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-500 border-orange-200">
                Low
              </Badge>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Value</p>
          <p className="font-medium">
            ${calculateValue()}
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs">
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              product.currentStock < product.reorderPoint ? 'bg-orange-500' :
              product.currentStock < product.reorderPoint * 2 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, (product.currentStock / (product.reorderPoint * 3)) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-muted-foreground">Reorder at: {product.reorderPoint}</span>
          <span className="font-medium">${product.cost?.toFixed(2) || '0.00'}/{product.unit}</span>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
