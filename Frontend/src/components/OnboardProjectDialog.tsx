import { useState, useEffect } from 'react';
import { X, AlertCircle, Mail, CheckCircle, Plus, Trash2, Info, AlertTriangle, HelpCircle, Zap, Settings, Users, UserCheck, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { onboardProject, getOrganizationMembers, OrganizationMember } from '../lib/api';
import { MilestoneGuideDialog } from './MilestoneGuideDialog';

interface OnboardProjectDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

interface MilestoneStage {
  id: string;
  title: string;
  description: string;
  fundingPercentage: number;
  durationWeeks: number;
}

type MilestoneMode = 'fixed' | 'custom';

// Fixed 5-stage lifecycle template (standard for researchers)
const FIXED_5_STAGE_TEMPLATE: Omit<MilestoneStage, 'id'>[] = [
  { 
    title: 'Research Planning & Setup', 
    description: 'Design methodology and prepare research infrastructure',
    fundingPercentage: 15, 
    durationWeeks: 4 
  },
  { 
    title: 'Data Collection & Preliminary Analysis', 
    description: 'Gather data and conduct initial analysis',
    fundingPercentage: 20, 
    durationWeeks: 8 
  },
  { 
    title: 'Core Research & Development', 
    description: 'Main research activities and development work',
    fundingPercentage: 30, 
    durationWeeks: 12 
  },
  { 
    title: 'Testing & Validation', 
    description: 'Validate findings and test solutions',
    fundingPercentage: 20, 
    durationWeeks: 6 
  },
  { 
    title: 'Documentation & Dissemination', 
    description: 'Finalize documentation and share results',
    fundingPercentage: 15, 
    durationWeeks: 4 
  },
];

export function OnboardProjectDialog({ open, onClose, organizationId }: OnboardProjectDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [researcherEmail, setResearcherEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [researcherName, setResearcherName] = useState('');
  const [institution, setInstitution] = useState('');
  const [category, setCategory] = useState('');
  const [totalFunding, setTotalFunding] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [milestoneMode, setMilestoneMode] = useState<MilestoneMode>('fixed');
  const [milestones, setMilestones] = useState<MilestoneStage[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  
  // Team member selection
  const [availableMembers, setAvailableMembers] = useState<OrganizationMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Load organization members when dialog opens
  useEffect(() => {
    if (open) {
      loadOrganizationMembers();
    }
  }, [open, organizationId]);

  const loadOrganizationMembers = async () => {
    try {
      setLoadingMembers(true);
      const members = await getOrganizationMembers(organizationId);
      // Filter to only active members
      const activeMembers = members.filter(m => m.status === 'active');
      setAvailableMembers(activeMembers);
      // Auto-select all active members by default
      setSelectedMemberIds(activeMembers.map(m => m.id));
    } catch (error) {
      toast.error('Failed to load organization members');
      console.error(error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Initialize milestones based on mode
  useEffect(() => {
    if (milestoneMode === 'fixed') {
      setMilestones(
        FIXED_5_STAGE_TEMPLATE.map((template, index) => ({
          ...template,
          id: `fixed-${index}`,
        }))
      );
    } else {
      // Initialize with 4 custom stages
      setMilestones([
        { id: '1', title: '', description: '', fundingPercentage: 20, durationWeeks: 4 },
        { id: '2', title: '', description: '', fundingPercentage: 30, durationWeeks: 8 },
        { id: '3', title: '', description: '', fundingPercentage: 30, durationWeeks: 8 },
        { id: '4', title: '', description: '', fundingPercentage: 20, durationWeeks: 4 },
      ]);
    }
  }, [milestoneMode]);

  const totalPercentage = milestones.reduce((sum, m) => sum + m.fundingPercentage, 0);
  const isValidPercentage = totalPercentage === 100;
  const canAddMilestone = milestones.length < 10 && milestoneMode === 'custom';
  const canRemoveMilestone = milestones.length > 3 && milestoneMode === 'custom';
  
  // Team member calculations
  const selectedMembers = availableMembers.filter(m => selectedMemberIds.includes(m.id));
  const totalVotingPower = selectedMembers.reduce((sum, m) => sum + m.votingPower, 0);
  
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  const selectAllMembers = () => {
    setSelectedMemberIds(availableMembers.map(m => m.id));
  };
  
  const deselectAllMembers = () => {
    setSelectedMemberIds([]);
  };

  const addMilestone = () => {
    if (canAddMilestone) {
      const remainingPercentage = 100 - totalPercentage;
      setMilestones([
        ...milestones,
        {
          id: Date.now().toString(),
          title: '',
          description: '',
          fundingPercentage: Math.max(0, remainingPercentage),
          durationWeeks: 4,
        },
      ]);
    }
  };

  const removeMilestone = (id: string) => {
    if (canRemoveMilestone) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof MilestoneStage, value: any) => {
    if (milestoneMode === 'fixed' && (field === 'title' || field === 'fundingPercentage')) {
      // Don't allow editing title or funding % in fixed mode
      return;
    }
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const distributePercentagesEvenly = () => {
    if (milestoneMode === 'fixed') return;
    
    const evenPercentage = Math.floor(100 / milestones.length);
    const remainder = 100 - (evenPercentage * milestones.length);
    
    setMilestones(milestones.map((m, index) => ({
      ...m,
      fundingPercentage: evenPercentage + (index === 0 ? remainder : 0),
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!researcherEmail.trim()) {
      toast.error('Please enter researcher email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(researcherEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!isValidPercentage) {
      toast.error('Funding percentages must add up to 100%');
      return;
    }

    // Validate milestone titles
    if (milestones.some(m => !m.title.trim())) {
      toast.error('All milestones must have a title');
      return;
    }

    // Validate team member selection
    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one team member to monitor this project');
      return;
    }

    try {
      setSubmitting(true);

      // Create milestone structure with funding amounts
      const milestoneData = milestones.map(m => ({
        title: m.title,
        description: m.description,
        fundingAmount: (parseFloat(totalFunding) * m.fundingPercentage) / 100,
        fundingPercentage: m.fundingPercentage,
        durationWeeks: m.durationWeeks,
      }));

      // Call the API to onboard project
      const response = await onboardProject({
        organizationId,
        campaignId: campaignId || undefined,
        researcherEmail,
        projectTitle,
        projectDescription,
        totalFunding: parseFloat(totalFunding),
        milestones: milestoneData,
        milestoneMode,
        stagesCount: milestones.length,
        teamMemberIds: selectedMemberIds,
      });

      if (response.emailSent) {
        toast.success(
          <>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Project Onboarded Successfully!</p>
                <p className="text-sm mt-1">
                  {projectTitle} with {milestones.length} {milestoneMode === 'fixed' ? 'fixed' : 'custom'} milestones
                </p>
                <p className="text-sm">
                  Team: {selectedMemberIds.length} members (Voting power: {totalVotingPower}x)
                </p>
                <p className="text-sm">
                  Login instructions sent to <strong>{response.researcherEmail}</strong>
                </p>
              </div>
            </div>
          </>
        );
      } else {
        toast.success('Project onboarded successfully');
      }

      // Reset form
      setResearcherEmail('');
      setProjectTitle('');
      setProjectDescription('');
      setResearcherName('');
      setInstitution('');
      setCategory('');
      setTotalFunding('');
      setCampaignId('');
      setMilestoneMode('fixed');
      setSelectedMemberIds(availableMembers.map(m => m.id)); // Reset to all selected
      
      onClose();
    } catch (error) {
      toast.error('Failed to onboard project. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Onboard Research Project</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuide(true)}
                type="button"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Milestone Guide
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                Onboard a specific research project. Choose between a <strong>fixed 5-stage lifecycle</strong> or <strong>3-10 custom stages</strong>. 
                The researcher will receive login instructions via email.
              </AlertDescription>
            </Alert>

            {/* Basic Project Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Project Information</h3>
              
              <div>
                <Label htmlFor="researcher-email">
                  Researcher Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="researcher-email"
                    type="email"
                    placeholder="researcher@university.edu.ng"
                    value={researcherEmail}
                    onChange={(e) => setResearcherEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Login instructions will be automatically sent to this email
                </p>
              </div>

              <div>
                <Label htmlFor="project-title">Project Title</Label>
                <Input
                  id="project-title"
                  placeholder="e.g., AI-Powered Agricultural Pest Detection System"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe the research project, its goals, and expected outcomes..."
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="researcher-name">Researcher Name</Label>
                  <Input
                    id="researcher-name"
                    placeholder="e.g., Dr. Amaka Okonkwo"
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    placeholder="e.g., University of Lagos"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Research Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Agriculture Technology"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="funding">Total Funding (ADA)</Label>
                  <Input
                    id="funding"
                    type="number"
                    placeholder="e.g., 50000"
                    value={totalFunding}
                    onChange={(e) => setTotalFunding(e.target.value)}
                    required
                    disabled={submitting}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="campaign">Link to Campaign (Optional)</Label>
                <select
                  id="campaign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">No campaign (standalone project)</option>
                  <option value="camp-1">AgriTech Innovation Fund 2024</option>
                  <option value="camp-2">Cocoa Value Chain Enhancement</option>
                </select>
              </div>
            </div>

            {/* Team Member Selection */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Project Team Members
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select team members who will monitor and vote on milestone approvals
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllMembers}
                    disabled={loadingMembers || submitting}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAllMembers}
                    disabled={loadingMembers || submitting}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {loadingMembers ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading team members...</p>
                </Card>
              ) : availableMembers.length === 0 ? (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    No active team members found. Please add team members to your organization first.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Selected Members Summary */}
                  <Card className={`p-4 ${selectedMemberIds.length > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedMemberIds.length > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        <span className="font-medium">
                          {selectedMemberIds.length} of {availableMembers.length} members selected
                        </span>
                      </div>
                      {selectedMemberIds.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Total Voting Power: {totalVotingPower}x
                          </Badge>
                          <Badge variant="outline">
                            75% = {Math.ceil(totalVotingPower * 0.75)}x needed
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Member Selection Grid */}
                  <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {availableMembers.map((member) => {
                      const isSelected = selectedMemberIds.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleMemberSelection(member.id)}
                          disabled={submitting}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-green-600 bg-green-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isSelected ? (
                                <UserCheck className="w-5 h-5" />
                              ) : (
                                <Users className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">
                                  {member.name || member.email}
                                </p>
                                {member.role === 'admin' && (
                                  <Shield className="w-3 h-3 text-purple-600" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {member.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={isSelected ? 'default' : 'outline'} className="text-xs">
                                  {member.votingPower}x voting power
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {member.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Help Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How Voting Works</p>
                        <ul className="text-xs space-y-1">
                          <li>• Selected members can vote on milestone approvals</li>
                          <li>• Votes are weighted based on voting power (1x-10x)</li>
                          <li>• 75% of total voting power required to approve milestones</li>
                          <li>• You can modify team members later from project settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Milestone Mode Selection */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Milestone Structure</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose how to structure this project's milestones
                  </p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMilestoneMode('fixed')}
                  disabled={submitting}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    milestoneMode === 'fixed'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      milestoneMode === 'fixed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">Fixed 5-Stage Lifecycle</h4>
                        {milestoneMode === 'fixed' && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Use the standard researcher lifecycle (15%-20%-30%-20%-15%)
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={milestoneMode === 'fixed' ? 'default' : 'outline'} className="text-xs">
                          Quick Setup
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          5 Stages
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMilestoneMode('custom')}
                  disabled={submitting}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    milestoneMode === 'custom'
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      milestoneMode === 'custom' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Settings className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">Custom Milestones</h4>
                        {milestoneMode === 'custom' && (
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Create 3-10 custom stages with your own funding allocation
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={milestoneMode === 'custom' ? 'default' : 'outline'} className="text-xs">
                          Fully Flexible
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          3-10 Stages
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Milestone Configuration */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {milestoneMode === 'fixed' ? 'Fixed Milestone Stages' : 'Custom Milestone Stages'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {milestoneMode === 'fixed' 
                      ? `Standard 5-stage lifecycle (descriptions and duration can be customized)`
                      : `Configure ${milestones.length} milestone stages (Min: 3, Max: 10)`
                    }
                  </p>
                </div>
                {milestoneMode === 'custom' && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={distributePercentagesEvenly}
                      disabled={submitting}
                    >
                      Distribute Evenly
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addMilestone}
                      disabled={!canAddMilestone || submitting}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Stage
                    </Button>
                  </div>
                )}
              </div>

              {/* Funding Percentage Indicator */}
              <Card className={`p-4 ${isValidPercentage ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isValidPercentage ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-medium">
                      Total Funding Allocation: {totalPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isValidPercentage ? "default" : "destructive"}>
                      {isValidPercentage ? 'Valid' : `${totalPercentage > 100 ? 'Over' : 'Under'} by ${Math.abs(100 - totalPercentage)}%`}
                    </Badge>
                    {milestoneMode === 'fixed' && (
                      <Badge variant="outline" className="bg-blue-50">
                        Fixed Structure
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Milestone List */}
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <Card key={milestone.id} className={`p-4 ${milestoneMode === 'fixed' ? 'bg-blue-50/50' : ''}`}>
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 ${
                            milestoneMode === 'fixed' ? 'bg-blue-600' : 'bg-green-600'
                          } text-white rounded-full flex items-center justify-center font-medium`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">Stage {index + 1}</h4>
                            {milestoneMode === 'fixed' && (
                              <p className="text-xs text-blue-600">Fixed structure</p>
                            )}
                          </div>
                        </div>
                        {milestoneMode === 'custom' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(milestone.id)}
                            disabled={!canRemoveMilestone || submitting}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`milestone-title-${milestone.id}`}>
                            Stage Title <span className="text-red-500">*</span>
                            {milestoneMode === 'fixed' && (
                              <span className="text-xs text-blue-600 ml-2">(Fixed)</span>
                            )}
                          </Label>
                          <Input
                            id={`milestone-title-${milestone.id}`}
                            placeholder="Stage title"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                            required
                            disabled={submitting || milestoneMode === 'fixed'}
                            className={milestoneMode === 'fixed' ? 'bg-gray-100' : ''}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`milestone-description-${milestone.id}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`milestone-description-${milestone.id}`}
                            placeholder="Describe what needs to be accomplished in this stage..."
                            rows={2}
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                            disabled={submitting}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`milestone-funding-${milestone.id}`}>
                              Funding Allocation (%)
                              {milestoneMode === 'fixed' && (
                                <span className="text-xs text-blue-600 ml-2">(Fixed)</span>
                              )}
                            </Label>
                            <Input
                              id={`milestone-funding-${milestone.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={milestone.fundingPercentage}
                              onChange={(e) => updateMilestone(milestone.id, 'fundingPercentage', parseFloat(e.target.value) || 0)}
                              disabled={submitting || milestoneMode === 'fixed'}
                              className={milestoneMode === 'fixed' ? 'bg-gray-100' : ''}
                            />
                            {totalFunding && (
                              <p className="text-xs text-gray-600 mt-1">
                                ≈ {((parseFloat(totalFunding) || 0) * milestone.fundingPercentage / 100).toLocaleString()} ADA
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`milestone-duration-${milestone.id}`}>
                              Duration (weeks)
                            </Label>
                            <Input
                              id={`milestone-duration-${milestone.id}`}
                              type="number"
                              min="1"
                              max="52"
                              value={milestone.durationWeeks}
                              onChange={(e) => updateMilestone(milestone.id, 'durationWeeks', parseInt(e.target.value) || 1)}
                              disabled={submitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Smart Contract Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Project Setup Summary
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Blockchain:</strong> Project will be secured by Cardano smart contracts with {milestones.length} {milestoneMode === 'fixed' ? 'fixed' : 'customizable'} milestone stages.
                </p>
                <p>
                  <strong>Team:</strong> {selectedMemberIds.length} selected members with {totalVotingPower}x total voting power.
                </p>
                <p>
                  <strong>Voting:</strong> 75% approval ({Math.ceil(totalVotingPower * 0.75)}x) required for each milestone release.
                </p>
                <p>
                  <strong>Email:</strong> Researcher will receive login instructions at <strong>{researcherEmail || 'the provided email'}</strong>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValidPercentage || submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Onboarding...
                  </>
                ) : (
                  'Onboard Project'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Milestone Guide Dialog */}
      <MilestoneGuideDialog
        open={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </>
  );
}
