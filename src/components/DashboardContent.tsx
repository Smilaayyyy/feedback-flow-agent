
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusCard from "@/components/StatusCard";
import { fetchDashboardData, fetchReportData } from "@/services/api/dashboardService";
import { checkTaskStatus } from "@/services/api/taskService"; // Added the missing import
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/api/baseApiService";
import { Button } from "@/components/ui/button";

type DashboardProps = {
  projectId: string | null;
  dataSourceId?: string | null;
};

export function DashboardContent({ projectId, dataSourceId }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardHtml, setDashboardHtml] = useState<string | null>(null);
  const [kpis, setKpis] = useState<any[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [requestsLog, setRequestsLog] = useState<string[]>([]);

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

  const addRequestLog = (message: string) => {
    setRequestsLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const getDataSourceDetails = async (sourceId: string) => {
    setIsLoading(true);
    addRequestLog(`Fetching data source details for ID: ${sourceId}`);
    
    try {
      console.log("Fetching data source details for id:", sourceId);
      const { data, error } = await supabase
        .from("data_sources")
        .select("metadata, status")
        .eq("id", sourceId)
        .single();
      
      if (error) {
        console.error("Error fetching data source:", error);
        addRequestLog(`Error fetching data source: ${error.message}`);
        throw error;
      }
      
      console.log("Data source details retrieved:", data);
      setDebugInfo({ dataSource: data });
      addRequestLog(`Data source details retrieved with status: ${data.status}`);
      
      // Safely extract task_id and dashboard_url from metadata
      const metadataObj = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata;
      
      const taskId = metadataObj?.task_id || metadataObj?.pipeline_task_id;
      const dashboardUrl = metadataObj?.dashboard_url;
      
      console.log("Extracted task_id:", taskId);
      console.log("Extracted dashboard_url:", dashboardUrl);
      addRequestLog(`Extracted task_id: ${taskId}`);
      addRequestLog(`Extracted dashboard_url: ${dashboardUrl || 'none'}`);
      
      if (data && data.status === "completed") {
        if (dashboardUrl) {
          // If we have a dashboard URL, fetch directly from there
          setDashboardUrl(dashboardUrl);
          setTaskId(taskId);
          loadDashboardFromUrl(dashboardUrl);
        } else if (taskId) {
          // Otherwise use task ID to fetch dashboard
          setTaskId(taskId);
          loadDashboardData(taskId);
        } else {
          setIsLoading(false);
          setDashboardHtml("<div>No dashboard data available. Missing task ID and dashboard URL.</div>");
          addRequestLog(`Missing task ID and dashboard URL in metadata`);
          toast.error("Missing task ID and dashboard URL in metadata");
        }
      } else {
        setIsLoading(false);
        setDashboardHtml("<div>No dashboard data available yet. Status: " + data.status + "</div>");
        addRequestLog(`Data source not ready. Status: ${data.status}`);
        toast.info(`Data source status: ${data.status}. Dashboard will be available once collection is completed.`);
      }
    } catch (error: any) {
      console.error("Error fetching data source details:", error);
      addRequestLog(`Error fetching data source details: ${error.message}`);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard data. Please check console for details.</div>");
      toast.error("Failed to load dashboard data");
    }
  };

  const getLatestCompletedDataSource = async (projId: string) => {
    setIsLoading(true);
    addRequestLog(`Fetching latest completed data source for project: ${projId}`);
    
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
        addRequestLog(`Error fetching data sources: ${error.message}`);
        throw error;
      }
      
      console.log("Latest completed data source:", data);
      setDebugInfo({ latestDataSource: data });
      addRequestLog(`Found ${data?.length || 0} completed data sources`);
      
      if (data && data.length > 0) {
        // Safely extract task_id from metadata
        const metadataObj = typeof data[0].metadata === 'string' 
          ? JSON.parse(data[0].metadata) 
          : data[0].metadata;
        
        const taskId = metadataObj?.task_id;
        console.log("Extracted task_id:", taskId);
        addRequestLog(`Extracted task_id: ${taskId}`);
        
        if (taskId) {
          setTaskId(taskId);
          loadDashboardData(taskId);
        } else {
          setIsLoading(false);
          setDashboardHtml("<div>No task ID found in the completed data source.</div>");
          addRequestLog("No task ID found in the completed data source");
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
          addRequestLog(`Found ${allSources.length} data sources, but none completed`);
          setIsLoading(false);
          setDashboardHtml(`<div>You have ${allSources.length} data source(s), but none are completed yet. Current statuses: ${allSources.map(s => s.status).join(', ')}.</div>`);
          toast.info("No completed data sources found. Please wait for data collection to complete.");
        } else {
          setIsLoading(false);
          setDashboardHtml("<div>No data sources found for this project.</div>");
          addRequestLog("No data sources found for this project");
          toast.info("No data sources found for this project");
        }
      }
    } catch (error: any) {
      console.error("Error fetching latest completed data source:", error);
      addRequestLog(`Error: ${error.message}`);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard data. Please check console for details.</div>");
      toast.error("Failed to load dashboard data");
    }
  };

  // New function to load dashboard directly from URL
  const loadDashboardFromUrl = async (url: string) => {
    try {
      addRequestLog(`Loading dashboard directly from URL: ${url}`);
      
      // Check if URL is absolute or relative
      const dashboardEndpoint = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      
      addRequestLog(`Fetching dashboard HTML from: ${dashboardEndpoint}`);
      
      const response = await fetch(dashboardEndpoint);
      
      if (!response.ok) {
        const errorText = await response.text();
        addRequestLog(`Error fetching dashboard HTML: ${errorText}`);
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        addRequestLog(`Received dashboard HTML content (${html.length} characters)`);
        setDashboardHtml(html);
      } else {
        // Try to get JSON for KPIs
        try {
          const json = await response.json();
          addRequestLog(`Received JSON response instead of HTML`);
          
          if (json.html) {
            setDashboardHtml(json.html);
          }
          
          if (json.kpis) {
            setKpis(json.kpis);
          }
          
          setDebugInfo(prev => ({ ...prev, dashboardData: json }));
        } catch (e) {
          addRequestLog(`Response is not HTML or valid JSON`);
          const text = await response.text();
          setDashboardHtml(`<div>${text}</div>`);
        }
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading dashboard from URL:", error);
      addRequestLog(`Error loading dashboard from URL: ${error.message}`);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard from URL. Please check console for details.</div>");
      toast.error("Failed to load dashboard from URL");
    }
  };

  const loadDashboardData = async (tid: string) => {
    try {
      console.log("Loading dashboard data for task:", tid);
      addRequestLog(`Loading dashboard data for task: ${tid}`);
      
      // Check if task has dashboard URL
      const { data: statusData } = await checkTaskStatus(tid);
      if (statusData?.dashboard_url) {
        addRequestLog(`Found dashboard URL in task status: ${statusData.dashboard_url}`);
        setDashboardUrl(statusData.dashboard_url);
        return loadDashboardFromUrl(statusData.dashboard_url);
      }
      
      // If no dashboard URL, fall back to fetching dashboard HTML content
      addRequestLog(`Fetching dashboard HTML content from /api/v1/dashboard/${tid}/html`);
      const { data: dashboardData, error: dashboardError } = await fetchDashboardData(tid);
      
      if (dashboardError) {
        console.error("Dashboard data error:", dashboardError);
        addRequestLog(`Dashboard data error: ${dashboardError.message}`);
        throw dashboardError;
      }
      
      console.log("Dashboard data response:", dashboardData);
      setDebugInfo(prev => ({ ...prev, dashboardData }));
      
      if (dashboardData?.html) {
        addRequestLog(`Received dashboard HTML content (${dashboardData.html.length} characters)`);
        setDashboardHtml(dashboardData.html);
      } else {
        addRequestLog("No HTML content available in dashboard response");
        setDashboardHtml("<div>No HTML content available in dashboard response</div>");
      }
      
      // Fetch KPIs and report data
      addRequestLog(`Fetching report data from /api/v1/report/${tid}`);
      const { data: reportData, error: reportError } = await fetchReportData(tid);
      
      if (reportError) {
        console.error("Report data error:", reportError);
        addRequestLog(`Report data error: ${reportError.message}`);
        throw reportError;
      }
      
      console.log("Report data response:", reportData);
      setDebugInfo(prev => ({ ...prev, reportData }));
      
      if (reportData?.kpis) {
        addRequestLog(`Received ${reportData.kpis.length} KPIs from report data`);
        setKpis(reportData.kpis);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      addRequestLog(`Error loading dashboard data: ${error.message}`);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard content. Please check console for details.</div>");
      toast.error("Failed to load dashboard content");
    }
  };

  const refreshDashboard = () => {
    addRequestLog("Manually refreshing dashboard data");
    if (dashboardUrl) {
      setIsLoading(true);
      loadDashboardFromUrl(dashboardUrl);
    } else if (taskId) {
      setIsLoading(true);
      loadDashboardData(taskId);
    } else if (dataSourceId) {
      setIsLoading(true);
      getDataSourceDetails(dataSourceId);
    } else if (projectId) {
      setIsLoading(true);
      getLatestCompletedDataSource(projectId);
    } else {
      toast.error("No data to refresh");
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
              <Button 
                variant="outline"
                size="sm"
                onClick={refreshDashboard}
                className="mt-3"
              >
                Refresh Data
              </Button>
            </div>
          )}
        </div>
        
        <Card className="border-dashed border-amber-300">
          <CardHeader>
            <CardTitle className="text-amber-600">API Information</CardTitle>
            <CardDescription>Details about the API connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-3">
              <div>
                <p className="font-semibold">API Base URL:</p>
                <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">{API_BASE_URL}</pre>
              </div>
              
              <div>
                <p className="font-semibold">Request Log:</p>
                <div className="max-h-48 overflow-y-auto bg-muted rounded p-2 mt-1">
                  {requestsLog.length > 0 ? (
                    <ul className="text-xs space-y-1">
                      {requestsLog.map((log, i) => (
                        <li key={i}>{log}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No requests logged</p>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={refreshDashboard} size="sm" variant="outline">
                  Retry Dashboard Load
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          onClick={refreshDashboard}
        >
          Refresh Dashboard
        </Button>
      </div>
      
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
            
            {dashboardUrl && (
              <>
                <p className="font-semibold mt-4 mb-2">Dashboard URL:</p>
                <pre className="bg-muted p-2 rounded">{dashboardUrl}</pre>
              </>
            )}
            
            <p className="font-semibold mt-4 mb-2">Request Log:</p>
            <div className="max-h-48 overflow-y-auto bg-muted rounded p-2 mt-1">
              {requestsLog.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {requestsLog.map((log, i) => (
                    <li key={i}>{log}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No requests logged</p>
              )}
            </div>
            
            <p className="font-semibold mt-4 mb-2">Data Debug:</p>
            <pre className="bg-muted p-2 rounded overflow-auto max-h-48">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardContent;
