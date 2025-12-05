import { useState, useEffect } from 'react';
import { Plus, LogOut, Rocket, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User } from '../App';
import { Project, api } from '../lib/api';
import { CreateProjectDialog } from './CreateProjectDialog';
import { MilestoneQuickReference } from './MilestoneQuickReference';
import { useWallet } from './WalletProvider';
import { toast } from 'sonner';

interface IndividualDashboardProps {
  user: User;
  onLogout: () => void;
  onViewProject: (projectId: string) => void;
}

export function IndividualDashboard({ user, onLogout, onViewProject }: IndividualDashboardProps) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { connected, address, balance, network, connectWallet, disconnectWallet } = useWallet();

  useEffect(() => {
    async function loadData() {
      if (user.researcherId) {
        try {
          const researcherProjects = await api.getResearcherProjects(user.researcherId);
          setProjects(researcherProjects);
        } catch (e) {
          console.error("Failed to load researcher projects", e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadData();
  }, [user.researcherId]);

  // Update wallet address when connected
  useEffect(() => {
    if (connected && address && user.researcherId) {
      api.updateResearcher(user.researcherId, { walletAddress: address })
        .then(() => console.log("Researcher wallet updated"))
        .catch(err => console.error("Failed to update wallet", err));
    }
  }, [connected, address, user.researcherId]);

  const userProjects = projects;
  const activeProjects = userProjects.filter(p => p.status === 'active');
  const completedProjects = userProjects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">{user.name}</h1>
              <p className="text-sm text-gray-600">Researcher Dashboard</p>
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
                <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                <p className="text-3xl">{activeProjects.length}</p>
              </div>
              <Rocket className="size-10 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Projects</p>
                <p className="text-3xl">{completedProjects.length}</p>
              </div>
              <CheckCircle className="size-10 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Raised (ADA)</p>
                <p className="text-3xl">
                  {userProjects.reduce((sum, p) => sum + p.totalFunding, 0).toLocaleString()}
                </p>
              </div>
              <Clock className="size-10 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setCreateProjectOpen(true)}>
            <Plus className="mr-2 size-4" />
            Apply for Funding
          </Button>
        </div>

        {/* Milestone Quick Reference */}
        <div className="mb-8">
          <MilestoneQuickReference type="researcher" />
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-2xl mb-6">My Projects</h2>
          {userProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <Rocket className="size-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">
                Apply for funding to start your first research project
              </p>
              <Button onClick={() => setCreateProjectOpen(true)}>
                <Plus className="mr-2 size-4" />
                Apply for Funding
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {userProjects.map(project => (
                <Card
                  key={project.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onViewProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl">{project.title}</h3>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        Milestone {(project.milestones?.filter(m => m.status === 'approved').length || 0) + 1}/{project.milestones?.length || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((project.milestones?.filter(m => m.status === 'approved').length || 0) / (project.milestones?.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-600">
                        Total Funding: <span className="font-medium">{project.totalFunding.toLocaleString()} ADA</span>
                      </span>
                      <span className="text-gray-600">
                        Backers: <span className="font-medium">{project.backers?.length || 0}</span>
                      </span>
                    </div>
                    {project.organizationName && (
                      <span className="text-sm text-gray-600">
                        Sponsored by {project.organizationName}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        researcherId={user.id}
      />
    </div>
  );
}