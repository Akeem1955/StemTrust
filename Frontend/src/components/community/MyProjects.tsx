import { useState } from 'react';
import { ChevronLeft, CheckCircle, Clock, AlertCircle, ThumbsUp, ThumbsDown, FileText, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface MyProjectsProps {
  onBack: () => void;
  supportedProjects: any[];
  onViewProjectDetail: (projectId: string, projectData: any) => void;
}

interface Vote {
  milestoneId: number;
  vote: 'for' | 'against';
  timestamp: string;
}

export function MyProjects({ onBack, supportedProjects, onViewProjectDetail }: MyProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

  const handleVote = (milestoneId: number, voteType: 'for' | 'against') => {
    // Check if already voted
    const existingVote = votes.find(v => v.milestoneId === milestoneId);
    
    if (existingVote) {
      // Update vote
      setVotes(votes.map(v => 
        v.milestoneId === milestoneId 
          ? { ...v, vote: voteType, timestamp: new Date().toISOString() }
          : v
      ));
    } else {
      // Add new vote
      setVotes([...votes, {
        milestoneId,
        vote: voteType,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const getUserVote = (milestoneId: number): 'for' | 'against' | null => {
    const vote = votes.find(v => v.milestoneId === milestoneId);
    return vote ? vote.vote : null;
  };

  // Default 5-stage lifecycle milestones
  const defaultMilestones = [
    {
      id: 1,
      stage: 'Stage 1',
      title: 'Project Planning & Setup',
      description: 'Initial research design, methodology development, and resource allocation.',
      status: 'completed' as const,
      fundingAmount: '20%',
      votesFor: 156,
      votesAgainst: 12,
      votingDeadline: '2024-01-15',
      evidenceSubmitted: true,
      evidenceUrl: '#',
    },
    {
      id: 2,
      stage: 'Stage 2',
      title: 'Data Collection & Analysis',
      description: 'Gathering research data, conducting experiments, and preliminary analysis.',
      status: 'voting' as const,
      fundingAmount: '25%',
      votesFor: 89,
      votesAgainst: 8,
      votingDeadline: '2024-02-20',
      evidenceSubmitted: true,
      evidenceUrl: '#',
    },
    {
      id: 3,
      stage: 'Stage 3',
      title: 'Testing & Validation',
      description: 'Testing hypotheses, validating results, and refining methodology.',
      status: 'pending' as const,
      fundingAmount: '25%',
      votesFor: 0,
      votesAgainst: 0,
      votingDeadline: '2024-03-25',
      evidenceSubmitted: false,
    },
    {
      id: 4,
      stage: 'Stage 4',
      title: 'Implementation & Documentation',
      description: 'Implementing findings, creating documentation, and preparing reports.',
      status: 'pending' as const,
      fundingAmount: '20%',
      votesFor: 0,
      votesAgainst: 0,
      votingDeadline: '2024-04-30',
      evidenceSubmitted: false,
    },
    {
      id: 5,
      stage: 'Stage 5',
      title: 'Final Review & Publication',
      description: 'Final analysis, peer review preparation, and publication of results.',
      status: 'pending' as const,
      fundingAmount: '10%',
      votesFor: 0,
      votesAgainst: 0,
      votingDeadline: '2024-05-30',
      evidenceSubmitted: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'voting':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'voting':
        return <Clock className="w-5 h-5" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-gray-900">Milestone Tracking</h1>
                <p className="text-sm text-gray-600">{selectedProject.title}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Overview Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-gray-900 mb-2">{selectedProject.title}</h2>
                    <p className="text-gray-600 mb-3">{selectedProject.researcher}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{selectedProject.progress}% funded</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{selectedProject.supporters} supporters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-gray-900">Project Milestones (5 Stages)</h2>
                  <span className="text-sm text-gray-600">Current: Stage 2 of 5</span>
                </div>

                {defaultMilestones.map((milestone, index) => {
                  const userVote = getUserVote(milestone.id);
                  const isExpanded = expandedMilestone === milestone.id;
                  const totalVotes = milestone.votesFor + milestone.votesAgainst;
                  const approvalPercentage = totalVotes > 0 
                    ? Math.round((milestone.votesFor / totalVotes) * 100)
                    : 0;

                  return (
                    <div key={milestone.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Milestone Header */}
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Stage Number */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                            milestone.status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                            milestone.status === 'voting' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                            'bg-gray-100 border-gray-300 text-gray-600'
                          }`}>
                            <span>{index + 1}</span>
                          </div>

                          {/* Milestone Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-gray-900 mb-1">{milestone.title}</h3>
                                <p className="text-sm text-gray-600">{milestone.description}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-sm border flex items-center gap-2 ${getStatusColor(milestone.status)}`}>
                                {getStatusIcon(milestone.status)}
                                {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 mt-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Target className="w-4 h-4" />
                                <span>Funding: {milestone.fundingAmount}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Deadline: {new Date(milestone.votingDeadline).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Voting Progress */}
                            {milestone.status !== 'pending' && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-gray-600">Community Approval</span>
                                  <span className={`${approvalPercentage >= 75 ? 'text-green-600' : 'text-gray-900'}`}>
                                    {approvalPercentage}% ({milestone.votesFor} / {totalVotes} votes)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      approvalPercentage >= 75 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${approvalPercentage}%` }}
                                  />
                                </div>
                                {approvalPercentage >= 75 && (
                                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Reached 75% approval threshold
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Evidence & Voting Section */}
                            {milestone.status === 'voting' && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                {milestone.evidenceSubmitted && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                                      <FileText className="w-4 h-4" />
                                      <span className="text-sm">Evidence Submitted</span>
                                    </div>
                                    <button
                                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                                    >
                                      {isExpanded ? 'Hide' : 'View'} submitted evidence
                                    </button>
                                  </div>
                                )}

                                {isExpanded && milestone.evidenceSubmitted && (
                                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-gray-900 mb-2">Milestone Evidence</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                      The researcher has completed data collection from 50 rural clinics and conducted preliminary analysis. Initial results show 94% accuracy in malaria detection from blood sample images.
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                                      <li>• Dataset: 10,000+ blood sample images collected</li>
                                      <li>• Model trained with 94% accuracy on validation set</li>
                                      <li>• Preliminary field testing completed in 5 clinics</li>
                                      <li>• Documentation and analysis reports attached</li>
                                    </ul>
                                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 underline">
                                      Download full evidence package →
                                    </a>
                                  </div>
                                )}

                                <div className="flex items-center gap-3">
                                  <p className="text-sm text-gray-700">Cast your vote:</p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleVote(milestone.id, 'for')}
                                      disabled={milestone.status !== 'voting'}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        userVote === 'for'
                                          ? 'bg-green-600 text-white border-green-600'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600'
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                      <span>Approve</span>
                                      {userVote === 'for' && <CheckCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => handleVote(milestone.id, 'against')}
                                      disabled={milestone.status !== 'voting'}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        userVote === 'against'
                                          ? 'bg-red-600 text-white border-red-600'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-500 hover:text-red-600'
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                      <span>Reject</span>
                                      {userVote === 'against' && <CheckCircle className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>

                                {userVote && (
                                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                      ✓ You voted to {userVote === 'for' ? 'approve' : 'reject'} this milestone
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Voting Power Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-gray-900 mb-4">Your Voting Power</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">As a supporter, you can:</p>
                    <ul className="text-sm text-gray-700 space-y-2 mt-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>Vote on milestone approvals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>Review evidence submissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>Track project progress</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Votes Cast</span>
                      <span className="text-gray-900">{votes.length} / 5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Support Date</span>
                      <span className="text-gray-900">Jan 28, 2025</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="text-gray-900">{selectedProject.progress}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Amount Raised</span>
                    <span className="text-gray-900">₳{selectedProject.raised}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Total Supporters</span>
                    <span className="text-gray-900">{selectedProject.supporters}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Stage</span>
                    <span className="text-gray-900">2 of 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // My Projects List View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-gray-900">My Supported Projects</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">Your Voting Rights</h3>
              <p className="text-gray-700 mb-3">
                By supporting these projects, you have become a voter on milestone approvals. You can review evidence submissions and vote to approve or reject each milestone before funds are released.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Each project has 5 milestone stages</li>
                <li>• 75% community approval required to release funds</li>
                <li>• Review evidence before voting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Supported Projects */}
        {supportedProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Supported Projects Yet</h3>
            <p className="text-gray-600 mb-6">
              Start supporting projects to participate in milestone voting and track their progress.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Discover Projects
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                      Stage 2/5
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{project.researcher}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-gray-600">Raised</p>
                      <p className="text-gray-900">₳{project.raised}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Supporters</p>
                      <p className="text-gray-900">{project.supporters}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Vote on Milestones
                    </button>
                    <button
                      onClick={() => onViewProjectDetail(project.id, project)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
