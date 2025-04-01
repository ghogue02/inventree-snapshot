
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/inventory";
import { Search, Plus, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices
  });
  
  // Filter invoices based on search
  const filteredInvoices = invoices.filter(invoice => 
    invoice.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort invoices by date, newest first
  const sortedInvoices = [...filteredInvoices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Layout 
      title="Invoices" 
      description="Track and manage supplier invoices"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link to="/invoices/upload">
              <Plus className="mr-2 h-4 w-4" />
              Add Invoice
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No invoices found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedInvoices.map(invoice => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

interface InvoiceCardProps {
  invoice: Invoice;
}

const InvoiceCard = ({ invoice }: InvoiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-white cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <div className="h-10 w-10 rounded-full bg-restaurant-secondary flex items-center justify-center">
            <FileText className="h-5 w-5 text-restaurant" />
          </div>
          <div>
            <h3 className="font-medium">{invoice.supplierName}</h3>
            <p className="text-xs text-muted-foreground">
              #{invoice.invoiceNumber} • {format(new Date(invoice.date), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-medium">${invoice.total.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div>
              <Badge 
                variant="outline" 
                className={
                  invoice.paidStatus === "paid" ? "bg-green-50 text-green-600 border-green-200" :
                  invoice.paidStatus === "partial" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                  "bg-red-50 text-red-600 border-red-200"
                }
              >
                {invoice.paidStatus === "paid" ? "Paid" : 
                 invoice.paidStatus === "partial" ? "Partial" : "Unpaid"}
              </Badge>
            </div>
          </div>
          
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-gray-50 p-4 border-t">
          <h4 className="text-sm font-medium mb-2">Items</h4>
          <div className="space-y-2">
            {invoice.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.product?.name || "Unknown Product"} ({item.quantity} x ${item.unitPrice.toFixed(2)})
                </span>
                <span className="font-medium">${item.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t flex justify-between text-sm font-medium">
              <span>Total</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
