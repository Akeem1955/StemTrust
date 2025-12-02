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

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  votingPower: number; // 1-10
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending';
}

export interface OnboardingStatus {
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: string;
  acceptedAt?: string;
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
    email: string;
    walletAddress: string;
  };
  sponsor?: {
    id: string;
    name: string;
    type: 'organization' | 'individual';
  };
  createdAt: string;
  status: 'pending-onboarding' | 'active' | 'completed' | 'cancelled';
  backers: Backer[];
  assignedMembers?: ProjectMember[];
  onboardingStatus?: OnboardingStatus;
}

export interface Backer {
  id: string;
  name: string;
  amount: number;
  walletAddress: string;
  hasVoted?: boolean;
  vote?: 'approve' | 'reject';
}

export interface CampaignMilestoneTemplate {
  title: string;
  description: string;
  fundingPercentage: number; // 0-100
  durationWeeks: number;
}

export interface Campaign {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  category: string;
  totalBudget: number; // in ADA
  stagesCount: number;
  milestoneTemplates: CampaignMilestoneTemplate[];
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
      email: 'amaka.okonkwo@unilag.edu.ng',
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
    assignedMembers: [
      {
        id: 'pm-a1',
        name: 'Dr. John Adeyemi',
        email: 'j.adeyemi@nrf.org',
        votingPower: 3,
        role: 'admin',
        status: 'active'
      },
      {
        id: 'pm-a2',
        name: 'Sarah Okafor',
        email: 's.okafor@nrf.org',
        votingPower: 2,
        role: 'member',
        status: 'active'
      },
      {
        id: 'pm-a3',
        name: 'James Idowu',
        email: 'j.idowu@nrf.org',
        votingPower: 1,
        role: 'viewer',
        status: 'active'
      }
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
      email: 'c.nwosu@abu.edu.ng',
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
      email: 'f.ibrahim@ui.edu.ng',
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
  },
  {
    id: 'proj-4',
    title: 'AI-Powered Medical Diagnosis for Remote Areas',
    description: 'Developing an AI system to assist healthcare workers in remote Nigerian communities with preliminary medical diagnosis using symptom analysis and medical imaging.',
    category: 'Healthcare Technology',
    totalFunding: 60000,
    currentMilestone: 1,
    researcher: {
      id: 'res-4',
      name: 'Dr. Oluwaseun Adebayo',
      institution: 'University of Lagos Teaching Hospital',
      email: 'oluwaseun.adebayo@luth.edu.ng',
      walletAddress: ''
    },
    sponsor: {
      id: 'org-1',
      name: 'Nigerian Research Foundation',
      type: 'organization'
    },
    createdAt: '2024-11-25',
    status: 'pending-onboarding',
    backers: [],
    assignedMembers: [
      {
        id: 'pm-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        votingPower: 2,
        role: 'admin',
        status: 'active'
      },
      {
        id: 'pm-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        votingPower: 1,
        role: 'member',
        status: 'active'
      }
    ],
    onboardingStatus: {
      status: 'pending',
      sentAt: '2024-11-25T10:30:00Z'
    },
    milestones: [
      {
        id: 'm16',
        stageNumber: 1,
        name: 'Research & Planning',
        description: 'Research existing AI diagnostic tools and plan system architecture',
        fundingAmount: 12000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm17',
        stageNumber: 2,
        name: 'Data Collection & Preparation',
        description: 'Collect and prepare medical data for AI training',
        fundingAmount: 15000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm18',
        stageNumber: 3,
        name: 'AI Model Development',
        description: 'Develop and train AI diagnostic models',
        fundingAmount: 18000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm19',
        stageNumber: 4,
        name: 'Testing & Validation',
        description: 'Test system with healthcare workers in pilot communities',
        fundingAmount: 10000,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        totalVoters: 2
      },
      {
        id: 'm20',
        stageNumber: 5,
        name: 'Deployment & Training',
        description: 'Deploy system and train healthcare workers',
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
    category: 'Agriculture Technology',
    totalBudget: 200000,
    stagesCount: 5,
    milestoneTemplates: [
      { title: 'Research Planning & Setup', description: 'Initial research design and methodology', fundingPercentage: 15, durationWeeks: 4 },
      { title: 'Data Collection & Analysis', description: 'Gather and analyze field data', fundingPercentage: 20, durationWeeks: 8 },
      { title: 'Core Development', description: 'Build core technology solution', fundingPercentage: 30, durationWeeks: 12 },
      { title: 'Testing & Validation', description: 'Test with target users and validate results', fundingPercentage: 20, durationWeeks: 6 },
      { title: 'Documentation & Deployment', description: 'Finalize documentation and deploy solution', fundingPercentage: 15, durationWeeks: 4 }
    ],
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
    category: 'Supply Chain',
    totalBudget: 150000,
    stagesCount: 7,
    milestoneTemplates: [
      { title: 'Requirements Analysis', description: 'Understand supply chain gaps and requirements', fundingPercentage: 10, durationWeeks: 3 },
      { title: 'Blockchain Architecture', description: 'Design blockchain solution architecture', fundingPercentage: 15, durationWeeks: 4 },
      { title: 'Smart Contract Development', description: 'Develop and audit smart contracts', fundingPercentage: 20, durationWeeks: 6 },
      { title: 'Mobile App Development', description: 'Build farmer-friendly mobile app', fundingPercentage: 20, durationWeeks: 8 },
      { title: 'Integration & Testing', description: 'Integrate components and conduct testing', fundingPercentage: 15, durationWeeks: 5 },
      { title: 'Pilot Deployment', description: 'Deploy pilot with select farmers', fundingPercentage: 10, durationWeeks: 4 },
      { title: 'Training & Scaling', description: 'Train users and scale deployment', fundingPercentage: 10, durationWeeks: 6 }
    ],
    projects: [mockProjects[2]],
    createdAt: '2024-07-15',
    status: 'active'
  },
  {
    id: 'camp-3',
    organizationId: 'org-1',
    organizationName: 'Nigerian Research Foundation',
    title: 'Clean Water Innovation Challenge',
    description: 'Funding innovative water purification and access solutions for rural communities.',
    category: 'Water & Sanitation',
    totalBudget: 120000,
    stagesCount: 3,
    milestoneTemplates: [
      { title: 'Prototype Development', description: 'Design and build initial prototype', fundingPercentage: 40, durationWeeks: 8 },
      { title: 'Community Testing', description: 'Test prototype in target communities', fundingPercentage: 35, durationWeeks: 10 },
      { title: 'Final Deployment', description: 'Deploy and monitor final solution', fundingPercentage: 25, durationWeeks: 6 }
    ],
    projects: [mockProjects[1]],
    createdAt: '2024-06-20',
    status: 'active'
  }
];
