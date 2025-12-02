import { useState } from 'react';
import { Clock, Mail, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Project } from '../lib/mockData';

interface PendingProjectPreviewProps {
  project: Project;
}

export function PendingProjectPreview({ project }: PendingProjectPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Pending Status Card */}
      <Card className="p-6 border-2 border-yellow-300 bg-yellow-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-yellow-900" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">Pending Onboarding</h4>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Awaiting Researcher
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span>
                  Email sent to <strong>{project.researcher.email}</strong>
                </span>
              </div>
              
              {project.onboardingStatus?.sentAt && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Sent on {formatDate(project.onboardingStatus.sentAt)}</span>
                </div>
              )}

              <div className="flex items-start gap-2 mt-3 p-3 bg-white rounded-lg border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700">
                  <p className="font-medium mb-1">Waiting for researcher to accept</p>
                  <p>
                    The researcher will need to log in and complete their profile before the project becomes active. 
                    Once accepted, they can start working on milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Toggle */}
      <div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full"
        >
          <Eye className="mr-2 w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} Active Project Preview
          {showPreview ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
        </Button>
      </div>

      {/* Active State Preview */}
      {showPreview && (
        <Card className="p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">How it will look when active</h4>
                <Badge className="bg-green-600">Active</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Preview of the project after researcher accepts onboarding
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-white rounded-lg p-4 border-2 border-dashed border-green-200">
            {/* Project Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {project.researcher.name} • {project.researcher.institution}
                    </span>
                  </div>
                </div>
                <Badge>{project.category}</Badge>
              </div>
            </div>

            {/* Funding Info */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-6 text-sm">
                <span className="text-gray-600">
                  Total: <span className="font-medium">{project.totalFunding.toLocaleString()} ADA</span>
                </span>
                <span className="text-gray-600">
                  Backers: <span className="font-medium">{project.assignedMembers?.length || 0}</span>
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Milestone 1/{project.milestones.length}
              </Badge>
            </div>

            {/* Milestones Preview */}
            <div className="pt-4 border-t">
              <h5 className="font-medium mb-3 text-sm">Project Milestones</h5>
              <div className="space-y-2">
                {project.milestones.slice(0, 3).map((milestone, idx) => (
                  <div key={milestone.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-700 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{milestone.name}</p>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {milestone.fundingAmount.toLocaleString()} ADA
                    </span>
                  </div>
                ))}
                {project.milestones.length > 3 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{project.milestones.length - 3} more milestones
                  </p>
                )}
              </div>
            </div>

            {/* Researcher Wallet Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  Researcher wallet will be connected
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  Community voting will be enabled
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This is a preview. The project will automatically activate once the researcher 
              accepts the invitation and completes their profile setup.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
