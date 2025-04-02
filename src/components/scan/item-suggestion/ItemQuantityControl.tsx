
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ItemQuantityControlProps {
  count: number;
  onQuantityChange: (newValue: number) => void;
}

const ItemQuantityControl = ({ count, onQuantityChange }: ItemQuantityControlProps) => {
  const isMobile = useIsMobile();
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [inputValue, setInputValue] = useState(count.toString());
  
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count > 0.5) {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      onQuantityChange(Math.round((count - 0.5) * 10) / 10);
    }
  };
  
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    onQuantityChange(Math.round((count + 0.5) * 10) / 10);
  };
  
  const handleSmallDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count > 0.1) {
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
      onQuantityChange(Math.round((count - 0.1) * 10) / 10);
    }
  };
  
  const handleSmallIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onQuantityChange(Math.round((count + 0.1) * 10) / 10);
  };

  const submitValue = () => {
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onQuantityChange(Math.round(newValue * 10) / 10);
    }
    setIsKeypadOpen(false);
  };

  const handleKeypadInput = (value: string) => {
    if (value === "clear") {
      setInputValue("0");
    } else if (value === "backspace") {
      setInputValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    } else if (value === "." && !inputValue.includes(".")) {
      setInputValue(prev => prev + ".");
    } else if (value !== ".") {
      setInputValue(prev => prev === "0" ? value : prev + value);
    }
  };

  return (
    <div 
      className="flex items-center border rounded-lg overflow-hidden shadow-sm" 
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className={`${isMobile ? 'px-5 py-3' : 'px-4 py-2'} bg-gray-100 hover:bg-gray-200 text-lg font-medium`}
        onClick={handleDecrement}
        aria-label="Decrease quantity"
      >
        −
      </button>
      
      <Sheet open={isKeypadOpen} onOpenChange={setIsKeypadOpen}>
        <SheetTrigger asChild>
          <div className="relative">
            <button className="px-4 py-2 font-medium text-center block min-w-[3rem]">
              {count}
            </button>
            {isMobile && !isKeypadOpen && (
              <div className="absolute left-0 right-0 flex flex-col">
                <button 
                  className="h-4 flex items-center justify-center opacity-70"
                  onClick={handleSmallIncrement}
                  aria-label="Increase by 0.1"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button 
                  className="h-4 flex items-center justify-center opacity-70"
                  onClick={handleSmallDecrement}
                  aria-label="Decrease by 0.1"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto p-0 pb-8">
          <div className="p-4 space-y-4">
            <div className="text-center text-lg font-semibold">Enter Quantity</div>
            
            <div className="flex items-center justify-center mb-4">
              <input 
                type="text"
                value={inputValue}
                className="text-2xl text-center w-full p-3 border rounded-md"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Number keys */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-14 text-xl"
                  onClick={() => handleKeypadInput(num.toString())}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-14 text-xl"
                onClick={() => handleKeypadInput(".")}
              >
                .
              </Button>
              <Button
                variant="outline"
                className="h-14 text-xl"
                onClick={() => handleKeypadInput("0")}
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-14 text-xl"
                onClick={() => handleKeypadInput("backspace")}
              >
                ←
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleKeypadInput("clear")}
              >
                Clear
              </Button>
              <Button
                className="h-12"
                onClick={submitValue}
              >
                Confirm
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <button 
        className={`${isMobile ? 'px-5 py-3' : 'px-4 py-2'} bg-gray-100 hover:bg-gray-200 text-lg font-medium`}
        onClick={handleIncrement}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default ItemQuantityControl;
