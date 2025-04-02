import { cn } from "@/lib/utils";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className={cn(
          "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent",
          className
        )}
      />
    </div>
  );
};

export default LoadingSpinner; 