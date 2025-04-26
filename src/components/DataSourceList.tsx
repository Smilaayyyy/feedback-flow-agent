
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSource } from "@/lib/types";
import { toast } from "sonner";

type DataSourceListProps = {
  sources: DataSource[];
  onRunAnalysis?: (sourceId: string) => void;
  onDelete?: (sourceId: string) => void;
};

export function DataSourceList({ sources, onRunAnalysis, onDelete }: DataSourceListProps) {
  const [runningAnalysis, setRunningAnalysis] = useState<string | null>(null);

  const handleRunAnalysis = (sourceId: string) => {
    setRunningAnalysis(sourceId);
    // Simulate analysis process
    setTimeout(() => {
      if (onRunAnalysis) onRunAnalysis(sourceId);
      setRunningAnalysis(null);
      toast.success("Analysis completed successfully");
    }, 2000);
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'completed':
        return "bg-green-500";
      case 'collecting':
        return "bg-blue-500";
      case 'pending':
        return "bg-yellow-500";
      case 'error':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: DataSource['status']) => {
    switch (status) {
      case 'completed':
        return "Completed";
      case 'collecting':
        return "Collecting";
      case 'pending':
        return "Pending";
      case 'error':
        return "Error";
      default:
        return "Unknown";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (sources.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No data sources yet</h3>
        <p className="text-sm text-muted-foreground">Add your first data source to start collecting feedback.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {sources.map((source) => (
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                  <span className="text-sm">{getStatusLabel(source.status)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {formatDate(source.lastUpdated)}
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
                    onClick={() => onDelete(source.id)}
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
