import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { IndividualDashboard } from './components/IndividualDashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { WalletProvider, useWallet } from './components/WalletProvider';
import { CommunityDashboard } from './components/community/CommunityDashboard';
import { ProjectDiscovery } from './components/community/ProjectDiscovery';
import { CommunityProfile } from './components/community/CommunityProfile';
import { ProjectSupportModal } from './components/community/ProjectSupportModal';
import { CommunityProjectDetail } from './components/community/CommunityProjectDetail';
import { MyProjects } from './components/community/MyProjects';
import { SupportConfirmationModal } from './components/community/SupportConfirmationModal';
import { Toaster } from './components/ui/sonner';

export type UserType = 'organization' | 'individual' | 'community' | null;

export interface User {
  id: string;
  name: string;
  email?: string;
  type: UserType;
  role?: 'organization' | 'individual' | 'community';
  walletAddress?: string;
  organization?: string;
  institution?: string;
  location?: string;
  interests?: string; // For community members
}

type ViewType = 'landing' | 'auth' | 'dashboard' | 'project' | 'community-dashboard' | 'discovery' | 'community-profile' | 'community-project-detail' | 'my-projects';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [authType, setAuthType] = useState<UserType>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportConfirmationOpen, setSupportConfirmationOpen] = useState(false);
  const [selectedSupportProject, setSelectedSupportProject] = useState<any>(null);
  const [supportedProjects, setSupportedProjects] = useState<any[]>([]);

  const handleLoginClick = (userType: UserType) => {
    setAuthType(userType);
    setCurrentView('auth');
  };

  const handleAuthSuccess = (userData: User) => {
    // Set role based on type if not already set
    const userWithRole = {
      ...userData,
      role: userData.role || userData.type as 'organization' | 'individual' | 'community'
    };
    setCurrentUser(userWithRole);
    // Route community members to community dashboard, others to standard dashboard
    if (userData.type === 'community') {
      setCurrentView('community-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setAuthType(null);
    setCurrentUser(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setSelectedProjectId(null);
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProjectId(null);
  };

  const handleCommunitySignupComplete = () => {
    setCurrentView('community-dashboard');
    setCurrentUser({
      id: 'community-' + Date.now(),
      name: 'Community Member',
      type: 'community',
    });
  };

  const handleNavigateToDiscovery = () => {
    setCurrentView('discovery');
  };

  const handleNavigateToProfile = () => {
    setCurrentView('community-profile');
  };

  const handleBackToCommunityDashboard = () => {
    setCurrentView('community-dashboard');
  };

  const handleViewCommunityProject = (projectId: string, projectData?: any) => {
    setSelectedProjectId(projectId);
    setSelectedProjectData(projectData);
    setCurrentView('community-project-detail');
  };

  const handleBackFromCommunityProject = () => {
    setSelectedProjectId(null);
    setSelectedProjectData(null);
    // Determine where to go back - could be dashboard or discovery
    setCurrentView('community-dashboard');
  };

  const handleSupportProject = (projectId: string, projectData?: any) => {
    // Find the project data from selectedProjectData or use provided data
    const project = projectData || selectedProjectData || {
      id: projectId,
      title: 'AI-Powered Malaria Diagnosis System',
      researcher: 'Dr. Amina Okafor',
      researcherInstitution: 'University of Lagos',
      category: 'Medical Research',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop',
      progress: 68,
      raised: '45,000',
      goal: '66,000',
      supporters: 234,
    };
    setSelectedSupportProject(project);
    setSupportConfirmationOpen(true);
  };

  const handleConfirmSupportFromModal = () => {
    // Add project to supported projects if not already there
    if (selectedSupportProject && !supportedProjects.find(p => p.id === selectedSupportProject.id)) {
      setSupportedProjects([...supportedProjects, selectedSupportProject]);
    }
    setSupportConfirmationOpen(false);
    // Navigate to My Projects screen
    setCurrentView('my-projects');
  };

  const handleConfirmSupport = (projectId: string, amount: number) => {
    console.log(`Supporting project ${projectId} with ${amount} ADA`);
    setSupportModalOpen(false);
  };

  const handleNavigateToMyProjects = () => {
    setCurrentView('my-projects');
  };

  return (
    <WalletProvider>
      <AppContent
        currentView={currentView}
        currentUser={currentUser}
        authType={authType}
        selectedProjectId={selectedProjectId}
        selectedProjectData={selectedProjectData}
        supportModalOpen={supportModalOpen}
        selectedSupportProject={selectedSupportProject}
        onLoginClick={handleLoginClick}
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={handleBackToLanding}
        onLogout={handleLogout}
        onViewProject={handleViewProject}
        onBackToDashboard={handleBackToDashboard}
        onCommunitySignupComplete={handleCommunitySignupComplete}
        onNavigateToDiscovery={handleNavigateToDiscovery}
        onNavigateToProfile={handleNavigateToProfile}
        onBackToCommunityDashboard={handleBackToCommunityDashboard}
        onViewCommunityProject={handleViewCommunityProject}
        onBackFromCommunityProject={handleBackFromCommunityProject}
        onSupportProject={handleSupportProject}
        onConfirmSupport={handleConfirmSupport}
        onCloseSupportModal={() => setSupportModalOpen(false)}
        onNavigateToMyProjects={handleNavigateToMyProjects}
        supportConfirmationOpen={supportConfirmationOpen}
        onConfirmSupportFromModal={handleConfirmSupportFromModal}
        onCloseSupportConfirmation={() => setSupportConfirmationOpen(false)}
        supportedProjects={supportedProjects}
      />
      <Toaster />
    </WalletProvider>
  );
}

interface AppContentProps {
  currentView: ViewType;
  currentUser: User | null;
  authType: UserType;
  selectedProjectId: string | null;
  selectedProjectData: any;
  supportModalOpen: boolean;
  supportConfirmationOpen: boolean;
  selectedSupportProject: any;
  supportedProjects: any[];
  onLoginClick: (userType: UserType) => void;
  onAuthSuccess: (userData: User) => void;
  onBackToLanding: () => void;
  onLogout: () => void;
  onViewProject: (projectId: string) => void;
  onBackToDashboard: () => void;
  onCommunitySignupComplete: () => void;
  onNavigateToDiscovery: () => void;
  onNavigateToProfile: () => void;
  onNavigateToMyProjects: () => void;
  onBackToCommunityDashboard: () => void;
  onViewCommunityProject: (projectId: string, projectData?: any) => void;
  onBackFromCommunityProject: () => void;
  onSupportProject: (projectId: string, projectData?: any) => void;
  onConfirmSupport: (projectId: string, amount: number) => void;
  onCloseSupportModal: () => void;
  onConfirmSupportFromModal: () => void;
  onCloseSupportConfirmation: () => void;
}

function AppContent({
  currentView,
  currentUser,
  authType,
  selectedProjectId,
  selectedProjectData,
  supportModalOpen,
  supportConfirmationOpen,
  selectedSupportProject,
  supportedProjects,
  onLoginClick,
  onAuthSuccess,
  onBackToLanding,
  onLogout,
  onViewProject,
  onBackToDashboard,
  onCommunitySignupComplete,
  onNavigateToDiscovery,
  onNavigateToProfile,
  onNavigateToMyProjects,
  onBackToCommunityDashboard,
  onViewCommunityProject,
  onBackFromCommunityProject,
  onSupportProject,
  onConfirmSupport,
  onCloseSupportModal,
  onConfirmSupportFromModal,
  onCloseSupportConfirmation,
}: AppContentProps) {
  const { connectWallet, connected, address, balance } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'landing' && <LandingPage onLogin={onLoginClick} />}

      {currentView === 'auth' && authType && (
        <AuthPage
          userType={authType}
          onBack={onBackToLanding}
          onAuthSuccess={onAuthSuccess}
        />
      )}

      {currentView === 'dashboard' && currentUser?.type === 'organization' && (
        <OrganizationDashboard
          user={currentUser}
          onLogout={onLogout}
          onViewProject={onViewProject}
        />
      )}

      {currentView === 'dashboard' && currentUser?.type === 'individual' && (
        <IndividualDashboard
          user={currentUser}
          onLogout={onLogout}
          onViewProject={onViewProject}
        />
      )}

      {currentView === 'project' && selectedProjectId && (
        <ProjectDetail
          projectId={selectedProjectId}
          currentUser={currentUser}
          onBack={onBackToDashboard}
        />
      )}

      {currentView === 'community-dashboard' && (
        <CommunityDashboard
          user={currentUser}
          walletAddress={address || 'Not Connected'}
          walletBalance={balance || '0 ADA'}
          onNavigateToDiscovery={onNavigateToDiscovery}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToMyProjects={onNavigateToMyProjects}
          onViewProject={onViewCommunityProject}
          onLogout={onLogout}
        />
      )}

      {currentView === 'discovery' && (
        <ProjectDiscovery
          onBack={onBackToCommunityDashboard}
          onViewProject={onViewCommunityProject}
          onSupportProject={onSupportProject}
        />
      )}

      {currentView === 'community-project-detail' && selectedProjectId && (
        <CommunityProjectDetail
          projectId={selectedProjectId}
          projectData={selectedProjectData}
          onBack={onBackFromCommunityProject}
          onSupportProject={onSupportProject}
        />
      )}

      {currentView === 'community-profile' && (
        <CommunityProfile
          user={currentUser}
          onBack={onBackToCommunityDashboard}
          walletAddress={address || 'Not Connected'}
          walletBalance={balance || '0 ADA'}
        />
      )}

      {currentView === 'my-projects' && (
        <MyProjects
          onBack={onBackToCommunityDashboard}
          supportedProjects={supportedProjects}
          onViewProjectDetail={onViewCommunityProject}
        />
      )}

      {supportModalOpen && selectedSupportProject && (
        <ProjectSupportModal
          isOpen={supportModalOpen}
          onClose={onCloseSupportModal}
          project={selectedSupportProject}
          walletBalance={balance || '0 ADA'}
          onConfirmSupport={onConfirmSupport}
        />
      )}

      {supportConfirmationOpen && selectedSupportProject && (
        <SupportConfirmationModal
          project={selectedSupportProject}
          onConfirm={onConfirmSupportFromModal}
          onCancel={onCloseSupportConfirmation}
        />
      )}
    </div>
  );
}