import { useState } from 'react';
import { Shield, ArrowLeft, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthPageProps {
  userType: 'organization' | 'individual' | 'community';
  onBack: () => void;
  onAuthSuccess: (userData: any) => void;
}

export function AuthPage({ userType, onBack, onAuthSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const getIcon = () => {
    if (userType === 'community') return <Users className="size-8" />;
    return <Shield className="size-8" />;
  };

  const getTitle = () => {
    if (userType === 'community') return 'Community Member';
    if (userType === 'organization') return 'Organization';
    return 'Researcher';
  };

  const getDescription = () => {
    if (userType === 'community') {
      return 'Support research projects and participate in community voting';
    }
    if (userType === 'organization') {
      return 'Fund and manage research projects with blockchain transparency';
    }
    return 'Apply for funding and showcase your research progress';
  };

  const getColor = () => {
    if (userType === 'community') return 'indigo';
    return 'green';
  };

  const colorClass = getColor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Auth Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${
              userType === 'community' ? 'bg-indigo-600' : 'bg-green-600'
            } text-white rounded-full mb-4`}>
              {getIcon()}
            </div>
            <h1 className="text-3xl mb-2">
              {getTitle()} Access
            </h1>
            <p className="text-gray-600">
              {getDescription()}
            </p>
          </div>

          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <SignInForm 
                  userType={userType} 
                  onSuccess={onAuthSuccess}
                  onSwitchToSignUp={() => setActiveTab('signup')}
                />
              </TabsContent>

              <TabsContent value="signup">
                <SignUpForm 
                  userType={userType} 
                  onSuccess={onAuthSuccess}
                  onSwitchToSignIn={() => setActiveTab('signin')}
                />
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              By continuing, you agree to connect your Cardano wallet
              and participate in transparent, blockchain-verified research funding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}