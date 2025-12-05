import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, Upload, Vote } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { User } from '../App';
import { Project, Milestone, api } from '../lib/api';
import { SubmitEvidenceDialog } from './SubmitEvidenceDialog';
import { VotingPanel } from './VotingPanel';
import { PendingProjectPreview } from './PendingProjectPreview';

interface ProjectDetailProps {
  projectId: string;
  currentUser: User | null;
  onBack: () => void;
}

export function ProjectDetail({ projectId, currentUser, onBack }: ProjectDetailProps) {
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await api.getProject(projectId);
        setProject(data);
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Project not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  // If project is pending onboarding, show pending view for organizations
  if (project.status === 'pending_onboarding' && currentUser?.role === 'organization') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Dashboard
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <h2 className="text-2xl mb-4">{project.title}</h2>
            <PendingProjectPreview project={project} />
          </Card>
        </div>
      </div>
    );
  }

  const isResearcher = currentUser?.researcherId === project.researcherId;
  const isOrganization = currentUser?.role === 'organization';
  const isProjectOrganization = isOrganization && currentUser?.organizationId === project.organizationId;
  const isBacker = project.backers?.some(b => b.id === currentUser?.id) ||
    project.teamMembers?.some(m => m.email === currentUser?.email) ||
    isProjectOrganization;

  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const progressPercentage = (completedMilestones / project.milestones.length) * 100;

  const handleSubmitEvidence = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setEvidenceDialogOpen(true);
  };

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'voting':
        return 'text-blue-600';
      case 'in_progress':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getMilestoneStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="size-5" />;
      case 'voting':
        return <Vote className="size-5" />;
      case 'in_progress':
        return <Clock className="size-5" />;
      case 'rejected':
        return <XCircle className="size-5" />;
      default:
        return <Clock className="size-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 size-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl mb-2">{project.title}</h1>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex gap-3">
                <Badge>{project.category}</Badge>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total Funding</p>
              <p className="text-2xl">{project.totalFunding.toLocaleString()} ADA</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Backers</p>
              <p className="text-2xl">{project.backers?.length || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Current Milestone</p>
              <p className="text-2xl">{project.currentMilestone}/{project.milestones.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-2xl">{progressPercentage.toFixed(0)}%</p>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card className="p-6">
            <h3 className="mb-4">Overall Progress</h3>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {completedMilestones} of {project.milestones.length} milestones completed
            </p>
          </Card>
        </div>

        {/* Researcher Info */}
        <Card className="p-6 mb-8">
          <h3 className="mb-4">Researcher Information</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{project.researcherName}</p>
              <p className="text-sm text-gray-600">{project.institution}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {project.researcherWalletAddress}
              </p>
            </div>
            {isResearcher && (
              <Badge variant="outline">You are the researcher</Badge>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="milestones">
          <TabsList>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="backers">Backers</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="mt-6">
            <div className="space-y-6">
              {project.milestones.map((milestone) => (
                <Card key={milestone.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`flex-shrink-0 ${getMilestoneStatusColor(milestone.status)}`}>
                        {getMilestoneStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">
                            Stage {milestone.stageNumber}: {milestone.title}
                          </h3>
                          <Badge variant={
                            milestone.status === 'approved' ? 'default' :
                              milestone.status === 'voting' ? 'secondary' :
                                milestone.status === 'in_progress' ? 'outline' :
                                  'destructive'
                          }>
                            {milestone.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{milestone.description}</p>
                        <p className="text-sm">
                          Funding: <span className="font-medium">{milestone.fundingAmount.toLocaleString()} ADA</span>
                        </p>
                        {milestone.approvedDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            Completed: {new Date(milestone.approvedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  {milestone.evidence && milestone.evidence.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="mb-3">Submitted Evidence</h4>
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
                                  View
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

                  {/* Voting Status */}
                  {milestone.status === 'voting' && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4>Community Vote</h4>
                        <p className="text-sm text-gray-600">
                          {(milestone.votingSummary?.approveVotes || 0) + (milestone.votingSummary?.rejectVotes || 0)} votes cast
                        </p>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Approve</span>
                          <span className="font-medium">
                            {milestone.votingSummary?.approveVotes || 0} ({milestone.votingSummary?.percentageApproved || 0}%)
                          </span>
                        </div>
                        <Progress
                          value={milestone.votingSummary?.percentageApproved || 0}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span>Reject</span>
                          <span className="font-medium">
                            {milestone.votingSummary?.rejectVotes || 0}
                          </span>
                        </div>
                        <Progress
                          value={(milestone.votingSummary?.rejectVotes || 0) / (milestone.votingSummary?.totalVotingPower || 1) * 100}
                          className="h-2 [&>div]:bg-red-600"
                        />
                      </div>
                      {(milestone.votingSummary?.percentageApproved || 0) >= 75 ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="size-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            Milestone approved! Funds will be released to researcher.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Need 75% approval to unlock funds ({Math.max(0, 75 - (milestone.votingSummary?.percentageApproved || 0)).toFixed(0)}% more needed)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {isResearcher && (milestone.status === 'in_progress' || milestone.status === 'pending') && (
                      <Button onClick={() => handleSubmitEvidence(milestone)}>
                        <Upload className="mr-2 size-4" />
                        Submit Evidence
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backers" className="mt-6">
            <Card className="p-6">
              <h3 className="mb-4">Project Backers</h3>
              <div className="space-y-3">
                {project.backers?.map(backer => (
                  <div key={backer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{backer.name}</p>
                      <p className="text-sm text-gray-600 font-mono">
                        {backer.walletAddress}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{backer.amount.toLocaleString()} ADA</p>
                      <p className="text-sm text-gray-600">
                        {((backer.amount / project.totalFunding) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
                {(!project.backers || project.backers.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No backers yet.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="voting" className="mt-6">
            <VotingPanel
              project={project}
              currentUser={currentUser}
              isBacker={isBacker}
              isResearcher={isResearcher}
            />
          </TabsContent>
        </Tabs>
      </div>

      {selectedMilestone && (
        <SubmitEvidenceDialog
          open={evidenceDialogOpen}
          onClose={() => {
            setEvidenceDialogOpen(false);
            setSelectedMilestone(null);
          }}
          milestone={selectedMilestone}
          projectId={project.id}
        />
      )}
    </div>
  );
}