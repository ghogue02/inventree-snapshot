
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InventoryRecognitionResult } from "@/types/inventory";
import { Edit, Trash, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface RecognizedItemsListProps {
  items: InventoryRecognitionResult[];
  products: any[];
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
}

const RecognizedItemsList = ({ 
  items, 
  products, 
  onUpdateItem, 
  onRemoveItem 
}: RecognizedItemsListProps) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const startEditing = (index: number) => {
    setEditingItemIndex(index);
  };

  const cancelEditing = () => {
    setEditingItemIndex(null);
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
      {items.map((item, index) => (
        <div key={index} className="border rounded-md p-4">
          {editingItemIndex === index ? (
            <EditableItem item={item} index={index} />
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
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
      ))}
    </div>
  );
};

export default RecognizedItemsList;
