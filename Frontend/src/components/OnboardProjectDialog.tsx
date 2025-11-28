import { useState } from 'react';
import { X, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { onboardProject } from '../lib/api';

interface OnboardProjectDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

export function OnboardProjectDialog({ open, onClose, organizationId }: OnboardProjectDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [researcherEmail, setResearcherEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [researcherName, setResearcherName] = useState('');
  const [institution, setInstitution] = useState('');
  const [category, setCategory] = useState('');
  const [totalFunding, setTotalFunding] = useState('');
  const [campaignId, setCampaignId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!researcherEmail.trim()) {
      toast.error('Please enter researcher email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(researcherEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);

      // Create milestone structure (fixed 5-stage lifecycle for individual researchers)
      const milestones = [
        {
          title: 'Stage 1: Research Planning & Setup',
          description: 'Initial research design, methodology setup, and resource acquisition',
          fundingAmount: parseFloat(totalFunding) * 0.15,
          durationWeeks: 4,
        },
        {
          title: 'Stage 2: Data Collection & Preliminary Analysis',
          description: 'Gather research data and conduct preliminary analysis',
          fundingAmount: parseFloat(totalFunding) * 0.20,
          durationWeeks: 8,
        },
        {
          title: 'Stage 3: Core Research & Development',
          description: 'Execute main research activities and development work',
          fundingAmount: parseFloat(totalFunding) * 0.30,
          durationWeeks: 12,
        },
        {
          title: 'Stage 4: Testing & Validation',
          description: 'Test results, validate findings, and refine outcomes',
          fundingAmount: parseFloat(totalFunding) * 0.20,
          durationWeeks: 6,
        },
        {
          title: 'Stage 5: Documentation & Dissemination',
          description: 'Final documentation, reporting, and knowledge sharing',
          fundingAmount: parseFloat(totalFunding) * 0.15,
          durationWeeks: 4,
        },
      ];

      // Call the API to onboard project
      const response = await onboardProject({
        organizationId,
        campaignId: campaignId || undefined,
        researcherEmail,
        projectTitle,
        projectDescription,
        totalFunding: parseFloat(totalFunding),
        milestones,
      });

      if (response.emailSent) {
        toast.success(
          <>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Project Onboarded Successfully!</p>
                <p className="text-sm mt-1">
                  Login instructions sent to <strong>{response.researcherEmail}</strong>
                </p>
              </div>
            </div>
          </>
        );
      } else {
        toast.success('Project onboarded successfully');
      }

      // Reset form
      setResearcherEmail('');
      setProjectTitle('');
      setProjectDescription('');
      setResearcherName('');
      setInstitution('');
      setCategory('');
      setTotalFunding('');
      setCampaignId('');
      
      onClose();
    } catch (error) {
      toast.error('Failed to onboard project. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
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
              Onboard a specific research project. The researcher will automatically receive login instructions 
              via email and the project will follow a fixed 5-stage lifecycle.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="researcher-email">
              Researcher Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="researcher-email"
                type="email"
                placeholder="researcher@university.edu.ng"
                value={researcherEmail}
                onChange={(e) => setResearcherEmail(e.target.value)}
                required
                disabled={submitting}
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Login instructions will be automatically sent to this email
            </p>
          </div>

          <div>
            <Label htmlFor="project-title">Project Title</Label>
            <Input
              id="project-title"
              placeholder="e.g., AI-Powered Agricultural Pest Detection System"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="project-description">Project Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe the research project, its goals, and expected outcomes..."
              rows={4}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="researcher-name">Researcher Name</Label>
              <Input
                id="researcher-name"
                placeholder="e.g., Dr. Amaka Okonkwo"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="e.g., University of Lagos"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Research Category</Label>
              <Input
                id="category"
                placeholder="e.g., Agriculture Technology"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="funding">Total Funding (ADA)</Label>
              <Input
                id="funding"
                type="number"
                placeholder="e.g., 50000"
                value={totalFunding}
                onChange={(e) => setTotalFunding(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="campaign">Select Campaign (Optional)</Label>
            <select
              id="campaign"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              disabled={submitting}
            >
              <option value="">No campaign (standalone project)</option>
              <option value="camp-1">AgriTech Innovation Fund 2024</option>
              <option value="camp-2">Cocoa Value Chain Enhancement</option>
            </select>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Fixed 5-Stage Lifecycle</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Stage 1: Research Planning & Setup (15% funding)</li>
              <li>Stage 2: Data Collection & Preliminary Analysis (20% funding)</li>
              <li>Stage 3: Core Research & Development (30% funding)</li>
              <li>Stage 4: Testing & Validation (20% funding)</li>
              <li>Stage 5: Documentation & Dissemination (15% funding)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Automatic Email Notification</p>
                <p>
                  The researcher will receive an email with login credentials and platform access instructions 
                  at <strong>{researcherEmail || 'the provided email'}</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Onboarding...
                </>
              ) : (
                'Onboard Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
