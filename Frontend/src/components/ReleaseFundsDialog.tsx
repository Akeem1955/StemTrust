import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../lib/api';

interface ReleaseFundsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    milestone: {
        id: string;
        stageNumber: number;
        title: string;
        fundingAmount: number;
    };
    researcherName: string;
    onSuccess?: () => void;
}

export function ReleaseFundsDialog({
    isOpen,
    onClose,
    projectId,
    milestone,
    researcherName,
    onSuccess
}: ReleaseFundsDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

    const handleReleaseFunds = async () => {
        setIsLoading(true);
        setError(null);
        setStep('processing');

        try {
            console.log('[ReleaseFunds] Calling backend to release funds...');
            console.log('[ReleaseFunds] ProjectId:', projectId, 'MilestoneId:', milestone.id);

            // Call the backend-only release endpoint
            const result = await api.releaseFundsBackend(projectId, milestone.id);

            console.log('[ReleaseFunds] SUCCESS!', result);

            setTxHash(result.transactionHash);
            setStep('success');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error('[ReleaseFunds] ERROR:', err);
            setError(err.message || 'Failed to release funds');
            setStep('confirm');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            setTxHash(null);
            setStep('confirm');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'success' ? '✅ Funds Released!' : 'Release Milestone Funds'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'success'
                            ? `Successfully released ${milestone.fundingAmount} ADA to ${researcherName}`
                            : `Milestone ${milestone.stageNumber}: ${milestone.title}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 'confirm' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-muted-foreground">Amount to Release:</span>
                                    <span className="font-bold text-lg">{milestone.fundingAmount} ADA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recipient:</span>
                                    <span className="font-medium">{researcherName}</span>
                                </div>
                            </div>

                            <Alert>
                                <AlertDescription>
                                    This will release the funds from the smart contract to the researcher's wallet.
                                    The transaction will be processed automatically by the platform.
                                </AlertDescription>
                            </Alert>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-8">
                            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-lg font-medium">Releasing funds from smart contract...</p>
                            <p className="text-muted-foreground">This may take a few moments</p>
                        </div>
                    )}

                    {step === 'success' && txHash && (
                        <div className="space-y-4">
                            <Alert className="bg-green-50 border-green-200">
                                <AlertDescription className="text-green-800">
                                    Transaction submitted successfully! Funds have been sent to the researcher.
                                </AlertDescription>
                            </Alert>

                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Transaction Hash:</p>
                                <p className="font-mono text-xs break-all">{txHash}</p>
                                <a
                                    href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline mt-2 inline-block"
                                >
                                    View on Cardanoscan →
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'confirm' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReleaseFunds}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Release Funds'}
                            </Button>
                        </>
                    )}

                    {step === 'success' && (
                        <Button onClick={handleClose}>Close</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ReleaseFundsDialog;
