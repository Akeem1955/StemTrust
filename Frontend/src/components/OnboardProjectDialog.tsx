import { X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';

interface OnboardProjectDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

export function OnboardProjectDialog({ open, onClose, organizationId }: OnboardProjectDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: Onboard project via smart contract
    alert('Project onboarded successfully! (Mock)');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard Research Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Onboard a specific research project to your campaign. The project will inherit 
              the milestone structure from your campaign.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="researcher-wallet">Researcher Wallet Address</Label>
            <Input
              id="researcher-wallet"
              placeholder="addr1..."
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              The researcher must connect their Cardano wallet to receive funds
            </p>
          </div>

          <div>
            <Label htmlFor="project-title">Project Title</Label>
            <Input
              id="project-title"
              placeholder="e.g., AI-Powered Agricultural Pest Detection System"
              required
            />
          </div>

          <div>
            <Label htmlFor="project-description">Project Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe the research project, its goals, and expected outcomes..."
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="researcher-name">Researcher Name</Label>
              <Input
                id="researcher-name"
                placeholder="e.g., Dr. Amaka Okonkwo"
                required
              />
            </div>

            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="e.g., University of Lagos"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Research Category</Label>
              <Input
                id="category"
                placeholder="e.g., Agriculture Technology"
                required
              />
            </div>

            <div>
              <Label htmlFor="funding">Total Funding (ADA)</Label>
              <Input
                id="funding"
                type="number"
                placeholder="e.g., 50000"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="campaign">Select Campaign (Optional)</Label>
            <select
              id="campaign"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">No campaign (standalone project)</option>
              <option value="camp-1">AgriTech Innovation Fund 2024</option>
              <option value="camp-2">Cocoa Value Chain Enhancement</option>
            </select>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Project Requirements</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Project will follow your campaign's milestone structure</li>
              <li>Researcher must submit evidence for each milestone</li>
              <li>75% funder approval needed to unlock each stage</li>
              <li>Funds released automatically via smart contract</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Onboard Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
