
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ItemQuantityControlProps {
  count: number;
  onQuantityChange: (newValue: number) => void;
}

const ItemQuantityControl = ({ count, onQuantityChange }: ItemQuantityControlProps) => {
  const isMobile = useIsMobile();
  
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count > 0.5) {
      onQuantityChange(Math.round((count - 0.5) * 10) / 10);
    }
  };
  
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuantityChange(Math.round((count + 0.5) * 10) / 10);
  };
  
  const handleSmallDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count > 0.1) {
      onQuantityChange(Math.round((count - 0.1) * 10) / 10);
    }
  };
  
  const handleSmallIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuantityChange(Math.round((count + 0.1) * 10) / 10);
  };

  return (
    <div 
      className="flex items-center border rounded-lg overflow-hidden shadow-sm" 
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-medium"
        onClick={handleDecrement}
      >
        −
      </button>
      <div className="relative">
        <span className="px-4 py-2 font-medium text-center block min-w-[3rem]">
          {count}
        </span>
        {isMobile && (
          <div className="absolute left-0 right-0 flex flex-col">
            <button 
              className="h-4 flex items-center justify-center opacity-70"
              onClick={handleSmallIncrement}
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button 
              className="h-4 flex items-center justify-center opacity-70"
              onClick={handleSmallDecrement}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      <button 
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-lg font-medium"
        onClick={handleIncrement}
      >
        +
      </button>
    </div>
  );
};

export default ItemQuantityControl;
