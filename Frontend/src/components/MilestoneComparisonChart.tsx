import { Users, User as UserIcon, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export function MilestoneComparisonChart() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Organization Milestones */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 text-white rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">Organizations</h3>
            <p className="text-sm text-gray-600">Customizable Milestones</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Minimum Stages:</span>
            <Badge variant="outline">3</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Maximum Stages:</span>
            <Badge variant="outline">10</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Funding Allocation:</span>
            <Badge>Custom %</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Duration:</span>
            <Badge>Flexible</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Use Case:</span>
            <Badge className="bg-purple-600">Complex Projects</Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-gray-600">
            Perfect for campaigns with varying complexity, allowing organizations to 
            tailor milestone structure to specific project needs.
          </p>
        </div>
      </Card>

      {/* Researcher Milestones */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">Individual Researchers</h3>
            <p className="text-sm text-gray-600">Fixed 5-Stage Lifecycle</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Total Stages:</span>
            <Badge variant="outline">5 (Fixed)</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Planning & Setup:</span>
            <Badge>15%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Data Collection:</span>
            <Badge>20%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Core Research:</span>
            <Badge>30%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Testing:</span>
            <Badge>20%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Documentation:</span>
            <Badge>15%</Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            Standardized lifecycle based on research best practices, ensuring consistency 
            and simplicity for individual researchers.
          </p>
        </div>
      </Card>
    </div>
  );
}
