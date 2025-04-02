
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { InventoryRecognitionResult } from "@/types/inventory";

interface ItemEditFormProps {
  item: InventoryRecognitionResult;
  onUpdate: (updatedItem: InventoryRecognitionResult) => void;
  onCancel: () => void;
  onSave: () => void;
}

const ItemEditForm = ({ item, onUpdate, onCancel, onSave }: ItemEditFormProps) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500">Product Name</label>
        <Input 
          value={item.name}
          onChange={(e) => onUpdate({ ...item, name: e.target.value })}
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Size/Volume</label>
          <Input 
            value={item.size || ''}
            onChange={(e) => onUpdate({ ...item, size: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Quantity</label>
          <Input 
            type="number"
            value={item.count}
            onChange={(e) => onUpdate({ ...item, count: parseFloat(e.target.value) })}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave}>
          <Check className="mr-1 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default ItemEditForm;
