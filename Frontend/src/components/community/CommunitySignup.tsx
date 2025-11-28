import { Users, Heart, TrendingUp, Vote } from 'lucide-react';

interface CommunitySignupProps {
  onComplete: () => void;
  onWalletConnect: () => void;
  walletConnected: boolean;
}

export function CommunitySignup({ onComplete, onWalletConnect, walletConnected }: CommunitySignupProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-indigo-600 mb-2">StemTrust</h1>
          <p className="text-gray-600">Join as a Community Member</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-gray-900 mb-3">Become a Community Member</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Support groundbreaking STEM research in Nigeria. Discover innovative projects, 
              contribute with small donations, and help shape the future of research funding 
              through transparent blockchain-based voting.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Discover Projects</h3>
                <p className="text-gray-600 text-sm">
                  Browse trending research projects across various STEM fields and find work that resonates with you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Support Researchers</h3>
                <p className="text-gray-600 text-sm">
                  Make small ADA donations to projects you believe in and follow researchers to stay updated.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Vote className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Vote on Milestones</h3>
                <p className="text-gray-600 text-sm">
                  Contributors become voters and help approve milestone completions with 75% community consensus.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Build Community</h3>
                <p className="text-gray-600 text-sm">
                  Connect with like-minded individuals passionate about advancing STEM research in Nigeria.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={onWalletConnect}
              disabled={walletConnected}
              className={`w-full py-4 px-6 rounded-xl transition-all ${
                walletConnected
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {walletConnected ? '✓ Wallet Connected' : 'Connect Cardano Wallet'}
            </button>

            <button
              onClick={onComplete}
              disabled={!walletConnected}
              className={`w-full py-4 px-6 rounded-xl transition-all ${
                walletConnected
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to Dashboard
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <strong>Note:</strong> A Cardano wallet is required to support projects and participate in voting. 
              We support Nami, Eternl, Flint, Yoroi, Lace, Gero, Typhon, and NuFi wallets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
