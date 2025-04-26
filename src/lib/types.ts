
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
  type: 'forum' | 'website' | 'social' | 'survey' | 'reviews';
  status: 'pending' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error';
  lastUpdated: Date;
};

export type AnalysisResult = {
  id: string;
  sourceId: string;
  sentimentScore: number;
  topThemes: Theme[];
  createdAt: Date;
  urgentFeedback?: UrgentFeedback[];
  insightTags?: InsightTag[];
};

export type Theme = {
  name: string;
  count: number;
  sentiment: number;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  userId: string;
  dataSources: DataSource[];
  analysisResults: AnalysisResult[];
  createdAt: Date;
  alertSettings?: AlertSettings;
  analysisPreferences?: AnalysisPreferences;
};

export type OnboardingStep = 
  | 'welcome' 
  | 'project' 
  | 'sourceType' 
  | 'dataSource' 
  | 'analysisPreferences' 
  | 'alertSetup' 
  | 'complete';

export type UrgentFeedback = {
  id: string;
  content: string;
  source: string;
  urgencyScore: number;
  createdAt: Date;
};

export type InsightTag = {
  id: string;
  name: string;
  count: number;
};

export type AlertSettings = {
  frequency: 'realtime' | 'daily' | 'weekly' | 'none';
  sentimentThreshold: 'very-negative' | 'negative' | 'neutral';
  notifyOnUrgent: boolean;
};

export type AnalysisPreferences = {
  sentiment: boolean;
  themes: boolean;
  urgency: boolean;
  competitors: boolean;
};

export type AgentStatus = {
  collection: 'idle' | 'running' | 'completed' | 'error';
  processing: 'idle' | 'running' | 'completed' | 'error';
  analysis: 'idle' | 'running' | 'completed' | 'error';
  reporting: 'idle' | 'running' | 'completed' | 'error';
};

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'image';

export type ReportSchedule = {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: ExportFormat;
};
