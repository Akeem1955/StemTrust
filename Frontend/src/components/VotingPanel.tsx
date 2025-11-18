import { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { User } from '../App';
import { Project, Milestone } from '../lib/mockData';

interface VotingPanelProps {
  project: Project;
  currentUser: User | null;
  isBacker: boolean;
}

export function VotingPanel({ project, currentUser, isBacker }: VotingPanelProps) {
  const [votingMilestone, setVotingMilestone] = useState<string | null>(null);

  const votingMilestones = project.milestones.filter(m => m.status === 'voting');

  const handleVote = (milestoneId: string, vote: 'approve' | 'reject') => {
    // In production: Submit vote to smart contract
    setVotingMilestone(milestoneId);
    setTimeout(() => {
      alert(`Vote ${vote === 'approve' ? 'APPROVED' : 'REJECTED'} recorded on blockchain! (Mock)`);
      setVotingMilestone(null);
    }, 1000);
  };

  if (!isBacker) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="size-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl mb-2">Not a Backer</h3>
        <p className="text-gray-600 mb-6">
          Only project backers can vote on milestone approvals.
          Fund this project to participate in governance.
        </p>
        <Button>
          Back This Project
        </Button>
      </Card>
    );
  }

  if (votingMilestones.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="size-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl mb-2">No Active Votes</h3>
        <p className="text-gray-600">
          There are currently no milestones awaiting your vote.
          You'll be notified when the researcher submits evidence for review.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          As a backer, you can vote on milestone completion. 75% approval is required 
          to release funds. Your vote is recorded on the Cardano blockchain.
        </AlertDescription>
      </Alert>

      {votingMilestones.map(milestone => {
        const approvalPercentage = (milestone.votesFor / milestone.totalVoters) * 100;
        const rejectionPercentage = (milestone.votesAgainst / milestone.totalVoters) * 100;
        const isApproved = approvalPercentage >= 75;

        return (
          <Card key={milestone.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl mb-2">
                  Stage {milestone.stageNumber}: {milestone.name}
                </h3>
                <p className="text-gray-600 mb-3">{milestone.description}</p>
                <p className="text-sm">
                  Funding at stake: <span className="font-medium">{milestone.fundingAmount.toLocaleString()} ADA</span>
                </p>
              </div>
              <Badge variant="secondary">Voting Open</Badge>
            </div>

            {/* Evidence Review */}
            {milestone.evidence && milestone.evidence.length > 0 && (
              <div className="border-t border-b py-4 my-4">
                <h4 className="mb-3">Evidence Submitted</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {milestone.evidence.map(evidence => (
                    <div key={evidence.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{evidence.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {evidence.type}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                            Review
                          </a>
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">{evidence.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded: {evidence.uploadedAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voting Stats */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Current Votes</span>
                <span className="font-medium">
                  {milestone.votesFor + milestone.votesAgainst} of {milestone.totalVoters}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="size-4 text-green-600" />
                      <span>Approve</span>
                    </div>
                    <span className="font-medium text-green-600">
                      {milestone.votesFor} ({approvalPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={approvalPercentage} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="size-4 text-red-600" />
                      <span>Reject</span>
                    </div>
                    <span className="font-medium text-red-600">
                      {milestone.votesAgainst} ({rejectionPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={rejectionPercentage} className="h-2 [&>div]:bg-red-600" />
                </div>
              </div>

              {isApproved ? (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="size-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    This milestone has reached 75% approval! Funds will be released automatically 
                    via smart contract to the researcher's wallet.
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-sm text-gray-600 mt-3">
                  {(75 - approvalPercentage).toFixed(0)}% more approval needed to release {milestone.fundingAmount.toLocaleString()} ADA
                </p>
              )}
            </div>

            {/* Voting Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleVote(milestone.id, 'approve')}
                disabled={votingMilestone === milestone.id}
                className="flex-1"
              >
                <ThumbsUp className="mr-2 size-4" />
                {votingMilestone === milestone.id ? 'Submitting...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVote(milestone.id, 'reject')}
                disabled={votingMilestone === milestone.id}
                className="flex-1"
              >
                <ThumbsDown className="mr-2 size-4" />
                {votingMilestone === milestone.id ? 'Submitting...' : 'Reject'}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>On-chain Voting:</strong> Your vote is recorded on the Cardano blockchain 
                using Plutus smart contracts. It cannot be changed once submitted.
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
