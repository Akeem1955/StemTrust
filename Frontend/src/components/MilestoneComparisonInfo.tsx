import { Info, Users, User as UserIcon, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface MilestoneComparisonInfoProps {
  showForType: 'organization' | 'researcher';
}

export function MilestoneComparisonInfo({ showForType }: MilestoneComparisonInfoProps) {
  if (showForType === 'researcher') {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Individual Researcher: Fixed 5-Stage Lifecycle</h4>
            </div>
            <p className="text-sm text-blue-800">
              As an individual researcher, your project follows a standardized 5-stage lifecycle designed 
              for comprehensive research execution.
            </p>
            <div className="space-y-2 mt-3">
              {[
                { stage: 1, name: 'Research Planning & Setup', funding: '15%' },
                { stage: 2, name: 'Data Collection & Preliminary Analysis', funding: '20%' },
                { stage: 3, name: 'Core Research & Development', funding: '30%' },
                { stage: 4, name: 'Testing & Validation', funding: '20%' },
                { stage: 5, name: 'Documentation & Dissemination', funding: '15%' },
              ].map((milestone) => (
                <div key={milestone.stage} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Stage {milestone.stage}:</span>
                  <span>{milestone.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {milestone.funding}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Organization view
  return (
    <Card className="p-4 bg-purple-50 border-purple-200">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-purple-900">Organization: Customizable Milestone Stages</h4>
          </div>
          <p className="text-sm text-purple-800">
            Organizations can create campaigns with <strong>3-10 customizable milestone stages</strong>, 
            allowing you to tailor funding allocation and project phases to your specific research goals.
          </p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Minimum 3 stages, maximum 10 stages</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Custom funding percentage per stage (must total 100%)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Flexible duration for each milestone</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Tailored to your research objectives</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
