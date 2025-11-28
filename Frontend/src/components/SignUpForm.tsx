import { useState } from 'react';
import { Mail, Lock, User, Building, MapPin, Wallet, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useWallet } from './WalletProvider';
import { InstallWalletGuide } from './InstallWalletGuide';

interface SignUpFormProps {
  userType: 'organization' | 'individual' | 'community';
  onSuccess: (userData: any) => void;
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ userType, onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    institution: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWalletGuide, setShowWalletGuide] = useState(false);
  const { connected, address, connectWallet, availableWallets } = useWallet();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!connected) {
        throw new Error('Please connect your Cardano wallet first');
      }

      // In production: Call backend API to create account
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, walletAddress: address, userType })
      // });

      // Mock successful signup
      setTimeout(() => {
        let mockUser;
        
        if (userType === 'community') {
          mockUser = {
            id: `community-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            type: userType,
            walletAddress: address,
            location: formData.location,
            interests: formData.description
          };
        } else if (userType === 'organization') {
          mockUser = {
            id: `org-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            type: userType,
            walletAddress: address,
            organization: formData.organization,
            location: formData.location
          };
        } else {
          mockUser = {
            id: `ind-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            type: userType,
            walletAddress: address,
            institution: formData.institution,
            location: formData.location
          };
        }

        onSuccess(mockUser);
        setLoading(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
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

      {/* Organization/Researcher Name */}
      <div>
        <Label htmlFor="name">
          {userType === 'organization' ? 'Organization Name' : userType === 'community' ? 'Full Name' : 'Full Name'}
        </Label>
        <div className="relative mt-1">
          {userType === 'organization' ? (
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          ) : (
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          )}
          <Input
            id="name"
            name="name"
            placeholder={
              userType === 'organization' 
                ? 'Nigerian Research Foundation' 
                : userType === 'community'
                ? 'John Doe'
                : 'Dr. Amaka Okonkwo'
            }
            value={formData.name}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Additional fields based on user type */}
      {userType === 'individual' && (
        <div>
          <Label htmlFor="institution">Institution/Affiliation</Label>
          <div className="relative mt-1">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="institution"
              name="institution"
              placeholder="University of Lagos"
              value={formData.institution}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>
      )}

      {userType === 'organization' && (
        <div>
          <Label htmlFor="organization">Organization Type</Label>
          <select
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
            required
          >
            <option value="">Select type</option>
            <option value="government">Government Agency</option>
            <option value="ngo">NGO/Non-Profit</option>
            <option value="company">Private Company</option>
            <option value="foundation">Foundation</option>
            <option value="university">University/Institution</option>
          </select>
        </div>
      )}

      {/* Location */}
      <div>
        <Label htmlFor="location">Location</Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            id="location"
            name="location"
            placeholder="Lagos, Nigeria"
            value={formData.location}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          {userType === 'organization' 
            ? 'Organization Description' 
            : userType === 'community'
            ? 'Research Interests (Optional)'
            : 'Research Focus'}
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder={
            userType === 'organization'
              ? 'Brief description of your organization and funding goals...'
              : userType === 'community'
              ? 'What research areas are you interested in supporting?'
              : 'Brief description of your research areas and expertise...'
          }
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1"
          required={userType !== 'community'}
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* Wallet Connection */}
      <div>
        <Label>Cardano Wallet Connection</Label>
        {connected ? (
          <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Wallet Connected Successfully</p>
                <p className="text-xs font-mono text-green-700">{address?.slice(0, 20)}...{address?.slice(-10)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            <Alert>
              <Wallet className="size-4" />
              <AlertDescription>
                You must connect a Cardano wallet to create an account.
                This wallet will be used for all transactions.
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
                Connect Cardano Wallet
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWalletGuide(true)}
              className="w-full"
            >
              <HelpCircle className="mr-2 size-4" />
              How to Install a Cardano Wallet
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading || !connected}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-green-600 hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* Terms */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
        <p>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
          Your wallet address will be publicly visible on the Cardano blockchain.
        </p>
      </div>

      {/* Wallet Guide Dialog */}
      <Dialog open={showWalletGuide} onOpenChange={setShowWalletGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Install a Cardano Wallet</DialogTitle>
          </DialogHeader>
          <InstallWalletGuide />
        </DialogContent>
      </Dialog>
    </form>
  );
}