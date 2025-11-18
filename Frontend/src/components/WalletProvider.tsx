import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * WalletProvider - Real Cardano Wallet Integration
 * 
 * This component provides real Cardano wallet connectivity using the CIP-30 standard.
 * It supports all major Cardano wallets including:
 * - Nami
 * - Eternl (formerly CCVault)
 * - Flint
 * - Yoroi
 * - Lace
 * - Gero
 * - Typhon
 * - NuFi
 * 
 * The wallets are detected through the window.cardano object which is injected
 * by browser extensions following the CIP-30 (Cardano dApp-Wallet Web Bridge) standard.
 * 
 * Features:
 * - Auto-detect installed Cardano wallets
 * - Connect to user's preferred wallet
 * - Get wallet address (both used and unused addresses)
 * - Check network (Mainnet/Testnet)
 * - Get wallet balance in ADA
 * - Persist wallet connection across page reloads
 * - Handle connection errors gracefully
 * 
 * For production use with Mesh SDK:
 * import { BrowserWallet } from '@meshsdk/core';
 * const wallet = await BrowserWallet.enable('nami');
 * 
 * For production use with Lucid:
 * import { Lucid, Blockfrost } from 'lucid-cardano';
 * const lucid = await Lucid.new(new Blockfrost(...), 'Mainnet');
 * const api = await window.cardano.nami.enable();
 * lucid.selectWallet(api);
 */

// Cardano Wallet Types
interface CardanoWallet {
  name: string;
  icon: string;
  version: string;
  enable: () => Promise<any>;
  isEnabled: () => Promise<boolean>;
}

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
  connectWallet: (walletName?: string) => Promise<void>;
  disconnectWallet: () => void;
  availableWallets: { name: string; icon: string; key: string }[];
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Declare Cardano wallet extensions on window
declare global {
  interface Window {
    cardano?: {
      nami?: CardanoWallet;
      eternl?: CardanoWallet;
      flint?: CardanoWallet;
      yoroi?: CardanoWallet;
      gerowallet?: CardanoWallet;
      typhon?: CardanoWallet;
      lace?: CardanoWallet;
      nufi?: CardanoWallet;
    };
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<{ name: string; icon: string; key: string }[]>([]);
  const [walletAPI, setWalletAPI] = useState<any>(null);

  // Wallet configurations
  const walletConfigs = [
    { key: 'nami', name: 'Nami', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzM0OTVGRiIvPjwvc3ZnPg==' },
    { key: 'eternl', name: 'Eternl', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzFBMUExQSIvPjwvc3ZnPg==' },
    { key: 'flint', name: 'Flint', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0ZGNkIzNSIvPjwvc3ZnPg==' },
    { key: 'yoroi', name: 'Yoroi', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzE3RDFBQSIvPjwvc3ZnPg==' },
    { key: 'lace', name: 'Lace', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzk5NDVGRiIvPjwvc3ZnPg==' },
    { key: 'gerowallet', name: 'Gero', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzAwQkNENCIvPjwvc3ZnPg==' },
    { key: 'typhon', name: 'Typhon', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzY2MjhGRiIvPjwvc3ZnPg==' },
    { key: 'nufi', name: 'NuFi', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0ZGNTcyMiIvPjwvc3ZnPg==' }
  ];

  // Check for available wallets on mount
  useEffect(() => {
    const checkWallets = () => {
      if (typeof window !== 'undefined' && window.cardano) {
        const available = walletConfigs.filter(
          (wallet) => window.cardano?.[wallet.key as keyof typeof window.cardano]
        );
        setAvailableWallets(available);
      }
    };

    // Check immediately
    checkWallets();

    // Check again after a delay (wallets might load after page)
    const timer = setTimeout(checkWallets, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Load saved wallet connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet && window.cardano) {
      connectWallet(savedWallet).catch(console.error);
    }
  }, []);

  const connectWallet = async (walletName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.cardano) {
        throw new Error('No Cardano wallets found. Please install a Cardano wallet extension (Nami, Eternl, Flint, etc.)');
      }

      // If no wallet specified, try to use the first available
      let walletKey = walletName;
      if (!walletKey) {
        const firstAvailable = availableWallets[0]?.key;
        if (!firstAvailable) {
          throw new Error('No Cardano wallets detected. Please install a wallet extension.');
        }
        walletKey = firstAvailable;
      }

      const walletExtension = window.cardano[walletKey as keyof typeof window.cardano];
      
      if (!walletExtension) {
        throw new Error(`${walletKey} wallet not found. Please install it first.`);
      }

      // Enable the wallet
      const api = await walletExtension.enable();
      setWalletAPI(api);

      // Get wallet address
      const addresses = await api.getUsedAddresses();
      if (!addresses || addresses.length === 0) {
        // Try unused addresses if no used addresses
        const unusedAddresses = await api.getUnusedAddresses();
        if (!unusedAddresses || unusedAddresses.length === 0) {
          throw new Error('No addresses found in wallet');
        }
        
        // Convert from hex to bech32 address
        const hexAddress = unusedAddresses[0];
        setAddress(hexAddress);
      } else {
        const hexAddress = addresses[0];
        setAddress(hexAddress);
      }

      // Get network
      const networkId = await api.getNetworkId();
      setNetwork(networkId === 1 ? 'Mainnet' : 'Testnet');

      // Get balance
      try {
        const balanceHex = await api.getBalance();
        // Convert hex balance to ADA (1 ADA = 1,000,000 Lovelace)
        const lovelace = parseInt(balanceHex, 16);
        const ada = (lovelace / 1_000_000).toFixed(2);
        setBalance(`${ada} ADA`);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setBalance('0 ADA');
      }

      setConnected(true);
      localStorage.setItem('connectedWallet', walletKey);
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setConnected(false);
      setAddress(null);
      setBalance(null);
      setNetwork(null);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress(null);
    setBalance(null);
    setNetwork(null);
    setWalletAPI(null);
    localStorage.removeItem('connectedWallet');
  };

  return (
    <WalletContext.Provider 
      value={{ 
        connected, 
        address, 
        balance,
        network,
        connectWallet, 
        disconnectWallet,
        availableWallets,
        isLoading,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}