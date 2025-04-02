
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/ProductForm";
import { Product } from "@/types/inventory";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<Product>;
  rawAnalysis?: string;
  onSuccess?: (product: Product) => void;
}

const ProductFormDialog = ({
  open,
  onOpenChange,
  initialValues,
  rawAnalysis,
  onSuccess
}: ProductFormDialogProps) => {
  const handleSuccess = (product: Product) => {
    if (onSuccess) {
      onSuccess(product);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <ProductForm 
          initialValues={initialValues} 
          rawAnalysis={rawAnalysis}
          onSuccess={handleSuccess}
          dialogMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
