import { ExternalLink, Chrome, Globe } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const walletLinks = [
  {
    name: 'Nami',
    description: 'Simple and secure wallet for Cardano',
    chrome: 'https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo',
    website: 'https://namiwallet.io/',
    recommended: true
  },
  {
    name: 'Eternl',
    description: 'Feature-rich wallet with advanced features',
    chrome: 'https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka',
    website: 'https://eternl.io/',
    recommended: true
  },
  {
    name: 'Flint',
    description: 'Fast and friendly Cardano wallet',
    chrome: 'https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj',
    website: 'https://flint-wallet.com/',
    recommended: false
  },
  {
    name: 'Lace',
    description: 'Light wallet by Input Output',
    chrome: 'https://chrome.google.com/webstore/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk',
    website: 'https://www.lace.io/',
    recommended: false
  },
  {
    name: 'Yoroi',
    description: 'Light wallet by Emurgo',
    chrome: 'https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb',
    website: 'https://yoroi-wallet.com/',
    recommended: false
  }
];

export function InstallWalletGuide() {
  return (
    <div className="space-y-6">
      <div className="p-6">
        <h3 className="text-xl mb-2">Install a Cardano Wallet</h3>
        <p className="text-gray-600">
          To use StemTrust, you need a Cardano wallet. Choose one from the options below:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {walletLinks.map((wallet) => (
          <Card key={wallet.name} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium mb-1">{wallet.name}</h4>
                <p className="text-sm text-gray-600">{wallet.description}</p>
              </div>
              {wallet.recommended && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Recommended
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="flex-1">
                <a href={wallet.chrome} target="_blank" rel="noopener noreferrer">
                  <Chrome className="mr-2 size-4" />
                  Chrome
                </a>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={wallet.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium mb-2">Installation Steps:</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Click on your preferred wallet's Chrome button above</li>
          <li>Install the browser extension from Chrome Web Store</li>
          <li>Create a new wallet and securely store your recovery phrase</li>
          <li>Return to StemTrust and click "Connect Wallet"</li>
          <li>Select your wallet and approve the connection</li>
        </ol>
      </Card>

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h4 className="font-medium mb-2">⚠️ Security Tips:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Never share your recovery phrase with anyone</li>
          <li>Always verify the wallet extension URL before installing</li>
          <li>Keep your recovery phrase in a safe, offline location</li>
          <li>Use a strong password for your wallet</li>
          <li>Only connect to trusted websites like StemTrust</li>
        </ul>
      </Card>
    </div>
  );
}