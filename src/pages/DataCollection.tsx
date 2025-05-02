
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { mockUser } from "@/lib/mockData";
import { DataSourceForm } from "@/components/forms/DataSourceForm";
import { SocialSourceForm } from "@/components/forms/SocialSourceForm";
import { ReviewSourceForm } from "@/components/forms/ReviewSourceForm";
import DataSourceList from "@/components/DataSourceList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const DataCollection = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get project ID from URL query parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('projectId');
    const name = params.get('projectName');
    
    if (id) {
      setProjectId(id);
      setProjectName(name ? decodeURIComponent(name) : "Your Project");
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
          // When data changes, increment the refresh trigger
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();   

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = (values: any) => {
    console.log("Collection initiated with values:", values);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRunAnalysis = (sourceId: string) => {
    console.log("Running analysis for source:", sourceId);
    // In a real app, this would trigger an analysis process via your FastAPI endpoint
    toast.success("Analysis request submitted!");
  };

  const handleDelete = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from("data_sources")
        .delete()
        .eq("id", sourceId);
      
      if (error) throw error;
      
      toast.success("Data source removed successfully!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting data source:", error);
      toast.error("Failed to delete data source");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="container max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
            <h1 className="text-2xl font-bold">{projectName || "Data Collection"}</h1>
            <p className="text-muted-foreground">Configure and monitor your data sources</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Data Source</CardTitle>
                <CardDescription>
                  Set up a new data source for collecting feedback and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="data" className="w-full">
                  <TabsList className="grid grid-cols-3 gap-4 mb-6">
                    <TabsTrigger value="data">Forms & Surveys</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="reviews">Review Sites</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="data" className="mt-0">
                    <DataSourceForm 
                      onSubmit={handleSubmit} 
                      projectId={projectId} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="social" className="mt-0">
                    <SocialSourceForm 
                      onSubmit={handleSubmit} 
                      projectId={projectId}
                    />
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-0">
                    <ReviewSourceForm 
                      onSubmit={handleSubmit}
                      projectId={projectId}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Data Sources</CardTitle>
                <CardDescription>
                  View and manage your data collection sources for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataSourceList 
                  onRunAnalysis={handleRunAnalysis}
                  onDelete={handleDelete}
                  refreshTrigger={refreshTrigger}
                  projectId={projectId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataCollection;
