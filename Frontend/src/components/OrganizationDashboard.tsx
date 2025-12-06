import { useState, useEffect } from 'react';
import { Plus, LogOut, Briefcase, Users, TrendingUp, UserCog, UsersIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User } from '../App';
import { Project, api } from '../lib/api';
import { ComingSoonDialog } from './ComingSoonDialog';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { OnboardProjectDialog } from './OnboardProjectDialog';
import { MemberManagement } from './MemberManagement';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { PendingProjectPreview } from './PendingProjectPreview';
import { CampaignMilestoneView } from './CampaignMilestoneView';
import { useWallet } from './WalletProvider';

interface OrganizationDashboardProps {
  user: User;
  onLogout: () => void;
  onViewProject: (projectId: string) => void;
}

export function OrganizationDashboard({ user, onLogout, onViewProject }: OrganizationDashboardProps) {
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [onboardProjectOpen, setOnboardProjectOpen] = useState(false);
  const [manageMembersProjectId, setManageMembersProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { connected, address, balance, network, connectWallet, disconnectWallet } = useWallet();

  // Function to reload data - can be passed to child components
  const refreshData = async () => {
    if (user.organizationId) {
      try {
        setLoading(true);
        const [projectsData, campaignsData] = await Promise.all([
          api.getOrganizationProjects(user.organizationId),
          api.getCampaigns(user.organizationId)
        ]);
        setProjects(projectsData);
        setCampaigns(campaignsData);
      } catch (e) {
        console.error("Failed to refresh organization data", e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    async function loadData() {
      if (user.organizationId) {
        try {
          const [projectsData, campaignsData] = await Promise.all([
            api.getOrganizationProjects(user.organizationId),
            api.getCampaigns(user.organizationId)
          ]);
          setProjects(projectsData);
          setCampaigns(campaignsData);
        } catch (e) {
          console.error("Failed to load organization data", e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadData();
  }, [user.organizationId, refreshKey]);

  const organizationCampaigns = campaigns;
  const allOrgProjects = projects;
  const pendingProjects = allOrgProjects.filter(p => p.status === 'pending_onboarding');
  const activeProjects = allOrgProjects.filter(p => p.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">{user.organization || user.name}</h1>
              <p className="text-sm text-gray-600">Organization Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              {connected ? (
                <div className="text-sm">
                  <p className="text-gray-600">Wallet Connected • {network}</p>
                  <p className="font-mono text-xs">{address?.slice(0, 20)}...</p>
                  <p className="text-xs text-gray-500">{balance}</p>
                </div>
              ) : (
                <Button variant="outline" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              )}
              <Button variant="ghost" onClick={onLogout}>
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                <p className="text-3xl">{organizationCampaigns.length}</p>
              </div>
              <Briefcase className="size-10 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Projects Funded</p>
                <p className="text-3xl">{allOrgProjects.length}</p>
              </div>
              <Users className="size-10 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Funding (ADA)</p>
                <p className="text-3xl">
                  {allOrgProjects.reduce((sum, p) => sum + p.totalFunding, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="size-10 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setCreateCampaignOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Campaign
          </Button>
          <Button variant="outline" onClick={() => setOnboardProjectOpen(true)}>
            <Plus className="mr-2 size-4" />
            Onboard Project
          </Button>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="projects">All Projects</TabsTrigger>
            <TabsTrigger value="members">
              <UserCog className="mr-2 w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            {organizationCampaigns.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="size-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6">
                  Create a campaign to fund multiple research projects under a common theme
                </p>
                <Button onClick={() => setCreateCampaignOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Create Campaign
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {organizationCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-medium">{campaign.title}</h3>
                            <Badge>{campaign.category}</Badge>
                            <Badge variant="outline">
                              {campaign.stagesCount} Stages
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{campaign.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {campaign.totalBudget.toLocaleString()} ADA
                            </span>
                            <span>{campaign.projects.length} Projects</span>
                            <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Milestone Templates */}
                      <CampaignMilestoneView
                        milestones={campaign.milestoneTemplates}
                        totalBudget={campaign.totalBudget}
                        isExpanded={false}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="space-y-8">
              {allOrgProjects.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="size-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-6">
                    Onboard projects to start funding research
                  </p>
                  <Button onClick={() => setOnboardProjectOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Onboard Project
                  </Button>
                </Card>
              ) : (
                <>
                  {/* Pending Onboarding Projects */}
                  {pendingProjects.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Pending Onboarding ({pendingProjects.length})</h3>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Awaiting Researcher
                        </Badge>
                      </div>
                      <div className="grid gap-6">
                        {pendingProjects.map(project => (
                          <Card key={project.id} className="p-6">
                            <div className="space-y-4">
                              {/* Project Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-xl mb-2">{project.title}</h4>
                                  <p className="text-gray-600 mb-3">{project.description}</p>
                                  <div className="flex flex-col gap-1 text-sm">
                                    <span className="text-gray-600">
                                      {project.researcherName} • {project.institution}
                                    </span>
                                    {project.researcherWalletAddress && (
                                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                                        {project.researcherWalletAddress.slice(0, 12)}...{project.researcherWalletAddress.slice(-6)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge>{project.category}</Badge>
                              </div>

                              {/* Pending Status */}
                              <PendingProjectPreview project={project} />

                              {/* Actions */}
                              <div className="flex items-center gap-3 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setManageMembersProjectId(project.id);
                                  }}
                                >
                                  <UsersIcon className="mr-2 w-4 h-4" />
                                  Manage Team ({project.teamMembers?.length || 0})
                                </Button>
                                <div className="text-sm text-gray-600">
                                  Total: <span className="font-medium">{project.totalFunding.toLocaleString()} ADA</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Projects */}
                  {activeProjects.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Active Projects ({activeProjects.length})</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Active
                        </Badge>
                      </div>
                      <div className="grid gap-6">
                        {activeProjects.map(project => (
                          <Card
                            key={project.id}
                            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => onViewProject(project.id)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl mb-2">{project.title}</h3>
                                <p className="text-gray-600 mb-3">{project.description}</p>
                                <div className="flex flex-col gap-1 text-sm">
                                  <span className="text-gray-600">
                                    {project.researcherName} • {project.institution}
                                  </span>
                                  {/* {project.researcher.walletAddress && (
                                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                                      {project.researcher.walletAddress.slice(0, 12)}...{project.researcher.walletAddress.slice(-6)}
                                    </span>
                                  )} */}
                                </div>
                              </div>
                              <Badge>{project.category}</Badge>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex gap-6 text-sm">
                                <span className="text-gray-600">
                                  Total: <span className="font-medium">{project.totalFunding.toLocaleString()} ADA</span>
                                </span>
                                <span className="text-gray-600">
                                  Team: <span className="font-medium">{project.teamMembers?.length || 0}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setManageMembersProjectId(project.id);
                                  }}
                                >
                                  <UsersIcon className="mr-2 w-4 h-4" />
                                  Team
                                </Button>
                                <Badge variant="outline">
                                  Milestone {(project.milestones?.filter(m => m.status === 'approved').length || 0) + 1}/{project.milestones?.length || 0}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MemberManagement organizationId={user.organizationId || user.id} />
          </TabsContent>
        </Tabs>
      </div>

      <CreateCampaignDialog
        open={createCampaignOpen}
        onClose={() => setCreateCampaignOpen(false)}
        organizationId={user.organizationId || user.id}
      />

      <OnboardProjectDialog
        open={onboardProjectOpen}
        onClose={() => {
          setOnboardProjectOpen(false);
          refreshData(); // Refresh projects list when dialog closes
        }}
        organizationId={user.organizationId || user.id}
      />

      {manageMembersProjectId && (
        <ProjectMembersDialog
          open={!!manageMembersProjectId}
          onClose={() => setManageMembersProjectId(null)}
          projectId={manageMembersProjectId}
          projectTitle={allOrgProjects.find(p => p.id === manageMembersProjectId)?.title || ''}
          organizationId={user.id}
          currentMembers={allOrgProjects.find(p => p.id === manageMembersProjectId)?.teamMembers || []}
        />
      )}
    </div>
  );
}
