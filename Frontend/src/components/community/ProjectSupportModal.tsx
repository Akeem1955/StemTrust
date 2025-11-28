import { useState } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, Heart, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';

interface ProjectSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    researcher: string;
    category: string;
  };
  walletBalance: string;
  onConfirmSupport: (projectId: string, amount: number) => void;
}

export function ProjectSupportModal({
  isOpen,
  onClose,
  project,
  walletBalance,
  onConfirmSupport,
}: ProjectSupportModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError(null);
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const walletBalanceNum = parseFloat(walletBalance.replace(/[^\d.-]/g, ''));
    if (numAmount > walletBalanceNum) {
      setError('Insufficient balance in your wallet');
      return;
    }

    if (numAmount < 5) {
      setError('Minimum donation amount is 5 ₳');
      return;
    }

    // Simulate transaction
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate blockchain transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      onConfirmSupport(project.id, numAmount);
      setIsSuccess(true);

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Transaction failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setError(null);
      setIsSuccess(false);
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-gray-900">Support Project</h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Support Successful!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for supporting <strong>{project.researcher}</strong>'s research.
              You can now vote on project milestones.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>{amount} ₳</strong> has been sent to the project smart contract
              </p>
            </div>
          </div>
        )}

        {/* Form State */}
        {!isSuccess && (
          <>
            {/* Project Info */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-1 truncate">{project.title}</h3>
                  <p className="text-sm text-gray-600">by {project.researcher}</p>
                  <span className="inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded mt-2">
                    {project.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Wallet Balance */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm">Your Wallet Balance</span>
                  </div>
                  <span className="text-gray-900">{walletBalance}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Donation Amount (₳)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter amount in ADA"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₳
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum donation: 5 ₳ (Transaction fee not included)
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm">
                  Quick Select Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => handleQuickAmount(quickAmount)}
                      disabled={isProcessing}
                      className={`py-2 px-3 rounded-lg text-sm transition-colors border ${
                        amount === quickAmount.toString()
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {quickAmount} ₳
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefits Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm text-gray-900 mb-2">
                  By supporting this project, you will:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Become a voter on milestone approvals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Receive project updates and notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Help advance STEM research in Nigeria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Build your support history on blockchain</span>
                  </li>
                </ul>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Transaction Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs text-gray-700">
                  <strong>Note:</strong> Your donation will be locked in a Cardano smart contract
                  and released milestone-by-milestone based on 75% community approval. All
                  transactions are recorded on the blockchain.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Confirm Support
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
