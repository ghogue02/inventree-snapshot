
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { Card } from "@/components/ui/card";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ children, title, description }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>}
            {description && <p className="text-muted-foreground mt-2">{description}</p>}
          </div>
        )}
        <Card className="overflow-hidden border bg-card text-card-foreground shadow-sm">
          {children}
        </Card>
      </main>
    </div>
  );
};

export default Layout;
