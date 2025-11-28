import { useState } from 'react';
import { Plus, LogOut, Briefcase, Users, TrendingUp, UserCog } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User } from '../App';
import { mockCampaigns, mockProjects } from '../lib/mockData';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { OnboardProjectDialog } from './OnboardProjectDialog';
import { MemberManagement } from './MemberManagement';
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
            <Card className="p-16 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300">
              <Briefcase className="size-20 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl mb-3">Coming Soon</h3>
              <p className="text-gray-600 mb-2 max-w-md mx-auto">
                Campaign management features are under development
              </p>
              <p className="text-sm text-gray-500">
                Soon you'll be able to create funding campaigns with customizable milestone stages (3-10 stages)
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="grid gap-6">
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

          <TabsContent value="members" className="mt-6">
            <MemberManagement organizationId={user.id} />
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
