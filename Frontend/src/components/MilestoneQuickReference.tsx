import { Info, Users, User as UserIcon, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface MilestoneQuickReferenceProps {
  type: 'organization' | 'researcher';
}

export function MilestoneQuickReference({ type }: MilestoneQuickReferenceProps) {
  if (type === 'organization') {
    return (
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-white border-purple-200">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-purple-900 mb-2">Organization Milestones</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>3-10 customizable stages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Custom funding % per stage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Flexible duration per milestone</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <span className="text-xs text-gray-600">Total Allocation:</span>
                <Badge variant="outline">Must equal 100%</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-white border-blue-200">
      <div className="flex items-start gap-3">
        <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-2">Researcher Milestones</h4>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span>1. Planning & Setup</span>
              <Badge variant="secondary" className="text-xs">15%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>2. Data Collection</span>
              <Badge variant="secondary" className="text-xs">20%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>3. Core Research</span>
              <Badge variant="secondary" className="text-xs">30%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>4. Testing</span>
              <Badge variant="secondary" className="text-xs">20%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>5. Documentation</span>
              <Badge variant="secondary" className="text-xs">15%</Badge>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-xs text-gray-600">Fixed Structure:</span>
              <Badge variant="outline">5 Stages</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
