import { useState } from 'react';
import { Mail, Lock, Wallet, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useWallet } from './WalletProvider';
import { InstallWalletGuide } from './InstallWalletGuide';
import { api } from '../lib/api';

interface SignInFormProps {
  userType: 'organization' | 'individual' | 'community';
  onSuccess: (userData: any) => void;
  onSwitchToSignUp: () => void;
}

export function SignInForm({ userType, onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWalletGuide, setShowWalletGuide] = useState(false);
  const { connected, address, connectWallet, availableWallets } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Validate credentials (mock validation)
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      // Step 2: Ensure wallet is connected
      if (!connected) {
        throw new Error('Please connect your Cardano wallet first');
      }

      // Call backend API
      const response = await api.signIn({ email, password });

      // Store token
      api.setToken(response.token);

      // Enhance user object with wallet address and type for frontend compatibility
      const userData = {
        ...response.user,
        type: userType, // Maintain the selected user type context
        walletAddress: address, // Ensure current wallet is linked
        // Map backend fields to frontend expected fields if necessary
        organization: response.user.organizationName || response.user.organizationId
      };

      onSuccess(userData);
      setLoading(false);

    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder={userType === 'organization' ? 'organization@example.com' : 'researcher@example.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <Label>Cardano Wallet</Label>
        {connected ? (
          <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Wallet Connected</p>
                <p className="text-xs font-mono text-green-700">{address?.slice(0, 20)}...{address?.slice(-10)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            <Alert>
              <Wallet className="size-4" />
              <AlertDescription>
                Connect your Cardano wallet to sign in securely
              </AlertDescription>
            </Alert>
            {availableWallets.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availableWallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    type="button"
                    variant="outline"
                    onClick={handleWalletConnect}
                    className="justify-start"
                  >
                    <img src={wallet.icon} alt={wallet.name} className="size-5 mr-2" />
                    {wallet.name}
                  </Button>
                ))}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleWalletConnect}
                className="w-full"
              >
                <Wallet className="mr-2 size-4" />
                Connect Wallet
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWalletGuide(true)}
              className="w-full"
            >
              <HelpCircle className="mr-2 size-4" />
              Don't have a wallet? Install one
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading || !connected}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-green-600 hover:underline font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
        <p className="font-medium mb-1">Demo Credentials:</p>
        <p className="text-gray-700">Email: demo@example.com</p>
        <p className="text-gray-700">Password: any password</p>
        <p className="text-gray-600 mt-1">Note: This is a demo. Any credentials will work.</p>
      </div>

      <Dialog open={showWalletGuide} onOpenChange={setShowWalletGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Cardano Wallet</DialogTitle>
          </DialogHeader>
          <InstallWalletGuide />
        </DialogContent>
      </Dialog>
    </form>
  );
}