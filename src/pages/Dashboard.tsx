
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import UrlForm from "@/components/UrlForm";
import DataSourceList from "@/components/DataSourceList";
import AnalysisSummary from "@/components/AnalysisSummary";
import StatusCard from "@/components/StatusCard";
import { mockUser, mockProject, mockAnalysisResults } from "@/lib/mockData";
import { toast } from "sonner";
import { getDataSources } from "@/services/agentService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    }
  }, [navigate]);

  const handleAddDataSource = (values: any) => {
    setRefreshTrigger(prev => prev + 1);
    setDialogOpen(false);
  };

  const handleDeleteSource = (sourceId: string) => {
    toast.success("Data source removed successfully");
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRunAnalysis = (sourceId: string) => {
    // This would trigger an analysis in a real app
    console.log(`Running analysis for source ${sourceId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-4 md:p-6 bg-slate-50">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{mockProject.name}</h1>
              <p className="text-muted-foreground">
                Dashboard overview of your feedback analysis
              </p>
            </div>
            <div className="mt-3 md:mt-0">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Data Source</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Data Source</DialogTitle>
                    <DialogDescription>
                      Enter the URL of the forum, website, or survey you want to analyze.
                    </DialogDescription>
                  </DialogHeader>
                  <UrlForm onSubmit={handleAddDataSource} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatusCard 
              title="Total Data Sources" 
              value="..." 
              description="Sources being monitored"
            />
            <StatusCard 
              title="Completed Analyses" 
              value={mockAnalysisResults.length} 
              description="Total analyses performed"
            />
            <StatusCard 
              title="Overall Sentiment" 
              value="Positive" 
              description="Across all sources"
              change={{ value: 12, type: 'increase' }}
            />
            <StatusCard 
              title="Top Theme" 
              value="User Experience" 
              description="Most mentioned topic"
            />
          </div>
          
          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="analyses">Analyses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Data Sources</CardTitle>
                    <CardDescription>Your most recently added data sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataSourceList 
                      refreshTrigger={refreshTrigger}
                      onRunAnalysis={handleRunAnalysis}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("sources")}>
                      View All Sources
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Analysis</CardTitle>
                    <CardDescription>Results from your most recent analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mockAnalysisResults.length > 0 ? (
                      <AnalysisSummary analysisResult={mockAnalysisResults[0]} />
                    ) : (
                      <div className="text-center p-8 border border-dashed rounded-lg">
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No analyses yet</h3>
                        <p className="text-sm text-muted-foreground">Run your first analysis to see results here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sources" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Data Sources</CardTitle>
                      <CardDescription>Manage your feedback collection sources</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">Add Source</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Data Source</DialogTitle>
                          <DialogDescription>
                            Enter the URL of the forum, website, or survey you want to analyze.
                          </DialogDescription>
                        </DialogHeader>
                        <UrlForm onSubmit={(values) => {
                          handleAddDataSource(values);
                          toast.success("Data source added successfully");
                        }} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataSourceList 
                    refreshTrigger={refreshTrigger}
                    onRunAnalysis={handleRunAnalysis}
                    onDelete={handleDeleteSource}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analyses" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>View detailed feedback analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockAnalysisResults.length > 0 ? (
                    <div className="space-y-6">
                      {mockAnalysisResults.map((result) => (
                        <AnalysisSummary key={result.id} analysisResult={result} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No analyses yet</h3>
                      <p className="text-sm text-muted-foreground">Run your first analysis to see results here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
