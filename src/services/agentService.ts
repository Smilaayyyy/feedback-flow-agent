
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    const { data, error } = await supabase
      .from("projects")
      .insert([
        { name, description }
      ])
      .select();
    
    if (error) throw error;
    
    return { data: data[0], error: null };
  } catch (error: any) {
    console.error("Error creating project:", error);
    toast.error("Failed to create project");
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
    
    // In a production environment, this would call your FastAPI endpoint
    // For demonstration, we'll simulate the API call with a timeout
    
    // Example API call structure:
    /*
    const response = await fetch('http://your-api-url/api/v1/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          social: {
            platform: dataSource.metadata?.platform || 'Twitter',
            hashtags: dataSource.metadata?.hashtags || [],
          },
          review: {
            websites: [dataSource.metadata?.platform || 'Google'],
          },
          survey: {
            form_id: dataSource.id,
            api_endpoints: [dataSource.url],
          }
        }
      }),
    });
    
    const responseData = await response.json();
    */
    
    // For now, just simulate the collection process
    await simulateAgentProcess(dataSource);
    
    return { success: true };
  } catch (error) {
    console.error("Error triggering API collection:", error);
    await updateDataSourceStatus(dataSource.id, "error");
    return { success: false };
  }
};

// This simulates the collection process - in a real app this would be done by your FastAPI backend
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
