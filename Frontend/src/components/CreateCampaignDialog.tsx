import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCampaignDialog({ open, onClose }: CreateCampaignDialogProps) {
  const [stagesCount, setStagesCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: Create campaign via smart contract
    alert('Campaign created successfully! (Mock)');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Funding Campaign</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Campaigns allow you to fund multiple projects under a common theme. 
              You can customize the number of milestones (3-10 stages).
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              placeholder="e.g., AgriTech Innovation Fund 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the goals and focus areas of this campaign..."
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Total Budget (ADA)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 200000"
                required
              />
            </div>

            <div>
              <Label htmlFor="stages">Number of Milestone Stages</Label>
              <div className="space-y-2">
                <Input
                  id="stages"
                  type="number"
                  min={3}
                  max={10}
                  value={stagesCount}
                  onChange={(e) => setStagesCount(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-gray-600">
                  Default: 5 stages (Min: 3, Max: 10)
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Milestone Stages</Label>
            <div className="space-y-3 mt-2">
              {Array.from({ length: stagesCount }, (_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                    {i + 1}
                  </span>
                  <Input
                    placeholder={`Stage ${i + 1} name (e.g., ${
                      i === 0 ? 'Research & Planning' :
                      i === 1 ? 'Development' :
                      i === stagesCount - 1 ? 'Launch & Deployment' :
                      'Implementation'
                    })`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Smart Contract Details</h4>
            <p className="text-sm text-gray-700 mb-2">
              Your campaign will be deployed as a Cardano smart contract with the following properties:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Funds locked until milestones are approved</li>
              <li>75% community vote required for progression</li>
              <li>Automatic fund minting per stage approval</li>
              <li>Transparent and immutable record on blockchain</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
