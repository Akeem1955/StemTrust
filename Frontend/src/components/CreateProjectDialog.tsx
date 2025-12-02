import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { MilestoneComparisonInfo } from './MilestoneComparisonInfo';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  researcherId: string;
}

export function CreateProjectDialog({ open, onClose, researcherId }: CreateProjectDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: Create project via smart contract
    alert('Funding application submitted successfully! (Mock)');
    onClose();
  };

  const defaultMilestones = [
    'Research & Planning',
    'Development & Prototyping',
    'Testing & Validation',
    'Deployment & Scale',
    'Documentation & Reporting'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Research Funding</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Individual researchers have a fixed 5-stage milestone structure. 
              You'll submit evidence for each stage to receive funding.
            </AlertDescription>
          </Alert>

          <MilestoneComparisonInfo showForType="researcher" />

          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="e.g., AI-Powered Agricultural Pest Detection System"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your research project, its objectives, methodology, and expected impact..."
              rows={5}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Research Category</Label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select category</option>
                <option value="agriculture">Agriculture Technology</option>
                <option value="health">Health Sciences</option>
                <option value="energy">Renewable Energy</option>
                <option value="education">Education Technology</option>
                <option value="environment">Environmental Science</option>
                <option value="blockchain">Blockchain & Fintech</option>
                <option value="engineering">Engineering</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="funding">Funding Requested (ADA)</Label>
              <Input
                id="funding"
                type="number"
                placeholder="e.g., 50000"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="institution">Institution/Affiliation</Label>
            <Input
              id="institution"
              placeholder="e.g., University of Lagos"
              required
            />
          </div>

          <div>
            <Label>Fixed Milestone Structure (5 Stages)</Label>
            <p className="text-sm text-gray-600 mb-3">
              Your project will follow these standard milestones. 
              Customize funding allocation for each stage:
            </p>
            <div className="space-y-3">
              {defaultMilestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{milestone}</p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="ADA"
                      className="text-sm"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="wallet">Your Cardano Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="addr1..."
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              Funds will be sent to this wallet upon milestone approval
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">How It Works</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Submit your application with project details</li>
              <li>Wait for community funders to back your project</li>
              <li>Complete each milestone and upload evidence</li>
              <li>Receive 75% community approval to unlock funds</li>
              <li>Funds automatically transferred via smart contract</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
