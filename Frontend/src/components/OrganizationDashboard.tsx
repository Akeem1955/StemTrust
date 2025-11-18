import { useState } from 'react';
import { Plus, LogOut, Briefcase, Users, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User } from '../App';
import { mockCampaigns, mockProjects } from '../lib/mockData';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { OnboardProjectDialog } from './OnboardProjectDialog';
import { useWallet } from './WalletProvider';

interface OrganizationDashboardProps {
  user: User;
  onLogout: () => void;
  onViewProject: (projectId: string) => void;
}

export function OrganizationDashboard({ user, onLogout, onViewProject }: OrganizationDashboardProps) {
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [onboardProjectOpen, setOnboardProjectOpen] = useState(false);
  const { connected, address, balance, network, connectWallet, disconnectWallet } = useWallet();

  const organizationCampaigns = mockCampaigns.filter(c => c.organizationId === user.id);
  const allOrgProjects = mockProjects.filter(p => p.sponsor?.id === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">{user.name}</h1>
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
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="projects">All Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <div className="grid gap-6">
              {organizationCampaigns.length === 0 ? (
                <Card className="p-12 text-center">
                  <Briefcase className="size-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first campaign to start funding research projects
                  </p>
                  <Button onClick={() => setCreateCampaignOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Create Campaign
                  </Button>
                </Card>
              ) : (
                organizationCampaigns.map(campaign => (
                  <Card key={campaign.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl mb-2">{campaign.title}</h3>
                        <p className="text-gray-600 mb-3">{campaign.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-600">
                            Budget: <span className="font-medium">{campaign.totalBudget.toLocaleString()} ADA</span>
                          </span>
                          <span className="text-gray-600">
                            Stages: <span className="font-medium">{campaign.stagesCount}</span>
                          </span>
                          <span className="text-gray-600">
                            Projects: <span className="font-medium">{campaign.projects.length}</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    {campaign.projects.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm mb-3">Campaign Projects:</p>
                        <div className="space-y-2">
                          {campaign.projects.map(project => (
                            <div
                              key={project.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                              onClick={() => onViewProject(project.id)}
                            >
                              <div>
                                <p className="font-medium">{project.title}</p>
                                <p className="text-sm text-gray-600">{project.researcher.name}</p>
                              </div>
                              <Badge variant="outline">
                                Stage {project.currentMilestone}/{project.milestones.length}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="grid gap-6">
              {allOrgProjects.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="size-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-6">
                    Onboard projects to your campaigns or wait for researchers to apply
                  </p>
                  <Button onClick={() => setOnboardProjectOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Onboard Project
                  </Button>
                </Card>
              ) : (
                allOrgProjects.map(project => (
                  <Card
                    key={project.id}
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onViewProject(project.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
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
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-6 text-sm">
                        <span className="text-gray-600">
                          Total: <span className="font-medium">{project.totalFunding.toLocaleString()} ADA</span>
                        </span>
                        <span className="text-gray-600">
                          Backers: <span className="font-medium">{project.backers.length}</span>
                        </span>
                      </div>
                      <Badge variant="outline">
                        Milestone {project.currentMilestone}/{project.milestones.length}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateCampaignDialog
        open={createCampaignOpen}
        onClose={() => setCreateCampaignOpen(false)}
      />

      <OnboardProjectDialog
        open={onboardProjectOpen}
        onClose={() => setOnboardProjectOpen(false)}
        organizationId={user.id}
      />
    </div>
  );
}