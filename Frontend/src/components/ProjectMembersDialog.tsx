import { useState, useEffect } from 'react';
import { Plus, UserCog, Trash2, Mail, Shield, AlertCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { ProjectMember } from '../lib/mockData';

interface ProjectMembersDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  organizationId: string;
  currentMembers?: ProjectMember[];
}

export function ProjectMembersDialog({
  open,
  onClose,
  projectId,
  projectTitle,
  organizationId,
  currentMembers = []
}: ProjectMembersDialogProps) {
  const [members, setMembers] = useState<ProjectMember[]>(currentMembers);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberVotingPower, setNewMemberVotingPower] = useState(1);
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('member');

  useEffect(() => {
    setMembers(currentMembers);
  }, [currentMembers]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      toast.error('Please enter both name and email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (members.some(m => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      toast.error('This email is already assigned to this project');
      return;
    }

    try {
      setAddingMember(true);

      // Simulate API call
      const newMember: ProjectMember = {
        id: `pm-${Date.now()}`,
        name: newMemberName,
        email: newMemberEmail,
        votingPower: newMemberVotingPower,
        role: newMemberRole,
        status: 'active'
      };

      setMembers([...members, newMember]);
      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberVotingPower(1);
      setNewMemberRole('member');
      
      toast.success(`${newMemberName} added to project team`);
    } catch (error) {
      toast.error('Failed to add member');
      console.error(error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMembers(members.filter(m => m.id !== memberId));
      toast.success(`${member.name} removed from project team`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'member': return <UserCog className="w-3 h-3" />;
      case 'viewer': return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Project Team Members
            </div>
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">{projectTitle}</p>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Assign team members to this project. Members will have voting rights based on their voting power (1x-10x).
            </AlertDescription>
          </Alert>

          {/* Add Member Form */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium mb-4">Add Team Member</h4>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-name">Member Name</Label>
                  <Input
                    id="member-name"
                    placeholder="e.g., Dr. John Doe"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    disabled={addingMember}
                  />
                </div>
                <div>
                  <Label htmlFor="member-email">Email Address</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    disabled={addingMember}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-role">Role</Label>
                  <select
                    id="member-role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member' | 'viewer')}
                    disabled={addingMember}
                  >
                    <option value="viewer">Viewer (Can view only)</option>
                    <option value="member">Member (Can view & vote)</option>
                    <option value="admin">Admin (Full access)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="voting-power">Voting Power</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="voting-power"
                      type="number"
                      min={1}
                      max={10}
                      value={newMemberVotingPower}
                      onChange={(e) => setNewMemberVotingPower(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                      disabled={addingMember}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">x (1-10)</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleAddMember} disabled={addingMember} className="w-full">
                <Plus className="mr-2 w-4 h-4" />
                Add Member
              </Button>
            </div>
          </Card>

          {/* Members List */}
          <div>
            <h4 className="font-medium mb-3">
              Team Members ({members.length})
            </h4>
            
            {members.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No team members assigned yet</p>
                <p className="text-sm text-gray-500 mt-1">Add members to give them voting rights for this project</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{member.name}</h5>
                          <Badge variant="outline" className={getRoleColor(member.role)}>
                            <span className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              {member.role}
                            </span>
                          </Badge>
                          {member.status === 'pending' && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Voting Power: <span className="font-medium">{member.votingPower}x</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Voting Summary */}
          {members.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h5 className="font-medium mb-2">Voting Summary</h5>
              <div className="text-sm text-gray-700">
                <p>Total Team Members: <strong>{members.length}</strong></p>
                <p>Total Voting Power: <strong>{members.reduce((sum, m) => sum + m.votingPower, 0)}x</strong></p>
                <p className="text-xs text-gray-600 mt-2">
                  75% approval required for milestone progression
                </p>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
