import { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle,
  Users,
  Vote,
  Clock,
  Shield,
  FileText,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { User } from '../App';
import { Project, Milestone, submitVote, api, OrganizationMember } from '../lib/api';
import { useWallet } from './WalletProvider';
import { toast } from 'sonner';

interface VotingPanelProps {
  project: Project;
  currentUser: User | null;
  isBacker: boolean;
  isResearcher?: boolean;
}

export function VotingPanel({ project, currentUser, isBacker, isResearcher = false }: VotingPanelProps) {
  const [votingMilestone, setVotingMilestone] = useState<string | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const { connected, signData, address, walletName } = useWallet();

  const isOrganization = currentUser?.role === 'organization';
  const isProjectOrganization = isOrganization && currentUser?.organizationId === project.organizationId;

  // Load organization members for voting power display
  useEffect(() => {
    async function loadMembers() {
      if (isProjectOrganization && project.organizationId) {
        setLoadingMembers(true);
        try {
          const memberData = await api.getOrganizationMembers(project.organizationId);
          setMembers(memberData);
        } catch (e) {
          console.error('Failed to load members', e);
        } finally {
          setLoadingMembers(false);
        }
      }
    }
    loadMembers();
  }, [isProjectOrganization, project.organizationId]);

  const votingMilestones = project.milestones.filter(m => m.status === 'voting');
  const totalVotingPower = members.reduce((sum, m) => sum + m.votingPower, 0);

  const handleVote = async (milestoneId: string, voteType: 'approve' | 'reject') => {
    if (!connected) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (!isProjectOrganization) {
      toast.error('Only the sponsoring organization can vote on this project');
      return;
    }

    // Find the member ID from loaded members
    // Match by email since that's what links user to member
    const currentMember = members.find(m => m.email === currentUser?.email);

    if (!currentMember) {
      toast.error('You are not a voting member of this organization');
      return;
    }

    const memberId = currentMember.id;
    const memberVotingPower = currentMember.votingPower || 1;

    setVotingMilestone(milestoneId);
    try {
      // Sign the vote
      const message = JSON.stringify({
        milestoneId,
        voteType,
        timestamp: Date.now(),
        voter: memberId,
        organizationId: project.organizationId
      });

      let signature = '';
      try {
        if (signData) {
          signature = await signData(message);
        }
      } catch (err) {
        console.error('Signing failed', err);
        toast.error('Failed to sign vote. Please try again.');
        setVotingMilestone(null);
        return;
      }

      // Submit to backend
      const response = await submitVote({
        milestoneId,
        projectId: project.id,
        memberId,
        voteType,
        votingPower: memberVotingPower,
        signature,
        walletAddress: address || undefined
      });

      if (response.success) {
        toast.success(`Vote ${voteType === 'approve' ? 'APPROVED' : 'REJECTED'} recorded!`);

        // Handle fund release if threshold reached
        if (response.releaseData && voteType === 'approve') {
          toast.success('Threshold reached! Funds will be released to the researcher.');
        }
      }
    } catch (error: any) {
      console.error('Vote submission error:', error);
      toast.error(error.message || 'Failed to submit vote');
    } finally {
      setVotingMilestone(null);
    }
  };

  // Researcher view - can only view, not vote
  if (isResearcher) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Vote className="size-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Researcher Voting View</h3>
              <p className="text-blue-700">
                You can view the voting progress on your milestones, but cannot vote on your own project.
                The sponsoring organization and their members will review and vote on your submitted evidence.
              </p>
            </div>
          </div>
        </Card>

        {votingMilestones.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Milestones Under Review</h3>
            <p className="text-gray-600">
              Submit evidence for your current milestone to initiate the voting process.
            </p>
          </Card>
        ) : (
          votingMilestones.map(milestone => (
            <MilestoneVotingCard
              key={milestone.id}
              milestone={milestone}
              readOnly={true}
              expanded={expandedMilestone === milestone.id}
              onToggleExpand={() => setExpandedMilestone(
                expandedMilestone === milestone.id ? null : milestone.id
              )}
            />
          ))
        )}
      </div>
    );
  }

  // Non-organization, non-backer view
  if (!isProjectOrganization && !isBacker) {
    return (
      <Card className="p-8 text-center">
        <Shield className="size-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Voting Access Restricted</h3>
        <p className="text-gray-600 mb-4">
          Only the sponsoring organization ({project.organizationName}) can vote on milestone approvals for this project.
        </p>
        <Badge variant="outline" className="text-sm">
          Project sponsored by: {project.organizationName}
        </Badge>
      </Card>
    );
  }

  // No active votes
  if (votingMilestones.length === 0) {
    return (
      <div className="space-y-6">
        {isProjectOrganization && (
          <OrganizationVotingHeader
            members={members}
            totalVotingPower={totalVotingPower}
            loading={loadingMembers}
          />
        )}

        <Card className="p-8 text-center">
          <CheckCircle className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Pending Votes</h3>
          <p className="text-gray-600">
            There are no milestones awaiting approval. You'll be notified when the researcher
            submits evidence for review.
          </p>
        </Card>
      </div>
    );
  }

  // Organization voting view
  return (
    <div className="space-y-6">
      {isProjectOrganization && (
        <OrganizationVotingHeader
          members={members}
          totalVotingPower={totalVotingPower}
          loading={loadingMembers}
        />
      )}

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="size-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Important:</strong> 75% approval is required to release milestone funds.
          Your vote is recorded on the Cardano blockchain and cannot be changed.
        </AlertDescription>
      </Alert>

      {votingMilestones.map(milestone => (
        <MilestoneVotingCard
          key={milestone.id}
          milestone={milestone}
          readOnly={false}
          expanded={expandedMilestone === milestone.id}
          onToggleExpand={() => setExpandedMilestone(
            expandedMilestone === milestone.id ? null : milestone.id
          )}
          onVote={handleVote}
          isVoting={votingMilestone === milestone.id}
          connected={connected}
        />
      ))}
    </div>
  );
}

// Organization voting header with member info
function OrganizationVotingHeader({
  members,
  totalVotingPower,
  loading
}: {
  members: OrganizationMember[];
  totalVotingPower: number;
  loading: boolean;
}) {
  return (
    <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Users className="size-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-1">Organization Voting Panel</h3>
            <p className="text-emerald-700 mb-3">
              As the sponsoring organization, you have authority to approve or reject milestone completions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white/60 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">
            {loading ? <Loader2 className="size-5 animate-spin mx-auto" /> : members.length}
          </p>
          <p className="text-sm text-emerald-600">Voting Members</p>
        </div>
        <div className="bg-white/60 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{totalVotingPower}</p>
          <p className="text-sm text-emerald-600">Total Voting Power</p>
        </div>
        <div className="bg-white/60 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">75%</p>
          <p className="text-sm text-emerald-600">Approval Threshold</p>
        </div>
      </div>
    </Card>
  );
}

// Individual milestone voting card
function MilestoneVotingCard({
  milestone,
  readOnly,
  expanded,
  onToggleExpand,
  onVote,
  isVoting,
  connected
}: {
  milestone: Milestone;
  readOnly: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onVote?: (milestoneId: string, voteType: 'approve' | 'reject') => void;
  isVoting?: boolean;
  connected?: boolean;
}) {
  const approveVotes = milestone.votingSummary?.approveVotes || 0;
  const rejectVotes = milestone.votingSummary?.rejectVotes || 0;
  const totalPower = milestone.votingSummary?.totalVotingPower || 1;
  const approvalPercentage = milestone.votingSummary?.percentageApproved || 0;
  const rejectionPercentage = totalPower > 0 ? (rejectVotes / totalPower) * 100 : 0;
  const isApproved = approvalPercentage >= 75;

  return (
    <Card className={`overflow-hidden ${isApproved ? 'border-green-300 bg-green-50/30' : ''}`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Stage {milestone.stageNumber}
              </Badge>
              <Badge variant={isApproved ? 'default' : 'outline'} className={isApproved ? 'bg-green-600' : ''}>
                {isApproved ? 'Approved' : 'Voting Open'}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
            <p className="text-gray-600">{milestone.description}</p>
          </div>
          <div className="text-right ml-4">
            <p className="text-sm text-gray-500">Funding at stake</p>
            <p className="text-2xl font-bold text-gray-900">
              {milestone.fundingAmount.toLocaleString()} <span className="text-sm font-normal">ADA</span>
            </p>
          </div>
        </div>

        {/* Voting Progress */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Voting Progress</span>
            <span className="text-sm text-gray-600">
              {approvalPercentage.toFixed(0)}% of 75% needed
            </span>
          </div>

          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${Math.min(approvalPercentage, 100)}%` }}
            />
            <div className="absolute left-[75%] top-0 h-full w-0.5 bg-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <ThumbsUp className="size-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-700">{approveVotes} Approve</p>
                <p className="text-xs text-gray-500">{approvalPercentage.toFixed(0)}% voting power</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-full">
                <ThumbsDown className="size-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-700">{rejectVotes} Reject</p>
                <p className="text-xs text-gray-500">{rejectionPercentage.toFixed(0)}% voting power</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {isApproved ? (
          <Alert className="bg-green-100 border-green-300">
            <CheckCircle className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Milestone approved! {milestone.fundingAmount.toLocaleString()} ADA will be released to the researcher's wallet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="size-4" />
            <span>
              {(75 - approvalPercentage).toFixed(0)}% more approval needed to release funds
            </span>
          </div>
        )}
      </div>

      {/* Evidence Section - Collapsible */}
      {milestone.evidence && milestone.evidence.length > 0 && (
        <div className="border-t">
          <button
            onClick={onToggleExpand}
            className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-gray-500" />
              <span className="font-medium">Review Evidence ({milestone.evidence.length} items)</span>
            </div>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {expanded && (
            <div className="px-6 pb-6">
              <div className="grid md:grid-cols-2 gap-4">
                {milestone.evidence.map(evidence => (
                  <div key={evidence.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{evidence.title}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {evidence.type}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-3 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(evidence.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting Actions */}
      {!readOnly && !isApproved && (
        <div className="border-t bg-gray-50 p-6">
          <div className="flex gap-4">
            <Button
              onClick={() => onVote?.(milestone.id, 'approve')}
              disabled={isVoting || !connected}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isVoting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ThumbsUp className="mr-2 size-4" />
              )}
              {isVoting ? 'Submitting Vote...' : 'Approve Milestone'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onVote?.(milestone.id, 'reject')}
              disabled={isVoting || !connected}
              className="flex-1"
              size="lg"
            >
              {isVoting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ThumbsDown className="mr-2 size-4" />
              )}
              {isVoting ? 'Submitting Vote...' : 'Reject Milestone'}
            </Button>
          </div>

          {!connected && (
            <p className="text-center text-sm text-amber-600 mt-3">
              Please connect your wallet to vote
            </p>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-xs text-blue-700">
              <strong>On-chain Voting:</strong> Your vote is permanently recorded on the Cardano blockchain
              using Plutus smart contracts for full transparency.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
