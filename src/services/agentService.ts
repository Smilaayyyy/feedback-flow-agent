
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendToCollector, checkTaskStatus } from "./collectorService";

export type AgentType = "form" | "social" | "review";
export type DataSourceType = "forum" | "social" | "survey" | "reviews";

export type CollectionStatus = "pending" | "collecting" | "processing" | "analyzing" | "completed" | "error";

// Function to create a new data source and trigger the appropriate collector agent
export const createDataSource = async (
  name: string,
  url: string,
  type: DataSourceType,
  metadata: Record<string, any> = {}
) => {
  try {
    // Validate URL format
    if (!isValidUrl(url, type)) {
      return { 
        data: null, 
        error: new Error(`Invalid URL for ${type} data source. Please check the URL format.`) 
      };
    }
    
    // Insert data source into Supabase
    const { data, error } = await supabase
      .from("data_sources")
      .insert([
        { name, url, type, metadata, project_id: metadata.project_id || null }
      ])
      .select("*, collector_agents(*)");
    
    if (error) throw error;
    
    // Successfully created data source
    const dataSource = data[0];
    
    // Trigger the API endpoint for data collection
    await triggerCollectionApi(dataSource);
    
    return { data: dataSource, error: null };
  } catch (error: any) {
    console.error("Error creating data source:", error);
    toast.error("Failed to create data source");
    return { data: null, error };
  }
};

// Validate URLs based on data source type
const isValidUrl = (url: string, type: DataSourceType): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check for specific platforms based on type
    switch (type) {
      case "social":
        const allowedSocialDomains = [
          "facebook.com", "instagram.com", "reddit.com", "youtube.com", "twitter.com", "x.com", "linkedin.com"
        ];
        return allowedSocialDomains.some(domain => urlObj.hostname.includes(domain));
      
      case "forum":
        // Forums can be on various domains, just ensure it has a valid protocol
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      
      case "reviews":
        const allowedReviewDomains = [
          "trustpilot.com", "yelp.com", "google.com", "tripadvisor.com", "amazon.com"
        ];
        return allowedReviewDomains.some(domain => urlObj.hostname.includes(domain));
      
      case "survey":
        const allowedSurveyDomains = [
          "surveymonkey.com", "typeform.com", "google.com", "forms.office.com", "qualtrics.com"
        ];
        return allowedSurveyDomains.some(domain => urlObj.hostname.includes(domain));
      
      default:
        return true;
    }
  } catch (e) {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
};

// Function to get all data sources
export const getDataSources = async (projectId?: string) => {
  try {
    let query = supabase
      .from("data_sources")
      .select("*, collector_agents(name, type)");
    
    // If project ID is provided, filter by project ID
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
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

// Function to create a new project
export const createProject = async (name: string, description?: string) => {
  try {
    console.log("Creating project:", { name, description });
    
    const { data, error } = await supabase
      .from("projects")
      .insert([
        { name, description }
      ])
      .select();
    
    if (error) {
      console.error("Database error creating project:", error);
      toast.error(`Failed to create project: ${error.message}`);
      throw error;
    }
    
    if (!data || data.length === 0) {
      const noDataError = new Error("No data returned after project creation");
      console.error(noDataError);
      toast.error("Failed to create project: No data returned");
      throw noDataError;
    }
    
    console.log("Project created successfully:", data[0]);
    return { data: data[0], error: null };
  } catch (error: any) {
    console.error("Error creating project:", error);
    toast.error(`Failed to create project: ${error.message || "Unknown error"}`);
    return { data: null, error };
  }
};

// Function to get all projects
export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        data_sources (
          id,
          name,
          type,
          status
        )
      `)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return { data: null, error };
  }
};

// This calls your FastAPI backend for data collection
const triggerCollectionApi = async (dataSource: any) => {
  try {
    // First, update the status to collecting
    await updateDataSourceStatus(dataSource.id, "collecting");
    
    // Create the request payload based on data source type
    const payload = {
      source_id: dataSource.id,
      config: {
        [dataSource.type]: {
          url: dataSource.url,
          ...dataSource.metadata
        }
      }
    };

    // Send data to collector service
    const { data, error } = await sendToCollector(payload, dataSource.type === 'survey');
    
    if (error) throw error;
    
    // If task ID is returned, start polling for status
    if (data?.task_id) {
      // Store task ID in metadata
      await supabase
        .from("data_sources")
        .update({ 
          metadata: { 
            ...dataSource.metadata, 
            task_id: data.task_id 
          } 
        })
        .eq("id", dataSource.id);
      
      // Poll for status every 5 seconds
      const pollIntervalId = setInterval(async () => {
        const { data: statusData } = await checkTaskStatus(data.task_id);
        
        if (statusData) {
          const status = statusData.status;
          
          switch (status) {
            case "collecting":
              await updateDataSourceStatus(dataSource.id, "collecting");
              break;
            case "processing":
              await updateDataSourceStatus(dataSource.id, "processing");
              break;
            case "analyzing":
              await updateDataSourceStatus(dataSource.id, "analyzing");
              break;
            case "completed":
              await updateDataSourceStatus(dataSource.id, "completed");
              clearInterval(pollIntervalId);
              toast.success(`Data collection completed for "${dataSource.name}"`);
              break;
            case "error":
              await updateDataSourceStatus(dataSource.id, "error");
              clearInterval(pollIntervalId);
              toast.error(`Error processing "${dataSource.name}"`);
              break;
          }
        }
      }, 5000);
      
      // Clear interval after 10 minutes (failsafe)
      setTimeout(() => {
        clearInterval(pollIntervalId);
      }, 600000);
      
      return { success: true, task_id: data.task_id };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error triggering API collection:", error);
    await updateDataSourceStatus(dataSource.id, "error");
    return { success: false };
  }
};

// For development only: Simulates the collection process
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
