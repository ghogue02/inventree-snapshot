
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Archive,
  Box,
  FileText,
  Camera,
  List
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container flex items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Box className="h-6 w-6 text-restaurant" />
          <span className="hidden md:inline text-lg">Restaurant Inventory</span>
        </Link>
        
        <nav className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size={isMobile ? "icon" : "default"} asChild>
            <Link to="/">
              <List className="h-5 w-5 md:mr-2" />
              {!isMobile && <span>Dashboard</span>}
            </Link>
          </Button>
          
          <Button variant="ghost" size={isMobile ? "icon" : "default"} asChild>
            <Link to="/scan">
              <Camera className="h-5 w-5 md:mr-2" />
              {!isMobile && <span>Scan</span>}
            </Link>
          </Button>
          
          <Button variant="ghost" size={isMobile ? "icon" : "default"} asChild>
            <Link to="/invoices">
              <FileText className="h-5 w-5 md:mr-2" />
              {!isMobile && <span>Invoices</span>}
            </Link>
          </Button>
          
          <Button variant="ghost" size={isMobile ? "icon" : "default"} asChild>
            <Link to="/inventory">
              <Archive className="h-5 w-5 md:mr-2" />
              {!isMobile && <span>Inventory</span>}
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
