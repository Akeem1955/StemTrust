import { AlertTriangle } from 'lucide-react';

export function TestnetWarning() {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
                <strong>Warning:</strong> Ensure you are connected to the <strong>Cardano Preprod Testnet</strong>.
                Using Mainnet may result in <strong>loss of funds</strong>.
            </p>
        </div>
    );
}
