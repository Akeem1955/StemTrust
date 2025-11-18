import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { IndividualDashboard } from './components/IndividualDashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { WalletProvider } from './components/WalletProvider';

export type UserType = 'organization' | 'individual' | null;

export interface User {
  id: string;
  name: string;
  email?: string;
  type: UserType;
  walletAddress?: string;
  organization?: string;
  institution?: string;
  location?: string;
}

type ViewType = 'landing' | 'auth' | 'dashboard' | 'project';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [authType, setAuthType] = useState<UserType>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleLoginClick = (userType: UserType) => {
    setAuthType(userType);
    setCurrentView('auth');
  };

  const handleAuthSuccess = (userData: User) => {
    setCurrentUser(userData);
    setCurrentView('dashboard');
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

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'landing' && (
          <LandingPage onLogin={handleLoginClick} />
        )}
        
        {currentView === 'auth' && authType && (
          <AuthPage
            userType={authType}
            onBack={handleBackToLanding}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        
        {currentView === 'dashboard' && currentUser?.type === 'organization' && (
          <OrganizationDashboard
            user={currentUser}
            onLogout={handleLogout}
            onViewProject={handleViewProject}
          />
        )}
        
        {currentView === 'dashboard' && currentUser?.type === 'individual' && (
          <IndividualDashboard
            user={currentUser}
            onLogout={handleLogout}
            onViewProject={handleViewProject}
          />
        )}

        {currentView === 'project' && selectedProjectId && (
          <ProjectDetail
            projectId={selectedProjectId}
            currentUser={currentUser}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </WalletProvider>
  );
}
