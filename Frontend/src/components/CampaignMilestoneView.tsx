import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CampaignMilestoneTemplate } from '../lib/mockData';

interface CampaignMilestoneViewProps {
  milestones: CampaignMilestoneTemplate[];
  totalBudget: number;
  isExpanded?: boolean;
}

export function CampaignMilestoneView({ 
  milestones, 
  totalBudget,
  isExpanded: defaultExpanded = false 
}: CampaignMilestoneViewProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Milestone Structure ({milestones.length} stages):</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Expand
            </>
          )}
        </Button>
      </div>

      {!isExpanded ? (
        // Compact view
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 border"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {milestone.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {milestone.fundingPercentage}%
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {milestone.durationWeeks}w
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Expanded view
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const fundingAmount = (totalBudget * milestone.fundingPercentage) / 100;
            
            return (
              <Card key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start gap-4">
                  {/* Stage Number */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium mb-1">{milestone.title}</h5>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                      <Badge className="flex-shrink-0">
                        Stage {index + 1}/{milestones.length}
                      </Badge>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{milestone.fundingPercentage}%</span>
                        <span className="text-gray-600">
                          ({fundingAmount.toLocaleString()} ADA)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{milestone.durationWeeks} weeks</span>
                        <span className="text-gray-600">duration</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span>Requires 75% approval</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                {index < milestones.length - 1 && (
                  <div className="ml-5 mt-3 pl-5 border-l-2 border-dashed border-gray-300 h-4"></div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
