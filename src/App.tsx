
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ReactQueryProvider } from './providers/reactQueryProvider';
import { syncPendingData } from './services/syncService';
import { useOfflineStore } from './stores/offlineStore';

// Pages
import Index from '@/pages/Index';
import Invoices from '@/pages/Invoices';
import InvoiceUpload from '@/pages/InvoiceUpload';
import Inventory from '@/pages/Inventory';
import AddProduct from '@/pages/AddProduct';
import Scan from '@/pages/Scan';
import NotFound from '@/pages/NotFound';

function App() {
  // Set up connectivity listeners
  React.useEffect(() => {
    // Listen for online event to trigger sync
    const handleOnline = async () => {
      const pendingCounts = useOfflineStore.getState().pendingInventoryCounts.filter(c => !c.synced).length;
      const pendingImages = useOfflineStore.getState().pendingImageRequests.filter(r => !r.processed).length;
      
      if (pendingCounts > 0 || pendingImages > 0) {
        try {
          await syncPendingData();
        } catch (error) {
          console.error('Failed to sync on reconnect:', error);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ReactQueryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/upload-invoice" element={<InvoiceUpload />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="bottom-center" />
        </Router>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

export default App;
