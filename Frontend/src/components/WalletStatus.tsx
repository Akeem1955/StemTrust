import { Wallet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useWallet } from './WalletProvider';

export function WalletStatus() {
  const { connected, address, balance, network, connectWallet, disconnectWallet, availableWallets, isLoading, error } = useWallet();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <p className="text-sm">Connecting to wallet...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!connected) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Wallet className="size-5" />
            <span className="text-sm">No Wallet Connected</span>
          </div>
          {availableWallets.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Available wallets:</p>
              <div className="grid grid-cols-2 gap-2">
                {availableWallets.map((wallet) => (
                  <Button
                    key={wallet.key}
                    size="sm"
                    variant="outline"
                    onClick={connectWallet}
                    className="justify-start"
                  >
                    <img src={wallet.icon} alt={wallet.name} className="size-4 mr-2" />
                    {wallet.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">
                No Cardano wallets detected. Please install Nami, Eternl, Flint, or another Cardano wallet extension.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="size-5" />
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
          <Button size="sm" variant="ghost" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium">{network}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Balance:</span>
            <span className="font-medium">{balance}</span>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-600 mb-1">Address:</p>
            <p className="font-mono text-xs break-all">{address}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
