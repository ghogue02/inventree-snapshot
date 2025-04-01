
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, getInvoices, getInventoryCounts } from "@/services/apiService";
import { Product, Invoice, InventoryCount } from "@/types/inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive, Box, Camera, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, invoicesData, countsData] = await Promise.all([
          getProducts(),
          getInvoices(),
          getInventoryCounts()
        ]);
        
        setProducts(productsData);
        setInvoices(invoicesData);
        setInventoryCounts(countsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate totals
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const totalInvoices = invoices.length;
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.currentStock * product.cost), 0).toFixed(2);

  // Prepare chart data
  const chartData = products.map(product => ({
    name: product.name,
    stock: product.currentStock,
    reorderPoint: product.reorderPoint
  }));

  return (
    <Layout 
      title="Restaurant Inventory Dashboard" 
      description="Track your inventory levels, recent counts, and financial metrics"
    >
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard 
            title="Total Products"
            value={isLoading ? null : totalProducts}
            description="Products in system"
            icon={<Box className="h-5 w-5" />}
            color="bg-blue-50"
            textColor="text-blue-500"
          />
          
          <DashboardCard 
            title="Low Stock Items"
            value={isLoading ? null : lowStockProducts}
            description="Items below reorder point"
            icon={<Archive className="h-5 w-5" />}
            color="bg-orange-50"
            textColor="text-orange-500"
            link="/inventory"
            linkText="View inventory"
          />
          
          <DashboardCard 
            title="Total Invoices"
            value={isLoading ? null : totalInvoices}
            description="Processed invoices"
            icon={<FileText className="h-5 w-5" />}
            color="bg-green-50"
            textColor="text-green-500"
            link="/invoices"
            linkText="View invoices"
          />
          
          <DashboardCard 
            title="Inventory Value"
            value={isLoading ? null : `$${totalInventoryValue}`}
            description="Total value on hand"
            icon={<Box className="h-5 w-5" />}
            color="bg-purple-50"
            textColor="text-purple-500"
          />
        </div>

        {/* Inventory Chart */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Stock Levels</CardTitle>
              <CardDescription>
                Inventory levels compared to reorder points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="stock" name="Current Stock" fill="#f97316" />
                      <Bar dataKey="reorderPoint" name="Reorder Point" fill="#cbd5e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard 
              title="Scan Inventory"
              description="Count inventory using your camera"
              icon={<Camera className="h-8 w-8" />}
              link="/scan"
              color="bg-restaurant text-white"
            />
            <QuickActionCard 
              title="Process Invoice"
              description="Upload and scan new invoices"
              icon={<FileText className="h-8 w-8" />}
              link="/invoices/upload"
              color="bg-restaurant-secondary text-restaurant-accent"
            />
            <QuickActionCard 
              title="View Inventory"
              description="See all inventory items"
              icon={<Archive className="h-8 w-8" />}
              link="/inventory"
              color="bg-slate-100 text-slate-800"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper components
interface DashboardCardProps {
  title: string;
  value: string | number | null;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  link?: string;
  linkText?: string;
}

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  color, 
  textColor,
  link,
  linkText
}: DashboardCardProps) => (
  <Card>
    <CardContent className="flex flex-col items-start p-6">
      <div className={`rounded-full p-2 ${color}`}>
        <div className={textColor}>
          {icon}
        </div>
      </div>
      <h3 className="mt-4 font-medium text-sm text-muted-foreground">
        {title}
      </h3>
      <div className="mt-1 font-bold text-2xl">
        {value !== null ? value : <Skeleton className="h-8 w-16" />}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
      {link && linkText && (
        <Link to={link} className={`text-xs mt-2 underline ${textColor}`}>
          {linkText}
        </Link>
      )}
    </CardContent>
  </Card>
);

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

const QuickActionCard = ({ title, description, icon, link, color }: QuickActionCardProps) => (
  <Link to={link} className="inventory-card">
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`rounded-full p-3 ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default Dashboard;
