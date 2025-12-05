import { TrendingUp, Sparkles, Award, Heart, Search, Bell, User, Wallet, ChevronRight, LogOut, Building } from 'lucide-react';
import type { User as UserType } from '../../App';

interface CommunityDashboardProps {
  user: UserType | null;
  walletAddress: string;
  walletBalance: string;
  onNavigateToDiscovery: () => void;
  onNavigateToProfile: () => void;
  onNavigateToMyProjects: () => void;
  onViewProject: (projectId: string, projectData?: any) => void;
  onLogout: () => void;
}

const trendingProjects = [
  {
    id: 1,
    title: 'AI-Powered Malaria Diagnosis System',
    researcher: 'Dr. Amina Okafor',
    researcherInstitution: 'University of Lagos',
    category: 'Medical Research',
    progress: 68,
    raised: '45,000',
    goal: '66,000',
    supporters: 234,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop',
    description: 'Developing machine learning models to diagnose malaria from blood samples with 95% accuracy, helping rural clinics provide faster treatment.',
    daysLeft: 45,
    trending: true,
  },
  {
    id: 2,
    title: 'Sustainable Solar Panel Materials',
    researcher: 'Prof. Chidi Nwosu',
    researcherInstitution: 'University of Ibadan',
    category: 'Renewable Energy',
    progress: 82,
    raised: '78,500',
    goal: '95,000',
    supporters: 412,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    description: 'Research into locally-sourced materials for affordable solar panel manufacturing in West Africa.',
    daysLeft: 22,
    trending: true,
  },
  {
    id: 3,
    title: 'Water Purification IoT Network',
    researcher: 'Eng. Fatima Ibrahim',
    researcherInstitution: 'Ahmadu Bello University',
    category: 'Environmental Tech',
    progress: 45,
    raised: '32,000',
    goal: '71,000',
    supporters: 189,
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400&h=300&fit=crop',
    description: 'IoT-enabled water quality monitoring system for rural communities across Northern Nigeria.',
    daysLeft: 38,
    trending: false,
  },
];

const newProjects = [
  {
    id: 4,
    title: 'Blockchain for Agricultural Supply Chain',
    researcher: 'Dr. Oluwaseun Adeyemi',
    researcherInstitution: 'Federal University of Agriculture, Abeokuta',
    category: 'AgriTech',
    daysAgo: 2,
    goal: '50,000',
    progress: 12,
    raised: '6,000',
    supporters: 45,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
    description: 'Implementing blockchain technology to create transparent and efficient agricultural supply chains for smallholder farmers.',
    daysLeft: 58,
    trending: false,
  },
  {
    id: 5,
    title: 'Machine Learning for Early Disease Detection',
    researcher: 'Dr. Ngozi Okeke',
    researcherInstitution: 'University of Nigeria Teaching Hospital',
    category: 'Healthcare AI',
    daysAgo: 5,
    goal: '80,000',
    progress: 8,
    raised: '6,400',
    supporters: 32,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    description: 'Developing AI models to detect early signs of cardiovascular disease using routine medical imaging.',
    daysLeft: 55,
    trending: false,
  },
];

const recommendedResearchers = [
  { name: 'Dr. Amina Okafor', field: 'Medical Research', followers: 1240 },
  { name: 'Prof. Chidi Nwosu', field: 'Renewable Energy', followers: 892 },
  { name: 'Eng. Fatima Ibrahim', field: 'Environmental Tech', followers: 567 },
];

export function CommunityDashboard({ user, walletAddress, walletBalance, onNavigateToDiscovery, onNavigateToProfile, onNavigateToMyProjects, onViewProject, onLogout }: CommunityDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-indigo-600">StemTrust</h1>
              <nav className="hidden md:flex gap-6">
                <button className="text-indigo-600 hover:text-indigo-700">Dashboard</button>
                <button onClick={onNavigateToDiscovery} className="text-gray-600 hover:text-gray-900">Discover</button>
                <button onClick={onNavigateToMyProjects} className="text-gray-600 hover:text-gray-900">My Projects</button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Wallet Info */}
              <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-600">Balance</p>
                  <p className="text-sm text-gray-900">{walletBalance} ₳</p>
                </div>
              </div>

              {/* Profile */}
              <button onClick={onNavigateToProfile} className="p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </button>

              {/* Logout */}
              <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2">Welcome to StemTrust Community</h2>
              <p className="text-indigo-100 mb-4">
                Discover innovative research projects and support Nigerian STEM researchers
              </p>
              <button
                onClick={onNavigateToDiscovery}
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Explore Projects
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <p className="text-sm text-indigo-100 mb-1">Your Wallet</p>
                <p className="text-2xl mb-1">{walletBalance} ₳</p>
                <p className="text-xs text-indigo-100">{walletAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={onNavigateToMyProjects}
            className="bg-white rounded-xl p-6 border border-gray-200 text-left hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Projects Supported</p>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl text-gray-900">12</p>
            <p className="text-sm text-indigo-600 mt-1">View & vote on milestones →</p>
          </button>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Total Contributed</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl text-gray-900">2,450 ₳</p>
            <p className="text-sm text-gray-500 mt-1">Across all projects</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Following</p>
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl text-gray-900">8</p>
            <p className="text-sm text-gray-500 mt-1">Researchers</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Votes Cast</p>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl text-gray-900">24</p>
            <p className="text-sm text-gray-500 mt-1">Milestone approvals</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Projects */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-gray-900">Trending Projects</h3>
                </div>
                <button onClick={onNavigateToDiscovery} className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {trendingProjects.map((project) => (
                  <div 
                    key={project.id} 
                    onClick={() => onViewProject(`proj-${project.id}`, project)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex gap-4 p-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <span className="inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded mb-2">
                          {project.category}
                        </span>
                        <h4 className="text-gray-900 mb-1">{project.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">by {project.researcher}</p>

                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{project.raised} ₳ raised</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{project.supporters} supporters</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProject(`proj-${project.id}`, project);
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                          >
                            Support Project
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* New Projects */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-gray-900">New Projects</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {newProjects.map((project) => (
                  <div 
                    key={project.id} 
                    onClick={() => onViewProject(`proj-${project.id}`, project)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded mb-2">
                      New • {project.daysAgo} days ago
                    </span>
                    <h4 className="text-gray-900 mb-2">{project.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">by {project.researcher}</p>
                    <p className="text-sm text-gray-500 mb-3">Goal: {project.goal} ₳</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProject(`proj-${project.id}`, project);
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* My Organizations */}
            {user?.memberships && user.memberships.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900">My Organizations</h3>
                </div>
                <div className="space-y-4">
                  {user.memberships.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{membership.organizationName}</p>
                        <p className="text-xs text-gray-500 capitalize">{membership.role}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        membership.status === 'active' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {membership.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Researchers */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-gray-900 mb-4">Recommended Researchers</h3>
              <div className="space-y-4">
                {recommendedResearchers.map((researcher, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{researcher.name}</p>
                        <p className="text-xs text-gray-500">{researcher.field}</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm">Follow</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Supported */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="text-gray-900">Most Supported</h3>
              </div>
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-sm text-gray-900 mb-1">AI-Powered Malaria Diagnosis</p>
                  <p className="text-xs text-gray-500">412 supporters • 78,500 ₳</p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-sm text-gray-900 mb-1">Sustainable Solar Materials</p>
                  <p className="text-xs text-gray-500">234 supporters • 45,000 ₳</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900 mb-1">Water Purification Network</p>
                  <p className="text-xs text-gray-500">189 supporters • 32,000 ₳</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}