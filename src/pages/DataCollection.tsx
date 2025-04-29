
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { mockUser } from "@/lib/mockData";
import { DataSourceForm } from "@/components/forms/DataSourceForm";
import { SocialSourceForm } from "@/components/forms/SocialSourceForm";
import { ReviewSourceForm } from "@/components/forms/ReviewSourceForm";
import UrlForm from "@/components/UrlForm";
import DataSourceList from "@/components/DataSourceList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DataCollection = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    // Form submission is now handled in the UrlForm component
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRunAnalysis = (sourceId: string) => {
    console.log("Running analysis for source:", sourceId);
    // In a real app, this would trigger an analysis process
    toast.success("Analysis completed successfully!");
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
            <h1 className="text-2xl font-bold">Data Collection</h1>
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
                  <TabsList className="grid grid-cols-4 gap-4 mb-6">
                    <TabsTrigger value="url">URL / Website</TabsTrigger>
                    <TabsTrigger value="data">Forms & Surveys</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="reviews">Review Sites</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="mt-0">
                    <UrlForm onSubmit={handleSubmit} />
                  </TabsContent>

                  <TabsContent value="data" className="mt-0">
                    <DataSourceForm onSubmit={handleSubmit} />
                  </TabsContent>
                  
                  <TabsContent value="social" className="mt-0">
                    <SocialSourceForm onSubmit={handleSubmit} />
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-0">
                    <ReviewSourceForm onSubmit={handleSubmit} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Data Sources</CardTitle>
                <CardDescription>
                  View and manage your data collection sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataSourceList 
                  onRunAnalysis={handleRunAnalysis}
                  onDelete={handleDelete}
                  refreshTrigger={refreshTrigger}
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
