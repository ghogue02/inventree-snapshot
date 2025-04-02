
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw, WifiOff } from "lucide-react";
import { useConnectivity } from "@/hooks/use-connectivity";
import { useOfflineStore } from "@/stores/offlineStore";

interface ScanHeaderProps {
  onSyncData: () => Promise<void>;
  isSyncing: boolean;
}

const ScanHeader = ({ onSyncData, isSyncing }: ScanHeaderProps) => {
  const { isOnline } = useConnectivity();
  const pendingCounts = useOfflineStore(
    state => state.pendingInventoryCounts.filter(c => !c.synced).length
  );
  const pendingImages = useOfflineStore(
    state => state.pendingImageRequests.filter(r => !r.processed).length
  );

  const totalPendingItems = pendingCounts + pendingImages;

  if (totalPendingItems === 0) return null;

  return (
    <Alert variant={isOnline ? "default" : "destructive"} className="mb-4 bg-amber-50">
      <AlertDescription className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {!isOnline && <WifiOff className="h-4 w-4" />}
          <span>
            {isOnline 
              ? `You have ${totalPendingItems} items waiting to sync`
              : `You're offline with ${totalPendingItems} pending items`}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          disabled={!isOnline || isSyncing}
          onClick={onSyncData}
        >
          <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ScanHeader;
