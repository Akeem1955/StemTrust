import { Shield, Target, Users, TrendingUp, CheckCircle, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { UserType } from '../App';

interface LandingPageProps {
  onLogin: (userType: UserType) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-8 text-green-600" />
            <span className="text-2xl">ScienceTrust Nigeria</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onLogin('individual')}>
              Login as Researcher
            </Button>
            <Button onClick={() => onLogin('organization')}>
              Login as Organization
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-6">
              Transparent STEM Research Funding for Nigeria
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Blockchain-powered platform ensuring accountability, trust, and milestone-based funding 
              for research projects across Nigeria. Built on Cardano for complete transparency.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => onLogin('individual')}>
                <Target className="mr-2 size-5" />
                Apply for Funding
              </Button>
              <Button size="lg" variant="outline" onClick={() => onLogin('organization')}>
                <Users className="mr-2 size-5" />
                Fund Research
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-center mb-12">The Challenge We're Solving</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="text-red-500 mb-4">
                  <TrendingUp className="size-10" />
                </div>
                <h3 className="text-xl mb-3">Mismanaged Funds</h3>
                <p className="text-gray-600">
                  Research funds are often not used properly, with no clear tracking of expenditure.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-red-500 mb-4">
                  <Shield className="size-10" />
                </div>
                <h3 className="text-xl mb-3">Unreliable Results</h3>
                <p className="text-gray-600">
                  Research outcomes are sometimes reported dishonestly without proper verification.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-red-500 mb-4">
                  <Users className="size-10" />
                </div>
                <h3 className="text-xl mb-3">Lost Trust</h3>
                <p className="text-gray-600">
                  Funders, government, and public losing confidence in the research process.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-center mb-12">How ScienceTrust Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="text-xl mb-2">Create Campaign or Apply for Funding</h3>
                  <p className="text-gray-600">
                    Organizations can create funding campaigns and onboard projects. Researchers can apply 
                    directly for funding. All funding is divided into milestone stages (3-10 for organizations, 
                    fixed 5 for individuals).
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-xl mb-2">Funds Locked in Smart Contract</h3>
                  <p className="text-gray-600">
                    All funding is secured in a Cardano smart contract. Funds are only released milestone 
                    by milestone based on community approval.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="text-xl mb-2">Submit Progress & Evidence</h3>
                  <p className="text-gray-600">
                    Researchers upload images, apps, links, and tangible proof of progress for each milestone. 
                    All evidence is verifiable and transparent.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center">
                  4
                </div>
                <div>
                  <h3 className="text-xl mb-2">Community Votes</h3>
                  <p className="text-gray-600">
                    Funders review the progress and vote. When 75% of funders approve, the smart contract 
                    automatically releases the next stage of funding.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center">
                  5
                </div>
                <div>
                  <h3 className="text-xl mb-2">Complete Transparency</h3>
                  <p className="text-gray-600">
                    Every transaction, vote, and milestone is recorded on the Cardano blockchain, 
                    creating an immutable record of accountability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl text-center mb-12">Platform Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <CheckCircle className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2">Milestone-Based Funding</h3>
                  <p className="text-gray-600">
                    Funds released only when milestones are achieved and verified
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2">Community Governance</h3>
                  <p className="text-gray-600">
                    75% approval required from funders to progress to next stage
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2">Blockchain Verified</h3>
                  <p className="text-gray-600">
                    All transactions on Cardano blockchain for complete transparency
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2">Flexible Stages</h3>
                  <p className="text-gray-600">
                    Organizations can customize 3-10 stages, individuals have 5 stages
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2">Evidence Upload</h3>
                  <p className="text-gray-600">
                    Upload images, apps, links as proof of research progress
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="size-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2">Cardano Wallet Integration</h3>
                  <p className="text-gray-600">
                    Secure wallet connection using Mesh, Lucid, and Blockfrost
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl mb-4">Ready to Restore Trust in Nigerian Research?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join organizations and researchers building a transparent future for STEM in Nigeria
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => onLogin('individual')}>
              <Wallet className="mr-2 size-5" />
              Get Started as Researcher
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600" onClick={() => onLogin('organization')}>
              <Shield className="mr-2 size-5" />
              Get Started as Organization
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            ScienceTrust Nigeria - Blockchain-powered transparent research funding
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Built on Cardano blockchain with Mesh, Lucid, and Blockfrost
          </p>
        </div>
      </footer>
    </div>
  );
}
