
import { User, Project, DataSource, AnalysisResult, Theme } from './types';

// Mock User
export const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  hasProject: true,
};

// Mock Themes
export const mockThemes: Theme[] = [
  { name: 'User Experience', count: 45, sentiment: 0.3 },
  { name: 'Performance', count: 32, sentiment: -0.2 },
  { name: 'Features', count: 28, sentiment: 0.5 },
  { name: 'Design', count: 24, sentiment: 0.7 },
  { name: 'Pricing', count: 18, sentiment: -0.4 },
];

// Mock Data Sources
export const mockDataSources: DataSource[] = [
  {
    id: 'ds-1',
    name: 'Product Forum',
    url: 'https://forum.example.com',
    type: 'forum',
    status: 'completed',
    lastUpdated: new Date('2025-04-20T15:30:00'),
  },
  {
    id: 'ds-2',
    name: 'Customer Feedback Form',
    url: 'https://feedback.example.com',
    type: 'survey',
    status: 'collecting',
    lastUpdated: new Date('2025-04-25T09:15:00'),
  },
  {
    id: 'ds-3',
    name: 'Company Twitter',
    url: 'https://twitter.com/example',
    type: 'social',
    status: 'pending',
    lastUpdated: new Date('2025-04-26T10:00:00'),
  },
];

// Mock Analysis Results
export const mockAnalysisResults: AnalysisResult[] = [
  {
    id: 'ar-1',
    sourceId: 'ds-1',
    sentimentScore: 0.65,
    topThemes: mockThemes.slice(0, 3),
    createdAt: new Date('2025-04-21T14:00:00'),
  },
  {
    id: 'ar-2',
    sourceId: 'ds-2',
    sentimentScore: -0.2,
    topThemes: mockThemes.slice(2, 5),
    createdAt: new Date('2025-04-25T10:30:00'),
  },
];

// Mock Project
export const mockProject: Project = {
  id: 'p-1',
  name: 'Customer Feedback Analysis',
  userId: '1',
  dataSources: mockDataSources,
  analysisResults: mockAnalysisResults,
  createdAt: new Date('2025-04-15T09:00:00'),
};

// New user with no project
export const newUser: User = {
  id: '2',
  name: 'New User',
  email: 'new@example.com',
  hasProject: false,
};
