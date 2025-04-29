
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AgentType = "form" | "social" | "review";
export type DataSourceType = "forum" | "social" | "reviews" | "survey";

export type CollectionStatus = "pending" | "collecting" | "processing" | "analyzing" | "completed" | "error";

// Function to create a new data source and trigger the appropriate collector agent
export const createDataSource = async (
  name: string,
  url: string,
  type: DataSourceType,
  metadata: Record<string, any> = {}
) => {
  try {
    // Insert data source into Supabase
    const { data, error } = await supabase
      .from("data_sources")
      .insert([
        { name, url, type, metadata }
      ])
      .select("*, collector_agents(*)");
    
    if (error) throw error;
    
    // Successfully created data source
    const dataSource = data[0];
    
    // Simulate starting the collector agent
    // In a production app, this might trigger a serverless function or webhook
    await simulateAgentProcess(dataSource);
    
    return { data: dataSource, error: null };
  } catch (error: any) {
    console.error("Error creating data source:", error);
    toast.error("Failed to create data source");
    return { data: null, error };
  }
};

// Function to get all data sources
export const getDataSources = async () => {
  try {
    const { data, error } = await supabase
      .from("data_sources")
      .select("*, collector_agents(name, type)")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching data sources:", error);
    return { data: null, error };
  }
};

// Function to update data source status
export const updateDataSourceStatus = async (id: string, status: CollectionStatus) => {
  try {
    const { data, error } = await supabase
      .from("data_sources")
      .update({ status })
      .eq("id", id)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating data source status:", error);
    return { data: null, error };
  }
};

// This simulates the collection process - in a real app this would be done by a backend service
const simulateAgentProcess = async (dataSource: any) => {
  // Update status to collecting
  await updateDataSourceStatus(dataSource.id, "collecting");
  
  // Simulate collection process (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update status to processing
  await updateDataSourceStatus(dataSource.id, "processing");
  
  // Simulate processing (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update status to analyzing
  await updateDataSourceStatus(dataSource.id, "analyzing");
  
  // Simulate analysis (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update status to completed
  await updateDataSourceStatus(dataSource.id, "completed");
  
  // Notify user of completion
  toast.success(`Data collection completed for "${dataSource.name}"`);
};
