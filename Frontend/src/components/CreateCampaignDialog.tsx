import { Rocket, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

export function CreateCampaignDialog({ open, onClose, organizationId }: CreateCampaignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Funding Campaign</DialogTitle>
        </DialogHeader>

        <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50">
          <Rocket className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl mb-3">Coming Soon!</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            The campaign feature is currently under development. For now, you can onboard 
            individual research projects directly with customizable milestone structures.
          </p>
          <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-medium mb-2">What you can do now:</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Onboard research projects directly</li>
              <li>Choose between fixed 5-stage or custom 3-10 stage milestones</li>
              <li>Manage organization members and voting power</li>
              <li>Track project progress and approve milestones</li>
            </ul>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
