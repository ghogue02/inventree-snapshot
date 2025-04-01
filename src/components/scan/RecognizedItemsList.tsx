
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { Edit, Trash, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RecognizedItemsListProps {
  items: InventoryRecognitionResult[];
  products: Product[];
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory?: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists?: (name: string) => Product | undefined;
}

const RecognizedItemsList = ({ 
  items, 
  products, 
  onUpdateItem, 
  onRemoveItem,
  onAddToInventory,
  checkIfItemExists
}: RecognizedItemsListProps) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [addingItem, setAddingItem] = useState<number | null>(null);

  const startEditing = (index: number) => {
    setEditingItemIndex(index);
  };

  const cancelEditing = () => {
    setEditingItemIndex(null);
  };

  const handleAddToInventory = async (item: InventoryRecognitionResult, index: number) => {
    if (!onAddToInventory) return;
    
    setAddingItem(index);
    try {
      await onAddToInventory(item);
    } finally {
      setAddingItem(null);
    }
  };

  const EditableItem = ({ item, index }: { item: InventoryRecognitionResult, index: number }) => {
    const form = useForm<InventoryRecognitionResult>({
      defaultValues: item
    });

    const onSubmit = (data: InventoryRecognitionResult) => {
      onUpdateItem(index, data);
      setEditingItemIndex(null);
      toast.success("Item updated successfully");
    };

    const productOptions = products.map(product => ({
      label: product.name,
      value: product.id
    }));

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">-- Select Product --</option>
                      {productOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Count</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size/Volume</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    {...field}
                    value={field.value || ''}
                    placeholder="e.g., 16 oz, 1 liter"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const itemExists = item.productId || (checkIfItemExists && checkIfItemExists(item.name));
        
        return (
          <div key={index} className="border rounded-md p-4">
            {editingItemIndex === index ? (
              <EditableItem item={item} index={index} />
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {item.name}
                    {!itemExists && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Not in inventory
                      </Badge>
                    )}
                  </div>
                  {item.size && (
                    <div className="text-xs text-muted-foreground">
                      Size: {item.size}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Confidence: {Math.round(item.confidence * 100)}%
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{item.count.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">units</div>
                  </div>
                  <div className="flex gap-1">
                    {!itemExists && onAddToInventory && (
                      <Button 
                        onClick={() => handleAddToInventory(item, index)} 
                        size="sm" 
                        variant="outline"
                        className={cn("text-green-600 border-green-600", 
                          "hover:bg-green-50 hover:text-green-700")}
                        disabled={addingItem === index}
                      >
                        {addingItem === index ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                          </span>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Inventory
                          </>
                        )}
                      </Button>
                    )}
                    <Button onClick={() => startEditing(index)} size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => onRemoveItem(index)} size="sm" variant="ghost" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RecognizedItemsList;
