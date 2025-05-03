
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import DataSourceList from "@/components/DataSourceList";
import DashboardContent from "@/components/DashboardContent";
import { mockUser } from "@/lib/mockData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getDataSources } from "@/services/agentService";
import { ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Your Project");
  const [dataSourceCount, setDataSourceCount] = useState(0);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | null>(null);

  useEffect(() => {
    // Check for project ID in query parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('projectId');
    
    if (id) {
      setProjectId(id);
      loadProjectDetails(id);
    } else {
      // If no project ID, redirect to projects page
      toast.error("No project selected");
      navigate("/projects");
    }
  }, [location.search, navigate]);

  // Subscribe to real-time updates for data sources
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_sources'
        },
        () => {
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();   

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProjectDetails = async (id: string) => {
    try {
      // Get project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("name")
        .eq("id", id)
        .single();
        
      if (projectError) throw projectError;
      if (projectData) {
        setProjectName(projectData.name);
      }
      
      // Get data source count
      const { data: sourceData, error: sourceError } = await getDataSources(id);
      
      if (sourceError) throw sourceError;
      if (sourceData) {
        setDataSourceCount(sourceData.length);
      }
    } catch (error) {
      console.error("Error loading project details:", error);
      toast.error("Failed to load project details");
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from("data_sources")
        .delete()
        .eq("id", sourceId);
      
      if (error) throw error;
      
      toast.success("Data source removed successfully");
      setRefreshTrigger(prev => prev + 1);
      
      // Update data source count
      const { data } = await getDataSources(projectId || undefined);
      if (data) {
        setDataSourceCount(data.length);
      }
    } catch (error) {
      console.error("Error deleting data source:", error);
      toast.error("Failed to delete data source");
    }
  };

  const handleViewDashboard = (sourceId: string) => {
    setSelectedDataSourceId(sourceId);
    setActiveTab("dashboard");
  };

  const handleAddDataSource = () => {
    navigate(`/data-collection?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-4 md:p-6 bg-slate-50">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{projectName}</h1>
                <p className="text-muted-foreground">
                  Dashboard overview of your feedback analysis
                </p>
              </div>
              <div className="mt-3 md:mt-0">
                <Button onClick={handleAddDataSource}>
                  Add Data Source
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="sources" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sources" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Data Sources</CardTitle>
                      <CardDescription>Manage your feedback collection sources</CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddDataSource}>Add Source</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataSourceList 
                    refreshTrigger={refreshTrigger}
                    onRunAnalysis={handleViewDashboard}
                    onDelete={handleDeleteSource}
                    projectId={projectId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dashboard" className="animate-fade-in">
              <DashboardContent
                projectId={projectId}
                dataSourceId={selectedDataSourceId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
