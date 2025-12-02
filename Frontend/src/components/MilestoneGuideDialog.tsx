import { Info, X, Users, User as UserIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface MilestoneGuideDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MilestoneGuideDialog({ open, onClose }: MilestoneGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Milestone Configuration Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              StemTrust uses different milestone structures depending on whether you're an organization 
              funding multiple projects or an individual researcher applying for funding.
            </p>
          </div>

          {/* Organization Section */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-600 text-white rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-purple-900 mb-2">
                  Organizations & NGOs
                </h3>
                <p className="text-purple-800 mb-4">
                  Create campaigns with <strong>3-10 customizable milestone stages</strong> to match 
                  your specific research goals and funding strategy.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Features
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Flexible stage count:</strong> Minimum 3 stages, maximum 10 stages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Custom funding:</strong> Allocate any percentage per stage (must total 100%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Variable duration:</strong> Set different timeframes for each milestone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Tailored to goals:</strong> Design milestones that match your campaign objectives</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-3">Example Campaign Structures</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <Badge variant="outline" className="mb-2">3-Stage Pilot</Badge>
                    <div className="space-y-1 pl-2 border-l-2 border-purple-300">
                      <div>1. Prototype (40%)</div>
                      <div>2. Testing (35%)</div>
                      <div>3. Deployment (25%)</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mb-2">7-Stage Complex</Badge>
                    <div className="space-y-1 pl-2 border-l-2 border-purple-300 text-xs">
                      <div>1. Analysis (10%)</div>
                      <div>2. Architecture (15%)</div>
                      <div>3. Smart Contracts (20%)</div>
                      <div>4. App Development (20%)</div>
                      <div>5. Integration (15%)</div>
                      <div>6. Pilot (10%)</div>
                      <div>7. Scaling (10%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Researcher Section */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-600 text-white rounded-lg">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-blue-900 mb-2">
                  Individual Researchers
                </h3>
                <p className="text-blue-800 mb-4">
                  Follow a standardized <strong>fixed 5-stage lifecycle</strong> designed for 
                  comprehensive research execution from planning to dissemination.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Fixed 5-Stage Lifecycle
              </h4>
              <div className="space-y-3">
                {[
                  { stage: 1, name: 'Research Planning & Setup', funding: 15, desc: 'Design methodology and prepare research infrastructure' },
                  { stage: 2, name: 'Data Collection & Preliminary Analysis', funding: 20, desc: 'Gather data and conduct initial analysis' },
                  { stage: 3, name: 'Core Research & Development', funding: 30, desc: 'Main research activities and development work' },
                  { stage: 4, name: 'Testing & Validation', funding: 20, desc: 'Validate findings and test solutions' },
                  { stage: 5, name: 'Documentation & Dissemination', funding: 15, desc: 'Finalize documentation and share results' },
                ].map((milestone) => (
                  <div key={milestone.stage} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {milestone.stage}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{milestone.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {milestone.funding}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{milestone.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Common Features */}
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Common to All Milestones
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Community Voting</p>
                  <p className="text-gray-600">
                    All milestones require <strong>75% approval</strong> from community members 
                    to release funds to the next stage.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Evidence Submission</p>
                  <p className="text-gray-600">
                    Researchers must submit verifiable evidence (documents, images, apps, links) 
                    to prove milestone completion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Blockchain Security</p>
                  <p className="text-gray-600">
                    All milestones are secured by Cardano smart contracts ensuring transparent 
                    and immutable fund management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Weighted Voting</p>
                  <p className="text-gray-600">
                    Organizations can assign voting power (1-10) to members, allowing for 
                    expertise-based decision making.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
