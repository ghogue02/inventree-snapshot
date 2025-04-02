
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useOfflineStore } from '@/stores/offlineStore';

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const { connectionStatus, setConnectionStatus } = useOfflineStore();

  // Listen for online/offline events from the browser
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('online');
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
      toast.warning('You are offline. Data will be saved locally and synced when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setConnectionStatus]);

  // Active connection check
  const checkConnection = async () => {
    if (isCheckingConnection) return isOnline;
    
    setIsCheckingConnection(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try to fetch a small resource to check actual connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      const online = response.ok;
      setIsOnline(online);
      setConnectionStatus(online ? 'online' : 'offline');
      
      return online;
    } catch (error) {
      setIsOnline(false);
      setConnectionStatus('offline');
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  return {
    isOnline,
    connectionStatus,
    checkConnection,
    isCheckingConnection
  };
}
