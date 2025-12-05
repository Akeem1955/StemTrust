import { useState, useEffect } from 'react';
import {
  Plus,
  Mail,
  Shield,
  UserCog,
  Trash2,
  Check,
  X,
  AlertCircle,
  Users,
  Crown,
  Eye,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import {
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
  OrganizationMember,
} from '../lib/api';

interface MemberManagementProps {
  organizationId: string;
}

export function MemberManagement({ organizationId }: MemberManagementProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('viewer');
  const [newMemberVotingPower, setNewMemberVotingPower] = useState(1);

  // Load members on component mount
  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getOrganizationMembers(organizationId);
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load members');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check member limit
    if (members.length >= 50) {
      toast.error('Member limit reached (maximum 50 members)');
      return;
    }

    // Check if email already exists
    if (members.some(m => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      toast.error('This email is already added');
      return;
    }

    try {
      setAddingMember(true);
      const newMember = await addOrganizationMember({
        organizationId,
        email: newMemberEmail,
        votingPower: newMemberVotingPower,
        role: newMemberRole,
      });

      setMembers([...members, newMember]);
      setNewMemberEmail('');
      setNewMemberVotingPower(1);
      setNewMemberRole('viewer');
      toast.success(`Invitation sent to ${newMemberEmail}`);
    } catch (error) {
      toast.error('Failed to add member');
      console.error(error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateVotingPower = async (memberId: string, newPower: number) => {
    try {
      const updatedMember = await updateOrganizationMember({
        memberId,
        votingPower: newPower,
      });

      setMembers(members.map(m => (m.id === memberId ? updatedMember : m)));
      toast.success('Voting power updated');
    } catch (error) {
      toast.error('Failed to update voting power');
      console.error(error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      const updatedMember = await updateOrganizationMember({
        memberId,
        role: newRole,
      });

      setMembers(members.map(m => (m.id === memberId ? updatedMember : m)));
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail}?`)) {
      return;
    }

    try {
      await removeOrganizationMember(memberId);
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
      console.error(error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'member':
        return <Users className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-3xl">{members.length}</p>
              <p className="text-xs text-gray-500 mt-1">Max: 50</p>
            </div>
            <Users className="size-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Members</p>
              <p className="text-3xl">{members.filter(m => m.status === 'active').length}</p>
            </div>
            <Check className="size-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Invites</p>
              <p className="text-3xl">{members.filter(m => m.status === 'pending').length}</p>
            </div>
            <Mail className="size-10 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Add Member Form */}
      <Card className="p-6">
        <h3 className="text-xl mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Member
        </h3>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-2 block">Email Address</label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={e => setNewMemberEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={addingMember}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Role</label>
            <select
              value={newMemberRole}
              onChange={e => setNewMemberRole(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={addingMember}
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Voting Power</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newMemberVotingPower}
              onChange={e => setNewMemberVotingPower(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={addingMember}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              An invitation email will be sent to the member with instructions to access the organization's
              platform. Members with higher voting power have more influence in milestone approvals.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {members.length} of 50 members added
          </p>
          <Button onClick={handleAddMember} disabled={addingMember || members.length >= 50}>
            {addingMember ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 w-4 h-4" />
                Add Member
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Members List */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">Organization Members</h3>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="size-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No members yet. Add your first member above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                      {member.name
                        ? member.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                        : member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.name || member.email}</p>
                      {member.name && <p className="text-sm text-gray-600">{member.email}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-13">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </Badge>

                    <Badge
                      variant={
                        member.status === 'active'
                          ? 'default'
                          : member.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {member.status}
                    </Badge>

                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Voting Power: {member.votingPower}
                    </span>

                    <span className="text-sm text-gray-600">Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>

                    {/* {member.lastActive && (
                      <span className="text-sm text-gray-600">Last active: {member.lastActive}</span>
                    )} */}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role selector */}
                  <select
                    value={member.role}
                    onChange={e => handleUpdateRole(member.id, e.target.value as any)}
                    className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>

                  {/* Voting power selector */}
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-gray-600" />
                    <select
                      value={member.votingPower}
                      onChange={e => handleUpdateVotingPower(member.id, parseInt(e.target.value))}
                      className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(power => (
                        <option key={power} value={power}>
                          {power}x
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.email)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">About Member Roles & Voting Power</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                <strong>Admin:</strong> Can manage campaigns, onboard projects, and manage members
              </li>
              <li>
                <strong>Member:</strong> Can view projects and vote on milestone approvals
              </li>
              <li>
                <strong>Viewer:</strong> Can view projects but cannot vote
              </li>
              <li>
                <strong>Voting Power:</strong> Members with higher voting power (2x, 3x, etc.) have more weight in
                milestone approval votes. This is useful for giving senior members or domain experts more influence.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
