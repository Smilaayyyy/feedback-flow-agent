
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { mockUser } from "@/lib/mockData";
import { DataSourceForm } from "@/components/forms/DataSourceForm";
import { SocialSourceForm } from "@/components/forms/SocialSourceForm";
import { ReviewSourceForm } from "@/components/forms/ReviewSourceForm";

const DataCollection = () => {
  const handleSubmit = (values: any) => {
    console.log("Collection initiated with values:", values);
    // In a real app, this would send the data to your collection agent
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
        </div>
      </main>
    </div>
  );
};

export default DataCollection;
