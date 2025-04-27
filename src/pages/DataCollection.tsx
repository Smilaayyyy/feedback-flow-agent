
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import UrlForm from "@/components/UrlForm";
import { mockUser } from "@/lib/mockData";
import { toast } from "sonner";
import { DataSource } from "@/lib/types";

const DataCollection = () => {
  const [activeTab, setActiveTab] = useState("forums");

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
              <Tabs defaultValue="forums" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 gap-4 mb-6">
                  <TabsTrigger value="forums">Forums</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="reviews">Review Sites</TabsTrigger>
                  <TabsTrigger value="surveys">Surveys</TabsTrigger>
                </TabsList>

                <TabsContent value="forums" className="mt-0">
                  <UrlForm onSubmit={handleSubmit} />
                </TabsContent>
                
                <TabsContent value="social" className="mt-0">
                  <UrlForm onSubmit={handleSubmit} />
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-0">
                  <UrlForm onSubmit={handleSubmit} />
                </TabsContent>
                
                <TabsContent value="surveys" className="mt-0">
                  <UrlForm onSubmit={handleSubmit} />
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
