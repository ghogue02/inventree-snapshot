
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ItemActionButtonsProps {
  itemExists: boolean;
  onAddToInventory?: () => void;
  onEdit: () => void;
  onRemove: () => void;
  isAddingToInventory?: boolean;
  showAddButton?: boolean;
}

const ItemActionButtons = ({ 
  itemExists, 
  onAddToInventory, 
  onEdit, 
  onRemove, 
  isAddingToInventory, 
  showAddButton = true
}: ItemActionButtonsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex gap-1">
      {!itemExists && onAddToInventory && showAddButton && (
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToInventory();
          }} 
          size={isMobile ? "default" : "sm"} 
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          disabled={isAddingToInventory}
        >
          {isAddingToInventory ? (
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
              Add
            </>
          )}
        </Button>
      )}
      
      <Button 
        size={isMobile ? "default" : "sm"} 
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button 
        size={isMobile ? "default" : "sm"} 
        variant="ghost" 
        className="text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ItemActionButtons;
