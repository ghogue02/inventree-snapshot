
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "../ProductForm";
import { Product } from "@/types/inventory";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<Product>;
  onSuccess?: (product: Product) => void;
  rawAnalysis?: string;
}

const ProductFormDialog = ({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
  rawAnalysis
}: ProductFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <ProductForm 
          initialValues={initialValues}
          rawAnalysis={rawAnalysis}
          onSuccess={onSuccess}
          dialogMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
