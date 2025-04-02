import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Index";
import Scan from "./pages/Scan";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import InvoiceUpload from "./pages/InvoiceUpload";
import NotFound from "./pages/NotFound";
import AddProduct from "./pages/AddProduct";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/inventree-snapshot">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/upload" element={<InvoiceUpload />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
