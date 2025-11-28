import { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Users,
  Award,
  Wallet,
  Copy,
  CheckCircle,
  TrendingUp,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { User as UserType } from '../../App';

interface CommunityProfileProps {
  onBack: () => void;
  user?: UserType | null;
  walletAddress: string;
  walletBalance: string;
}

interface SupportedProject {
  id: string;
  title: string;
  researcher: string;
  category: string;
  image: string;
  amountDonated: number;
  dateSupported: string;
  status: 'active' | 'completed';
  progress: number;
}

interface FollowedResearcher {
  id: string;
  name: string;
  institution: string;
  field: string;
  projects: number;
  followers: number;
  isFollowing: boolean;
}

interface VotingHistory {
  id: string;
  projectTitle: string;
  milestoneName: string;
  vote: 'approve' | 'reject';
  date: string;
  outcome: 'passed' | 'pending' | 'failed';
}

const supportedProjects: SupportedProject[] = [
  {
    id: 'proj-1',
    title: 'AI-Powered Malaria Diagnosis System',
    researcher: 'Dr. Amina Okafor',
    category: 'Medical Research',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop',
    amountDonated: 150,
    dateSupported: '2024-09-15',
    status: 'active',
    progress: 68,
  },
  {
    id: 'proj-2',
    title: 'Sustainable Solar Panel Materials',
    researcher: 'Prof. Chidi Nwosu',
    category: 'Renewable Energy',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    amountDonated: 300,
    dateSupported: '2024-08-20',
    status: 'active',
    progress: 82,
  },
  {
    id: 'proj-3',
    title: 'Water Purification IoT Network',
    researcher: 'Eng. Fatima Ibrahim',
    category: 'Environmental Tech',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400&h=300&fit=crop',
    amountDonated: 100,
    dateSupported: '2024-10-05',
    status: 'active',
    progress: 45,
  },
  {
    id: 'proj-4',
    title: 'Blockchain for Agricultural Supply Chain',
    researcher: 'Dr. Oluwaseun Adeyemi',
    category: 'AgriTech',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
    amountDonated: 200,
    dateSupported: '2024-07-12',
    status: 'completed',
    progress: 100,
  },
];

const followedResearchers: FollowedResearcher[] = [
  {
    id: 'res-1',
    name: 'Dr. Amina Okafor',
    institution: 'University of Lagos',
    field: 'Medical Research',
    projects: 3,
    followers: 1240,
    isFollowing: true,
  },
  {
    id: 'res-2',
    name: 'Prof. Chidi Nwosu',
    institution: 'Ahmadu Bello University',
    field: 'Renewable Energy',
    projects: 5,
    followers: 892,
    isFollowing: true,
  },
  {
    id: 'res-3',
    name: 'Eng. Fatima Ibrahim',
    institution: 'University of Ibadan',
    field: 'Environmental Tech',
    projects: 2,
    followers: 567,
    isFollowing: true,
  },
];

const votingHistory: VotingHistory[] = [
  {
    id: 'vote-1',
    projectTitle: 'AI-Powered Malaria Diagnosis System',
    milestoneName: 'ML Model Development',
    vote: 'approve',
    date: '2024-11-12',
    outcome: 'pending',
  },
  {
    id: 'vote-2',
    projectTitle: 'Sustainable Solar Panel Materials',
    milestoneName: 'Prototype Testing',
    vote: 'approve',
    date: '2024-11-08',
    outcome: 'passed',
  },
  {
    id: 'vote-3',
    projectTitle: 'Water Purification IoT Network',
    milestoneName: 'Design & Planning',
    vote: 'approve',
    date: '2024-11-01',
    outcome: 'passed',
  },
  {
    id: 'vote-4',
    projectTitle: 'Blockchain for Agricultural Supply Chain',
    milestoneName: 'Smart Contract Development',
    vote: 'approve',
    date: '2024-10-20',
    outcome: 'passed',
  },
];

export function CommunityProfile({
  onBack,
  user,
  walletAddress,
  walletBalance,
}: CommunityProfileProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const totalDonated = supportedProjects.reduce(
    (sum, project) => sum + project.amountDonated,
    0
  );
  const activeProjects = supportedProjects.filter((p) => p.status === 'active').length;
  const totalVotes = votingHistory.length;
  const approvalRate = Math.round(
    (votingHistory.filter((v) => v.vote === 'approve').length / votingHistory.length) * 100
  );

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
            <h2 className="text-gray-900 hidden sm:block">Community Profile</h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-12 h-12 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="mb-2">Community Member</h2>
              <p className="text-indigo-100 mb-4">
                Supporting Nigerian STEM research through transparent blockchain funding
              </p>

              {/* Wallet Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="w-5 h-5 text-white" />
                  <span className="text-sm text-indigo-100">Wallet Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm">{shortenAddress(walletAddress)}</code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress ? (
                      <CheckCircle className="w-4 h-4 text-green-300" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-sm text-indigo-100 mb-1">Current Balance</p>
              <p className="text-3xl mb-1">{walletBalance}</p>
              <p className="text-xs text-indigo-100">Available for donations</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl text-gray-900 mb-1">{supportedProjects.length}</p>
            <p className="text-sm text-gray-600">Projects Supported</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl text-gray-900 mb-1">{totalDonated} ₳</p>
            <p className="text-sm text-gray-600">Total Contributed</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl text-gray-900 mb-1">{followedResearchers.length}</p>
            <p className="text-sm text-gray-600">Following</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl text-gray-900 mb-1">{totalVotes}</p>
            <p className="text-sm text-gray-600">Votes Cast</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="projects">Supported Projects</TabsTrigger>
            <TabsTrigger value="researchers">Following</TabsTrigger>
            <TabsTrigger value="voting">Voting History</TabsTrigger>
          </TabsList>

          {/* Supported Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {supportedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full sm:w-40 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {project.category}
                        </Badge>
                        <h3 className="text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {project.researcher}</p>
                      </div>
                      <Badge
                        className={
                          project.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      >
                        {project.status === 'active' ? 'Active' : 'Completed'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Your Contribution</p>
                        <p className="text-gray-900">{project.amountDonated} ₳</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date Supported</p>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.dateSupported).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                      View Project Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="researchers" className="space-y-4">
            {followedResearchers.map((researcher) => (
              <div
                key={researcher.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{researcher.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{researcher.institution}</p>
                      <Badge variant="secondary">{researcher.field}</Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Projects</p>
                      <p className="text-gray-900">{researcher.projects}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Followers</p>
                      <p className="text-gray-900">{researcher.followers}</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                      Following
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Voting History Tab */}
          <TabsContent value="voting" className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h3 className="text-gray-900 mb-2">Your Voting Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Votes</p>
                  <p className="text-2xl text-gray-900">{totalVotes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approvals</p>
                  <p className="text-2xl text-green-600">
                    {votingHistory.filter((v) => v.vote === 'approve').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejections</p>
                  <p className="text-2xl text-red-600">
                    {votingHistory.filter((v) => v.vote === 'reject').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
                  <p className="text-2xl text-gray-900">{approvalRate}%</p>
                </div>
              </div>
            </div>

            {votingHistory.map((vote) => (
              <div
                key={vote.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">{vote.projectTitle}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Milestone: <strong>{vote.milestoneName}</strong>
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(vote.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge
                      className={
                        vote.vote === 'approve'
                          ? 'bg-green-100 text-green-700 mb-2'
                          : 'bg-red-100 text-red-700 mb-2'
                      }
                    >
                      {vote.vote === 'approve' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        'Rejected'
                      )}
                    </Badge>
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          vote.outcome === 'passed'
                            ? 'border-green-300 text-green-700'
                            : vote.outcome === 'pending'
                            ? 'border-yellow-300 text-yellow-700'
                            : 'border-red-300 text-red-700'
                        }
                      >
                        {vote.outcome === 'passed'
                          ? '✓ Milestone Passed'
                          : vote.outcome === 'pending'
                          ? '⏳ Vote Pending'
                          : '✗ Milestone Failed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}