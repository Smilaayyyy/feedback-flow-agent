
export type User = {
  id: string;
  name: string;
  email: string;
  hasProject: boolean;
};

export type DataSource = {
  id: string;
  name: string;
  url: string;
  type: 'forum' | 'website' | 'social' | 'survey';
  status: 'pending' | 'collecting' | 'completed' | 'error';
  lastUpdated: Date;
};

export type AnalysisResult = {
  id: string;
  sourceId: string;
  sentimentScore: number;
  topThemes: Theme[];
  createdAt: Date;
};

export type Theme = {
  name: string;
  count: number;
  sentiment: number;
};

export type Project = {
  id: string;
  name: string;
  userId: string;
  dataSources: DataSource[];
  analysisResults: AnalysisResult[];
  createdAt: Date;
};

export type OnboardingStep = 'welcome' | 'project' | 'dataSource' | 'complete';
