import { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Share2,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Mail,
  Building,
  Target,
  DollarSign,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CommunityProjectDetailProps {
  projectId: string;
  projectData?: any;
  onBack: () => void;
  onSupportProject: (projectId: string, projectData?: any) => void;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  fundingAmount: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  requiredApproval: number;
  evidence?: {
    title: string;
    description: string;
    submittedDate: string;
    documents: string[];
  };
  completedDate?: string;
}

interface Update {
  id: number;
  date: string;
  title: string;
  content: string;
  author: string;
}

// Mock project data - in a real app, this would come from props or API
const projectData = {
  id: 'proj-1',
  title: 'AI-Powered Malaria Diagnosis System',
  researcher: 'Dr. Amina Okafor',
  researcherTitle: 'Associate Professor, Medical Informatics',
  researcherEmail: 'a.okafor@unilag.edu.ng',
  researcherInstitution: 'University of Lagos',
  researcherLocation: 'Lagos, Nigeria',
  researcherBio:
    'Dr. Amina Okafor is a leading researcher in medical AI with over 15 years of experience. She has published 40+ papers on machine learning applications in healthcare and holds 3 patents in diagnostic technology.',
  category: 'Medical Research',
  image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=600&fit=crop',
  shortDescription:
    'Developing machine learning models to diagnose malaria from blood samples with 95% accuracy, helping rural clinics provide faster treatment.',
  fullDescription: `This groundbreaking research project aims to revolutionize malaria diagnosis in Nigeria through the application of advanced artificial intelligence and machine learning technologies. Our team is developing a comprehensive diagnostic system that can analyze microscopic blood sample images and accurately detect malaria parasites with 95% accuracy.

The system will be specifically designed for deployment in rural healthcare facilities where access to trained microscopists is limited. By leveraging deep learning algorithms trained on thousands of annotated blood sample images, we can provide rapid, accurate diagnosis that rivals or exceeds human expert performance.

Key innovations include:
• Real-time image analysis using convolutional neural networks
• Mobile-friendly interface for use on smartphones and tablets
• Offline capability for areas with limited internet connectivity
• Integration with existing laboratory workflows
• Automated reporting and treatment recommendations

This technology has the potential to save thousands of lives by enabling faster treatment decisions and reducing misdiagnosis rates in underserved communities across Nigeria and beyond.`,
  impact: [
    'Enable rapid malaria diagnosis in 500+ rural clinics across Nigeria',
    'Reduce diagnosis time from hours to minutes',
    'Increase diagnostic accuracy by 30% compared to traditional methods',
    'Train 1,000+ healthcare workers in AI-assisted diagnosis',
    'Create open-source dataset of 100,000+ annotated blood samples',
  ],
  progress: 68,
  raised: '45,000',
  goal: '66,000',
  supporters: 234,
  trending: true,
  daysLeft: 45,
  startDate: '2024-08-15',
  estimatedCompletion: '2025-08-15',
  currentMilestone: 2,
  totalMilestones: 5,
  walletAddress: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgs',
};

const milestones: Milestone[] = [
  {
    id: 1,
    title: 'Research Design & Data Collection',
    description:
      'Establish research methodology, obtain ethical approvals, and begin collecting blood sample images from partner hospitals.',
    status: 'completed',
    fundingAmount: '13,200',
    votesFor: 187,
    votesAgainst: 8,
    totalVotes: 195,
    requiredApproval: 75,
    completedDate: '2024-10-20',
    evidence: {
      title: 'Research Protocol & Dataset Collection',
      description:
        'Submitted comprehensive research protocol approved by institutional review board. Collected 15,000 annotated blood sample images from 3 partner hospitals.',
      submittedDate: '2024-10-15',
      documents: ['Research_Protocol_v2.pdf', 'Ethics_Approval.pdf', 'Dataset_Summary.pdf'],
    },
  },
  {
    id: 2,
    title: 'Model Development & Training',
    description:
      'Develop and train deep learning models using collected data. Optimize algorithms for accuracy and performance.',
    status: 'active',
    fundingAmount: '13,200',
    votesFor: 156,
    votesAgainst: 12,
    totalVotes: 168,
    requiredApproval: 75,
    evidence: {
      title: 'Model Training Results & Validation',
      description:
        'Completed initial model training with 92% accuracy. Conducted cross-validation across multiple datasets. Ready to proceed to next phase.',
      submittedDate: '2024-11-20',
      documents: ['Model_Architecture.pdf', 'Training_Results.pdf', 'Validation_Report.pdf'],
    },
  },
  {
    id: 3,
    title: 'Clinical Validation Studies',
    description:
      'Conduct prospective clinical trials comparing AI diagnosis to expert microscopists in real-world settings.',
    status: 'pending',
    fundingAmount: '13,200',
    votesFor: 0,
    votesAgainst: 0,
    totalVotes: 0,
    requiredApproval: 75,
  },
  {
    id: 4,
    title: 'System Integration & Deployment',
    description:
      'Develop user-friendly interface, integrate with clinic workflows, and deploy pilot installations in 10 rural clinics.',
    status: 'pending',
    fundingAmount: '13,200',
    votesFor: 0,
    votesAgainst: 0,
    totalVotes: 0,
    requiredApproval: 75,
  },
  {
    id: 5,
    title: 'Training & Scale-up',
    description:
      'Train healthcare workers, monitor system performance, publish results, and plan nationwide rollout.',
    status: 'pending',
    fundingAmount: '13,200',
    votesFor: 0,
    votesAgainst: 0,
    totalVotes: 0,
    requiredApproval: 75,
  },
];

const updates: Update[] = [
  {
    id: 1,
    date: '2024-11-20',
    title: 'Milestone 2 Evidence Submitted for Community Vote',
    content:
      'We have successfully completed the model development and training phase! Our deep learning system has achieved 92% accuracy in initial testing. We have submitted evidence for community review and voting. Please review the documentation and cast your vote to help us move forward.',
    author: 'Dr. Amina Okafor',
  },
  {
    id: 2,
    date: '2024-11-05',
    title: 'Partnership Announcement: Lagos State Teaching Hospital',
    content:
      'Excited to announce a new partnership with Lagos State Teaching Hospital for clinical validation. This collaboration will give us access to expert microscopists and real patient data to validate our system.',
    author: 'Dr. Amina Okafor',
  },
  {
    id: 3,
    date: '2024-10-20',
    title: 'Milestone 1 Completed Successfully!',
    content:
      'Great news! We have successfully completed our first milestone with overwhelming community support (96% approval). We collected over 15,000 annotated blood sample images and received all necessary ethical approvals. Thank you to all our supporters!',
    author: 'Dr. Amina Okafor',
  },
];

export function CommunityProjectDetail({
  projectId,
  projectData: passedProjectData,
  onBack,
  onSupportProject,
}: CommunityProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'updates' | 'researcher'>(
    'overview'
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [isSupporting, setIsSupporting] = useState(false);

  // Use passed project data if available, otherwise use default data
  const displayImage = passedProjectData?.image || projectData.image;
  const displayTitle = passedProjectData?.title || projectData.title;
  const displayResearcher = passedProjectData?.researcher || projectData.researcher;
  const displayCategory = passedProjectData?.category || projectData.category;
  const displayProgress = passedProjectData?.progress || projectData.progress;
  const displayRaised = passedProjectData?.raised || projectData.raised;
  const displayGoal = passedProjectData?.goal || projectData.goal;
  const displaySupporters = passedProjectData?.supporters || projectData.supporters;
  const displayInstitution = passedProjectData?.researcherInstitution || projectData.researcherInstitution;
  const displayDescription = passedProjectData?.description || projectData.shortDescription;
  const displayDaysLeft = passedProjectData?.daysLeft || projectData.daysLeft;
  const displayTrending = passedProjectData?.trending !== undefined ? passedProjectData.trending : projectData.trending;

  const handleVote = (milestoneId: number, voteType: 'for' | 'against') => {
    // In a real app, this would call an API
    console.log(`Voting ${voteType} for milestone ${milestoneId}`);
    setHasVoted(true);
  };

  const handleSupport = () => {
    // Create a project object with all the necessary data
    const projectToSupport = passedProjectData || {
      id: projectId,
      title: displayTitle,
      researcher: displayResearcher,
      researcherInstitution: displayInstitution,
      category: displayCategory,
      image: displayImage,
      progress: displayProgress,
      raised: displayRaised,
      goal: displayGoal,
      supporters: displaySupporters,
      description: displayDescription,
      daysLeft: displayDaysLeft,
      trending: displayTrending,
    };
    onSupportProject(projectId, projectToSupport);
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'active':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-indigo-600">StemTrust</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Image and Quick Stats */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <ImageWithFallback
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">
                  {displayCategory}
                </span>
                {displayTrending && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </span>
                )}
              </div>
              <h1 className="text-gray-900 mb-4">{displayTitle}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{displayResearcher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span>{displayInstitution}</span>
                </div>
              </div>
              <p className="text-gray-700">{displayDescription}</p>
            </div>

            {/* Right: Funding Card */}
            <div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white sticky top-24">
                <div className="mb-6">
                  <p className="text-indigo-100 mb-2">Total Raised</p>
                  <p className="text-4xl mb-1">{displayRaised} ₳</p>
                  <p className="text-indigo-100">of {displayGoal} ₳ goal</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                    <div
                      className="bg-white h-3 rounded-full transition-all"
                      style={{ width: `${displayProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-indigo-100">
                    <span>{displayProgress}% funded</span>
                    <span>{displayDaysLeft} days left</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/20">
                  <div>
                    <p className="text-indigo-100 text-sm mb-1">Supporters</p>
                    <p className="text-2xl">{displaySupporters}</p>
                  </div>
                  <div>
                    <p className="text-indigo-100 text-sm mb-1">Milestone</p>
                    <p className="text-2xl">
                      {projectData.currentMilestone}/{projectData.totalMilestones}
                    </p>
                  </div>
                </div>

                {/* Support Button */}
                <button
                  onClick={handleSupport}
                  className="w-full bg-white text-indigo-600 py-3 rounded-lg hover:bg-indigo-50 transition-colors mb-3"
                >
                  Support This Project
                </button>

                <p className="text-xs text-indigo-100 text-center">
                  Funds are released only when milestones are approved by the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'milestones'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Milestones
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'updates'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Updates
            </button>
            <button
              onClick={() => setActiveTab('researcher')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'researcher'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Researcher
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Full Description */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-gray-900 mb-4">About This Project</h2>
                <div className="text-gray-700 whitespace-pre-line">{projectData.fullDescription}</div>
              </section>

              {/* Impact */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-gray-900 mb-4">Expected Impact</h2>
                <ul className="space-y-3">
                  {projectData.impact.map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <Target className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Timeline */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-gray-900 mb-4">Project Timeline</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="text-gray-900">{new Date(projectData.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-600">Estimated Completion</p>
                      <p className="text-gray-900">
                        {new Date(projectData.estimatedCompletion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-gray-900 mb-4">Project Wallet</h3>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Cardano Address</p>
                  <p className="text-xs text-gray-900 break-all font-mono">
                    {projectData.walletAddress}
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  All funds are held in a secure smart contract and released only upon milestone approval
                </p>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="text-gray-900">{projectData.progress}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Supporters</span>
                    <span className="text-gray-900">{projectData.supporters}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Milestones</span>
                    <span className="text-gray-900">
                      {projectData.currentMilestone} of {projectData.totalMilestones}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Days Remaining</span>
                    <span className="text-gray-900">{projectData.daysLeft} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-gray-900 mb-2">Project Milestones</h2>
              <p className="text-gray-600">
                Each milestone requires 75% community approval to release funds. Review evidence and cast
                your vote.
              </p>
            </div>

            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  {/* Milestone Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          milestone.status === 'completed'
                            ? 'bg-green-100 border-green-500'
                            : milestone.status === 'active'
                            ? 'bg-orange-100 border-orange-500'
                            : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        <span className="text-gray-900">{milestone.id}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{milestone.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${getStatusColor(
                            milestone.status
                          )}`}
                        >
                          {getStatusIcon(milestone.status)}
                          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{milestone.fundingAmount} ₳</span>
                        </div>
                        {milestone.completedDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Completed {new Date(milestone.completedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence Section (for active/completed milestones) */}
                  {milestone.evidence && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{milestone.evidence.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{milestone.evidence.description}</p>
                          <p className="text-xs text-gray-500 mb-3">
                            Submitted on {new Date(milestone.evidence.submittedDate).toLocaleDateString()}
                          </p>
                          <div className="space-y-2">
                            {milestone.evidence.documents.map((doc, idx) => (
                              <button
                                key={idx}
                                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {doc}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Voting Section (for active milestone) */}
                  {milestone.status === 'active' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Community Approval</span>
                          <span className="text-sm text-gray-900">
                            {milestone.totalVotes > 0
                              ? Math.round((milestone.votesFor / milestone.totalVotes) * 100)
                              : 0}
                            % ({milestone.votesFor} of {milestone.totalVotes} votes)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              milestone.totalVotes > 0 &&
                              (milestone.votesFor / milestone.totalVotes) * 100 >= milestone.requiredApproval
                                ? 'bg-green-500'
                                : 'bg-orange-500'
                            }`}
                            style={{
                              width: `${
                                milestone.totalVotes > 0
                                  ? (milestone.votesFor / milestone.totalVotes) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {milestone.requiredApproval}% approval required to release funds
                        </p>
                      </div>

                      {!hasVoted ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleVote(milestone.id, 'for')}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Approve Milestone
                          </button>
                          <button
                            onClick={() => handleVote(milestone.id, 'against')}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Reject Milestone
                          </button>
                        </div>
                      ) : (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                          <p className="text-sm text-indigo-700">✓ You have already voted on this milestone</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Vote Results */}
                  {milestone.status === 'completed' && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-green-900">Milestone Approved by Community</span>
                        </div>
                        <p className="text-sm text-green-700">
                          {Math.round((milestone.votesFor / milestone.totalVotes) * 100)}% approval (
                          {milestone.votesFor} votes for, {milestone.votesAgainst} votes against)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-gray-900 mb-2">Project Updates</h2>
              <p className="text-gray-600">
                Stay informed about the latest progress and announcements from the research team.
              </p>
            </div>

            <div className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{update.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{update.content}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{update.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Researcher Tab */}
        {activeTab === 'researcher' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900 mb-2">{projectData.researcher}</h2>
                  <p className="text-gray-600 mb-4">{projectData.researcherTitle}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="w-5 h-5" />
                      <span>{projectData.researcherInstitution}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{projectData.researcherLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-5 h-5" />
                      <span>{projectData.researcherEmail}</span>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Follow Researcher
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 mb-6">{projectData.researcherBio}</p>

                <h3 className="text-gray-900 mb-3">Other Projects</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-900 mb-1">Deep Learning for Tuberculosis Detection</p>
                      <p className="text-sm text-gray-600">Completed • 2023</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm">View</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-900 mb-1">COVID-19 Prediction Models for Nigeria</p>
                      <p className="text-sm text-gray-600">Completed • 2022</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm">View</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
