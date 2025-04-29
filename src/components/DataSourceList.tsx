
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getDataSources, updateDataSourceStatus } from "@/services/agentService";
import type { CollectionStatus } from "@/services/agentService";

type DataSource = {
  id: string;
  name: string;
  url: string;
  type: 'forum' | 'social' | 'reviews' | 'survey';
  status: CollectionStatus;
  last_updated: string;
  collector_agents: {
    name: string;
    type: string;
  };
};

type DataSourceListProps = {
  onRunAnalysis?: (sourceId: string) => void;
  onDelete?: (sourceId: string) => void;
  refreshTrigger?: number;
};

export function DataSourceList({ onRunAnalysis, onDelete, refreshTrigger = 0 }: DataSourceListProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState<string | null>(null);

  useEffect(() => {
    loadDataSources();
  }, [refreshTrigger]);

  const loadDataSources = async () => {
    setIsLoading(true);
    const { data, error } = await getDataSources();
    
    if (error) {
      toast.error("Failed to load data sources");
      console.error("Error loading data sources:", error);
    } else if (data) {
      setDataSources(data as DataSource[]);
    }
    
    setIsLoading(false);
  };

  const handleRunAnalysis = async (sourceId: string) => {
    setRunningAnalysis(sourceId);
    
    try {
      // Update status to processing
      await updateDataSourceStatus(sourceId, "processing");
      
      // Simulate analysis process
      setTimeout(async () => {
        await updateDataSourceStatus(sourceId, "completed");
        if (onRunAnalysis) onRunAnalysis(sourceId);
        toast.success("Analysis completed successfully");
        loadDataSources();
      }, 2000);
    } catch (error) {
      console.error("Error running analysis:", error);
      toast.error("Failed to run analysis");
    } finally {
      setRunningAnalysis(null);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (onDelete) onDelete(sourceId);
  };

  const getStatusColor = (status: CollectionStatus) => {
    switch (status) {
      case 'completed':
        return "bg-green-500";
      case 'collecting':
        return "bg-blue-500";
      case 'processing':
        return "bg-blue-700";
      case 'analyzing':
        return "bg-purple-500";
      case 'pending':
        return "bg-yellow-500";
      case 'error':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: CollectionStatus) => {
    switch (status) {
      case 'completed':
        return "Completed";
      case 'collecting':
        return "Collecting";
      case 'processing':
        return "Processing";
      case 'analyzing':
        return "Analyzing";
      case 'pending':
        return "Pending";
      case 'error':
        return "Error";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading data sources...</p>
      </div>
    );
  }

  if (dataSources.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No data sources yet</h3>
        <p className="text-sm text-muted-foreground">Add your first data source to start collecting feedback.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {dataSources.map((source) => (
        <Card key={source.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{source.name}</CardTitle>
              <Badge variant="outline" className="capitalize">{source.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4">
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">URL</div>
                <div className="truncate">{source.url}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Agent</div>
                <div>{source.collector_agents?.name || "No agent assigned"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                  <span className="text-sm">{getStatusLabel(source.status)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {formatDate(source.last_updated)}
                </div>
              </div>
              <div className="flex gap-2">
                {source.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={runningAnalysis === source.id}
                    onClick={() => handleRunAnalysis(source.id)}
                  >
                    {runningAnalysis === source.id ? "Running..." : "Run Analysis"}
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(source.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DataSourceList;
