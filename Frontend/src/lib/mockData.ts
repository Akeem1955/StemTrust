export interface Milestone {
  id: string;
  stageNumber: number;
  name: string;
  description: string;
  fundingAmount: number; // in ADA
  status: 'pending' | 'in-progress' | 'voting' | 'approved' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  evidence?: Evidence[];
  completedDate?: string;
}

export interface Evidence {
  id: string;
  type: 'image' | 'app' | 'link' | 'document';
  title: string;
  url: string;
  uploadedAt: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  totalFunding: number; // in ADA
  currentMilestone: number;
  milestones: Milestone[];
  researcher: {
    id: string;
    name: string;
    institution: string;
    walletAddress: string;
  };
  sponsor?: {
    id: string;
    name: string;
    type: 'organization' | 'individual';
  };
  createdAt: string;
  status: 'active' | 'completed' | 'cancelled';
  backers: Backer[];
}

export interface Backer {
  id: string;
  name: string;
  amount: number;
  walletAddress: string;
  hasVoted?: boolean;
  vote?: 'approve' | 'reject';
}

export interface Campaign {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  totalBudget: number; // in ADA
  stagesCount: number;
  projects: Project[];
  createdAt: string;
  status: 'active' | 'closed';
}

// Mock data
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'AI-Powered Agricultural Pest Detection System',
    description: 'Developing a mobile app using machine learning to identify crop pests and diseases, helping Nigerian farmers reduce crop losses by up to 40%.',
    category: 'Agriculture Technology',
    totalFunding: 50000,
    currentMilestone: 2,
    researcher: {
      id: 'res-1',
      name: 'Dr. Amaka Okonkwo',
      institution: 'University of Lagos',
      walletAddress: 'addr1_researcher_wallet_1'
    },
    sponsor: {
      id: 'org-1',
      name: 'Nigerian Research Foundation',
      type: 'organization'
    },
    createdAt: '2024-09-15',
    status: 'active',
    backers: [
      { id: 'b1', name: 'Nigerian Research Foundation', amount: 30000, walletAddress: 'addr1_backer_1' },
      { id: 'b2', name: 'TechHub Lagos', amount: 15000, walletAddress: 'addr1_backer_2' },
      { id: 'b3', name: 'Green Farms Initiative', amount: 5000, walletAddress: 'addr1_backer_3' }
    ],
    milestones: [
      {
        id: 'm1',
        stageNumber: 1,
        name: 'Research & Data Collection',
        description: 'Gather dataset of 10,000+ pest images from Nigerian farms',
        fundingAmount: 10000,
        status: 'approved',
        votesFor: 3,
        votesAgainst: 0,
        totalVoters: 3,
        completedDate: '2024-10-20',
        evidence: [
          {
            id: 'e1',
            type: 'document',
            title: 'Data Collection Report',
            url: '#',
            uploadedAt: '2024-10-18',
            description: 'Comprehensive report with 12,450 pest images collected from 45 farms across 6 states'
          },
          {
            id: 'e2',
            type: 'link',
            title: 'Dataset Repository',
            url: '#',
            uploadedAt: '2024-10-19',
            description: 'GitHub repository containing anonymized and categorized pest image dataset'
          }
        ]
      },
      {
        id: 'm2',
        stageNumber: 2,
        name: 'ML Model Development',
        description: 'Train and test machine learning models for pest identification',
        fundingAmount: 15000,
        status: 'voting',
        votesFor: 2,
        votesAgainst: 0,
        totalVoters: 3,
        evidence: [
          {
            id: 'e3',
            type: 'app',
            title: 'Model Testing Dashboard',
            url: '#',
            uploadedAt: '2024-11-10',
            description: 'Interactive dashboard showing 94.2% accuracy in pest detection across 23 pest categories'
          },
          {
            id: 'e4',
            type: 'image',
            title: 'Model Performance Metrics',
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            uploadedAt: '2024-11-12',
            description: 'Confusion matrix and ROC curves demonstrating model performance'
          }
        ]
      },
      {
        id: 'm3',
        stageNumber: 3,
        name: 'Mobile App Development',
        description: 'Build Android and iOS apps with offline capabilities',
        fundingAmount: 12000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 3
      },
      {
        id: 'm4',
        stageNumber: 4,
        name: 'Field Testing',
        description: 'Test app with 100 farmers across 10 states',
        fundingAmount: 8000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 3
      },
      {
        id: 'm5',
        stageNumber: 5,
        name: 'Launch & Training',
        description: 'Public launch and farmer training programs',
        fundingAmount: 5000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 3
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Solar-Powered Water Purification for Rural Communities',
    description: 'Engineering low-cost, solar-powered water purification units using locally available materials to provide clean water to rural Nigerian communities.',
    category: 'Environmental Engineering',
    totalFunding: 35000,
    currentMilestone: 1,
    researcher: {
      id: 'res-2',
      name: 'Engr. Chukwudi Nwosu',
      institution: 'Ahmadu Bello University',
      walletAddress: 'addr1_researcher_wallet_2'
    },
    createdAt: '2024-10-01',
    status: 'active',
    backers: [
      { id: 'b4', name: 'Water Access Foundation', amount: 20000, walletAddress: 'addr1_backer_4' },
      { id: 'b5', name: 'Clean Energy Initiative', amount: 15000, walletAddress: 'addr1_backer_5' }
    ],
    milestones: [
      {
        id: 'm6',
        stageNumber: 1,
        name: 'Prototype Design',
        description: 'Design and engineer the first prototype unit',
        fundingAmount: 7000,
        status: 'in-progress',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2,
        evidence: [
          {
            id: 'e5',
            type: 'image',
            title: 'CAD Designs',
            url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
            uploadedAt: '2024-11-15',
            description: '3D CAD models of the purification unit with detailed specifications'
          }
        ]
      },
      {
        id: 'm7',
        stageNumber: 2,
        name: 'Build & Test Prototype',
        description: 'Construct and test first working unit',
        fundingAmount: 10000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm8',
        stageNumber: 3,
        name: 'Community Pilot',
        description: 'Install 5 units in pilot community',
        fundingAmount: 10000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm9',
        stageNumber: 4,
        name: 'Performance Monitoring',
        description: 'Monitor and optimize units over 3 months',
        fundingAmount: 5000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm10',
        stageNumber: 5,
        name: 'Scale & Documentation',
        description: 'Create blueprints and training materials for scaling',
        fundingAmount: 3000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Blockchain-Based Supply Chain for Nigerian Cocoa',
    description: 'Creating a transparent blockchain system to track cocoa from Nigerian farms to international markets, ensuring fair prices for farmers.',
    category: 'Blockchain & Agriculture',
    totalFunding: 45000,
    currentMilestone: 3,
    researcher: {
      id: 'res-3',
      name: 'Dr. Fatima Ibrahim',
      institution: 'University of Ibadan',
      walletAddress: 'addr1_researcher_wallet_3'
    },
    sponsor: {
      id: 'org-2',
      name: 'Cocoa Farmers Association',
      type: 'organization'
    },
    createdAt: '2024-08-01',
    status: 'active',
    backers: [
      { id: 'b6', name: 'Cocoa Farmers Association', amount: 25000, walletAddress: 'addr1_backer_6' },
      { id: 'b7', name: 'Fair Trade Nigeria', amount: 20000, walletAddress: 'addr1_backer_7' }
    ],
    milestones: [
      {
        id: 'm11',
        stageNumber: 1,
        name: 'Requirements Analysis',
        description: 'Interview farmers and buyers to understand supply chain gaps',
        fundingAmount: 5000,
        status: 'approved',
        votesFor: 2,
        votesAgainst: 0,
        totalVoters: 2,
        completedDate: '2024-09-10'
      },
      {
        id: 'm12',
        stageNumber: 2,
        name: 'Smart Contract Development',
        description: 'Develop and audit blockchain smart contracts',
        fundingAmount: 12000,
        status: 'approved',
        votesFor: 2,
        votesAgainst: 0,
        totalVoters: 2,
        completedDate: '2024-10-15'
      },
      {
        id: 'm13',
        stageNumber: 3,
        name: 'Mobile App Development',
        description: 'Build farmer-friendly mobile tracking app',
        fundingAmount: 15000,
        status: 'in-progress',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2,
        evidence: [
          {
            id: 'e6',
            type: 'app',
            title: 'Beta App Demo',
            url: '#',
            uploadedAt: '2024-11-16',
            description: 'Working beta version with QR code scanning and transaction tracking'
          }
        ]
      },
      {
        id: 'm14',
        stageNumber: 4,
        name: 'Pilot Program',
        description: 'Test with 50 farmers and 5 buyers',
        fundingAmount: 8000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm15',
        stageNumber: 5,
        name: 'Full Deployment',
        description: 'Scale to 500+ farmers across multiple states',
        fundingAmount: 5000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      }
    ]
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    organizationId: 'org-1',
    organizationName: 'Nigerian Research Foundation',
    title: 'AgriTech Innovation Fund 2024',
    description: 'Supporting innovative agricultural technology solutions to improve food security and farmer income in Nigeria.',
    totalBudget: 200000,
    stagesCount: 5,
    projects: [mockProjects[0]],
    createdAt: '2024-09-01',
    status: 'active'
  },
  {
    id: 'camp-2',
    organizationId: 'org-2',
    organizationName: 'Cocoa Farmers Association',
    title: 'Cocoa Value Chain Enhancement',
    description: 'Funding projects that improve transparency and fairness in the Nigerian cocoa supply chain.',
    totalBudget: 150000,
    stagesCount: 5,
    projects: [mockProjects[2]],
    createdAt: '2024-07-15',
    status: 'active'
  }
];
