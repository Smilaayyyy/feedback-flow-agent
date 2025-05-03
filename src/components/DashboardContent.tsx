
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusCard from "@/components/StatusCard";
import { fetchDashboardData, fetchReportData } from "@/services/collectorService";
import { supabase } from "@/integrations/supabase/client";

type DashboardProps = {
  projectId: string | null;
  dataSourceId?: string | null;
};

export function DashboardContent({ projectId, dataSourceId }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardHtml, setDashboardHtml] = useState<string | null>(null);
  const [kpis, setKpis] = useState<any[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (dataSourceId) {
      getDataSourceDetails(dataSourceId);
    } else if (projectId) {
      getLatestCompletedDataSource(projectId);
    }
  }, [projectId, dataSourceId]);

  const getDataSourceDetails = async (sourceId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("data_sources")
        .select("metadata, status")
        .eq("id", sourceId)
        .single();
      
      if (error) throw error;
      
      // Safely extract task_id from metadata
      const metadataObj = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata;
      
      const taskId = metadataObj?.task_id;
      
      if (data && data.status === "completed" && taskId) {
        setTaskId(taskId);
        loadDashboardData(taskId);
      } else {
        setIsLoading(false);
        setDashboardHtml("<div>No dashboard data available yet.</div>");
      }
    } catch (error) {
      console.error("Error fetching data source details:", error);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard data.</div>");
    }
  };

  const getLatestCompletedDataSource = async (projId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("data_sources")
        .select("id, metadata, status")
        .eq("project_id", projId)
        .eq("status", "completed")
        .order("last_updated", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Safely extract task_id from metadata
        const metadataObj = typeof data[0].metadata === 'string' 
          ? JSON.parse(data[0].metadata) 
          : data[0].metadata;
        
        const taskId = metadataObj?.task_id;
        
        if (taskId) {
          setTaskId(taskId);
          loadDashboardData(taskId);
        } else {
          setIsLoading(false);
          setDashboardHtml("<div>No completed data sources found.</div>");
        }
      } else {
        setIsLoading(false);
        setDashboardHtml("<div>No completed data sources found.</div>");
      }
    } catch (error) {
      console.error("Error fetching latest completed data source:", error);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard data.</div>");
    }
  };

  const loadDashboardData = async (tid: string) => {
    try {
      // Fetch dashboard HTML content
      const { data: dashboardData, error: dashboardError } = await fetchDashboardData(tid);
      
      if (dashboardError) throw dashboardError;
      
      if (dashboardData?.html) {
        setDashboardHtml(dashboardData.html);
      }
      
      // Fetch KPIs and report data
      const { data: reportData, error: reportError } = await fetchReportData(tid);
      
      if (reportError) throw reportError;
      
      if (reportData?.kpis) {
        setKpis(reportData.kpis);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsLoading(false);
      setDashboardHtml("<div>Error loading dashboard content.</div>");
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
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-4">No dashboard data available</h3>
        <p className="text-muted-foreground">
          Complete data collection to view dashboard insights.
        </p>
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
    </div>
  );
}

export default DashboardContent;
