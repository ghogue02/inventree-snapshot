
import React from 'react';
import { Button } from "@/components/ui/button";

interface FlashButtonProps {
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
}

const FlashButton = ({ onClick, active = false }: FlashButtonProps) => {
  return (
    <Button 
      size="sm" 
      variant="secondary" 
      className={`${active ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-black/50 hover:bg-black/70'} text-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg`}
      onClick={onClick}
      aria-label="Toggle flash"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={active ? "currentColor" : "none"}
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M11 2v20c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1h-2a1 1 0 0 0-1 1Z"></path>
        <path d="m19 14 2-2-2-2"></path>
        <path d="M5 14 3 12l2-2"></path>
        <path d="M8 14h13"></path>
        <path d="M8 10h13"></path>
      </svg>
    </Button>
  );
};

export default FlashButton;
