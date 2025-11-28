import { useState } from 'react';
import { Search, Filter, TrendingUp, Heart, Users, ChevronLeft } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';

interface ProjectDiscoveryProps {
  onBack: () => void;
  onViewProject: (projectId: string, projectData?: any) => void;
  onSupportProject: (projectId: string, projectData?: any) => void;
}

interface ProjectCard {
  id: string;
  title: string;
  researcher: string;
  researcherInstitution: string;
  category: string;
  description: string;
  image: string;
  progress: number;
  raised: string;
  goal: string;
  supporters: number;
  trending: boolean;
  daysLeft?: number;
}

const projects: ProjectCard[] = [
  {
    id: 'proj-1',
    title: 'AI-Powered Malaria Diagnosis System',
    researcher: 'Dr. Amina Okafor',
    researcherInstitution: 'University of Lagos',
    category: 'Medical Research',
    description: 'Developing machine learning models to diagnose malaria from blood samples with 95% accuracy, helping rural clinics provide faster treatment.',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop',
    progress: 68,
    raised: '45,000',
    goal: '66,000',
    supporters: 234,
    trending: true,
    daysLeft: 45,
  },
  {
    id: 'proj-2',
    title: 'Sustainable Solar Panel Materials',
    researcher: 'Prof. Chidi Nwosu',
    researcherInstitution: 'Ahmadu Bello University',
    category: 'Renewable Energy',
    description: 'Researching locally-sourced materials for affordable solar panels to bring clean energy to Nigerian communities.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
    progress: 82,
    raised: '78,500',
    goal: '95,000',
    supporters: 412,
    trending: true,
    daysLeft: 30,
  },
  {
    id: 'proj-3',
    title: 'Water Purification IoT Network',
    researcher: 'Eng. Fatima Ibrahim',
    researcherInstitution: 'University of Ibadan',
    category: 'Environmental Tech',
    description: 'Building IoT-enabled water purification systems that monitor water quality in real-time for rural communities.',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop',
    progress: 45,
    raised: '32,000',
    goal: '71,000',
    supporters: 189,
    trending: false,
    daysLeft: 60,
  },
  {
    id: 'proj-4',
    title: 'Blockchain for Agricultural Supply Chain',
    researcher: 'Dr. Oluwaseun Adeyemi',
    researcherInstitution: 'Federal University of Technology Akure',
    category: 'AgriTech',
    description: 'Creating a transparent blockchain system to track produce from farm to market, ensuring fair prices for farmers.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
    progress: 23,
    raised: '12,000',
    goal: '50,000',
    supporters: 87,
    trending: false,
    daysLeft: 75,
  },
  {
    id: 'proj-5',
    title: 'Machine Learning for Early Disease Detection',
    researcher: 'Dr. Ngozi Okeke',
    researcherInstitution: 'University of Nigeria Nsukka',
    category: 'Healthcare AI',
    description: 'Developing AI algorithms to predict diseases early from patient data, improving healthcare outcomes in Nigeria.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
    progress: 35,
    raised: '28,000',
    goal: '80,000',
    supporters: 156,
    trending: false,
    daysLeft: 50,
  },
  {
    id: 'proj-6',
    title: 'Drone Technology for Precision Agriculture',
    researcher: 'Eng. Ibrahim Musa',
    researcherInstitution: 'Bayero University Kano',
    category: 'Agriculture Technology',
    description: 'Building affordable drone systems for crop monitoring and precision farming to increase agricultural productivity.',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=400&fit=crop',
    progress: 55,
    raised: '33,000',
    goal: '60,000',
    supporters: 198,
    trending: true,
    daysLeft: 40,
  },
  {
    id: 'proj-7',
    title: 'Low-Cost 3D Printed Prosthetics',
    researcher: 'Dr. Funmilayo Adebayo',
    researcherInstitution: 'Lagos State University',
    category: 'Medical Technology',
    description: 'Designing 3D-printed prosthetic limbs using affordable materials to help amputees across Nigeria.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    progress: 70,
    raised: '42,000',
    goal: '55,000',
    supporters: 289,
    trending: false,
    daysLeft: 35,
  },
  {
    id: 'proj-8',
    title: 'Electric Vehicle Charging Infrastructure',
    researcher: 'Eng. Samuel Oladipo',
    researcherInstitution: 'Obafemi Awolowo University',
    category: 'Clean Transportation',
    description: 'Developing solar-powered EV charging stations network for sustainable transportation in Nigerian cities.',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop',
    progress: 15,
    raised: '9,000',
    goal: '65,000',
    supporters: 64,
    trending: false,
    daysLeft: 90,
  },
];

const categories = [
  'All Projects',
  'Medical Research',
  'Renewable Energy',
  'Environmental Tech',
  'AgriTech',
  'Healthcare AI',
  'Clean Transportation',
];

export function ProjectDiscovery({ onBack, onViewProject, onSupportProject }: ProjectDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'mostSupported'>('trending');

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.researcher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All Projects' || project.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') return b.trending ? 1 : -1;
      if (sortBy === 'mostSupported') return b.supporters - a.supporters;
      return 0; // newest would use date if available
    });

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
            <h2 className="text-gray-900 hidden sm:block">Discover Research Projects</h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, researchers, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('trending')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === 'trending'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Trending
              </button>
              <button
                onClick={() => setSortBy('mostSupported')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === 'mostSupported'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-1" />
                Most Supported
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="text-gray-900">{filteredProjects.length}</span> projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onViewProject(project.id, project)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Project Image */}
              <div className="relative">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                {project.trending && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-orange-500 text-white border-none">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                )}
                {project.daysLeft && project.daysLeft <= 30 && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-red-500 text-white border-none">
                      {project.daysLeft} days left
                    </Badge>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-5">
                <div className="mb-3">
                  <Badge variant="secondary" className="mb-2">
                    {project.category}
                  </Badge>
                  <h3 className="text-gray-900 mb-2 line-clamp-2">{project.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span>{project.researcher}</span>
                  </div>
                  <p className="text-sm text-gray-500">{project.researcherInstitution}</p>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{project.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="text-gray-900">{project.raised} ₳</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">of {project.goal} ₳ goal</p>
                </div>

                {/* Supporters & Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{project.supporters} supporters</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSupportProject(project.id, project);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm transition-colors"
                  >
                    Support
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find more projects
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
