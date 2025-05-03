import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusCard from "@/components/StatusCard";
import { fetchDashboardData, fetchReportData } from "@/services/api/dashboardService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/api/baseApiService";

type DashboardProps = {
  projectId: string | null;
  dataSourceId?: string | null;
};

export function DashboardContent({ projectId, dataSourceId }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardHtml, setDashboardHtml] = useState<string | null>(null);
  const [kpis, setKpis] = useState<any[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (dataSourceId) {
      console.log("Loading dashboard with dataSourceId:", dataSourceId);
      getDataSourceDetails(dataSourceId);
    } else if (projectId) {
      console.log("Loading dashboard with projectId:", projectId);
      getLatestCompletedDataSource(projectId);
    } else {
      console.log("No dataSourceId or projectId provided");
      setIsLoading(false);
    }
  }, [projectId, dataSourceId]);

  const getDataSourceDetails = async (sourceId: string) => {
    setIsLoading(true);
    
    try {
      console.log("Fetching data source details for id:", sourceId);
      const { data, error } = await supabase
        .from("data_sources")
        .select("metadata, status")
        .eq("id", sourceId)
        .single();
      
      if (error) {
        console.error("Error fetching data source:", error);
        throw error;
      }
      
      console.log("Data source details retrieved:", data);
      setDebugInfo({ dataSource: data });
      
      // Safely extract task_id from metadata
      const metadataObj = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata;
      
      const taskId = metadataObj?.task_id;
      console.log("Extracted task_id:", taskId);
      
      if (data && data.status === "completed" && taskId) {
        setTaskId(taskId);
        loadDashboardData(taskId);
      } else {
        setIsLoading(false);
        setDashboardHtml("<div>No dashboard data available yet. Status: " + data.status + "</div>");
        toast.info(`Data source status: ${data.status}. Dashboard will be available once collection is completed.`);
      }
    } catch (error) {
      console.error("Error fetching data source details:", error);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard data. Please check console for details.</div>");
      toast.error("Failed to load dashboard data");
    }
  };

  const getLatestCompletedDataSource = async (projId: string) => {
    setIsLoading(true);
    
    try {
      console.log("Fetching latest completed data source for project:", projId);
      const { data, error } = await supabase
        .from("data_sources")
        .select("id, metadata, status")
        .eq("project_id", projId)
        .eq("status", "completed")
        .order("last_updated", { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching data sources:", error);
        throw error;
      }
      
      console.log("Latest completed data source:", data);
      setDebugInfo({ latestDataSource: data });
      
      if (data && data.length > 0) {
        // Safely extract task_id from metadata
        const metadataObj = typeof data[0].metadata === 'string' 
          ? JSON.parse(data[0].metadata) 
          : data[0].metadata;
        
        const taskId = metadataObj?.task_id;
        console.log("Extracted task_id:", taskId);
        
        if (taskId) {
          setTaskId(taskId);
          loadDashboardData(taskId);
        } else {
          setIsLoading(false);
          setDashboardHtml("<div>No task ID found in the completed data source.</div>");
          toast.warning("No task ID found in the completed data source");
        }
      } else {
        // If no completed sources, let's also check for any sources
        const { data: allSources, error: allError } = await supabase
          .from("data_sources")
          .select("id, status")
          .eq("project_id", projId)
          .order("last_updated", { ascending: false });
          
        if (allError) throw allError;
        
        if (allSources && allSources.length > 0) {
          console.log("All data sources for project:", allSources);
          setIsLoading(false);
          setDashboardHtml(`<div>You have ${allSources.length} data source(s), but none are completed yet. Current statuses: ${allSources.map(s => s.status).join(', ')}.</div>`);
          toast.info("No completed data sources found. Please wait for data collection to complete.");
        } else {
          setIsLoading(false);
          setDashboardHtml("<div>No data sources found for this project.</div>");
          toast.info("No data sources found for this project");
        }
      }
    } catch (error) {
      console.error("Error fetching latest completed data source:", error);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard data. Please check console for details.</div>");
      toast.error("Failed to load dashboard data");
    }
  };

  const loadDashboardData = async (tid: string) => {
    try {
      console.log("Loading dashboard data for task:", tid);
      // Fetch dashboard HTML content
      const { data: dashboardData, error: dashboardError } = await fetchDashboardData(tid);
      
      if (dashboardError) {
        console.error("Dashboard data error:", dashboardError);
        throw dashboardError;
      }
      
      console.log("Dashboard data response:", dashboardData);
      setDebugInfo(prev => ({ ...prev, dashboardData }));
      
      if (dashboardData?.html) {
        setDashboardHtml(dashboardData.html);
      } else {
        setDashboardHtml("<div>No HTML content available in dashboard response</div>");
      }
      
      // Fetch KPIs and report data
      const { data: reportData, error: reportError } = await fetchReportData(tid);
      
      if (reportError) {
        console.error("Report data error:", reportError);
        throw reportError;
      }
      
      console.log("Report data response:", reportData);
      setDebugInfo(prev => ({ ...prev, reportData }));
      
      if (reportData?.kpis) {
        setKpis(reportData.kpis);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard content. Please check console for details.</div>");
      toast.error("Failed to load dashboard content");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardHtml && kpis.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-4">No dashboard data available</h3>
          <p className="text-muted-foreground mb-4">
            Complete data collection to view dashboard insights.
          </p>
          {taskId && (
            <div className="text-sm bg-muted p-4 rounded text-left">
              <p>Task ID: {taskId}</p>
              <p className="mt-2 text-xs">If your collection has completed but no data appears, check that your API endpoints are working correctly.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {kpis.slice(0, 4).map((kpi, index) => (
            <StatusCard
              key={index}
              title={kpi.name}
              value={kpi.value}
              description={kpi.description}
              change={kpi.change ? {
                value: kpi.change.value,
                type: kpi.change.direction
              } : undefined}
            />
          ))}
        </div>
      )}
      
      {dashboardHtml && (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Analysis</CardTitle>
            <CardDescription>Insights generated from your collected data</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="dashboard-content" 
              dangerouslySetInnerHTML={{ __html: dashboardHtml }} 
            />
          </CardContent>
        </Card>
      )}
      
      {debugInfo && (
        <Card className="mt-8 border-dashed border-orange-300">
          <CardHeader>
            <CardTitle className="text-orange-500">Debug Information</CardTitle>
            <CardDescription>API connection details for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-semibold mb-2">API Base URL:</p>
              <pre className="bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(API_BASE_URL, null, 2)}
              </pre>
              
              <p className="font-semibold mt-4 mb-2">Task ID:</p>
              <pre className="bg-muted p-2 rounded">{taskId || "None"}</pre>
              
              <p className="font-semibold mt-4 mb-2">Data Debug:</p>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-48">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DashboardContent;
