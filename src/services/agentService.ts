
// src/services/agentService.ts
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  sendToCollector, 
  checkTaskStatus, 
  processCollectedData,
  analyzeProcessedData,
  generateDashboard,
  runFullAnalysisPipeline
} from "./api";
import { CollectionStatus, TaskStatusResponse } from "./api/taskService";

export type AgentType = "form" | "social" | "review";
export type DataSourceType = "forum" | "website" | "social" | "survey" | "reviews";
export type { CollectionStatus } from "./api/taskService";

// Function to create a new data source and trigger the appropriate collector agent
export const createDataSource = async (
  name: string,
  url: string,
  type: DataSourceType,
  metadata: Record<string, any> = {},
  projectId?: string
) => {
  try {
    console.log("Creating data source:", { name, url, type, projectId, metadata });
    
    // Validate URL format
    if (!isValidUrl(url, type)) {
      return { 
        data: null, 
        error: new Error(`Invalid URL for ${type} data source. Please check the URL format.`) 
      };
    }
    
    // Prepare full metadata with project ID
    const fullMetadata = {
      ...metadata,
      project_id: projectId || metadata.project_id
    };
    
    // Insert data source into Supabase
    const { data, error } = await supabase
      .from("data_sources")
      .insert([
        { 
          name, 
          url, 
          type, 
          metadata: fullMetadata, 
          project_id: projectId || metadata.project_id,
          status: "pending" 
        }
      ])
      .select();
    
    if (error) {
      console.error("Supabase error creating data source:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after data source creation");
    }
    
    // Successfully created data source
    const dataSource = data[0];
    console.log("Data source created:", dataSource);
    toast.success(`Data source "${name}" created successfully`);
    
    // Trigger the API endpoint for data collection
    const triggerResult = await triggerCollectionApi(dataSource);
    console.log("Trigger result:", triggerResult);
    
    return { data: dataSource, error: null };
  } catch (error: any) {
    console.error("Error creating data source:", error);
    toast.error(`Failed to create data source: ${error.message}`);
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
      
      case "website":
        // Websites should have valid HTTP/HTTPS protocol
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
        return allowedSurveyDomains.some(domain => urlObj.hostname.includes(domain)) || 
               (urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
      
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
      .select("*");
    
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
      .update({ 
        status,
        last_updated: new Date().toISOString()  
      })
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
    toast.success(`Project "${name}" created successfully`);
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
          status,
          last_updated
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

// Function to get a single project by ID with its data sources
export const getProjectById = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        data_sources (
          id,
          name,
          url,
          type,
          status,
          last_updated,
          metadata
        )
      `)
      .eq("id", projectId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    return { data: null, error };
  }
};

// This calls your FastAPI backend for data collection
const triggerCollectionApi = async (dataSource: any) => {
  try {
    console.log("Triggering collection API for data source:", dataSource);
    
    // First, update the status to collecting
    await updateDataSourceStatus(dataSource.id, "collecting");
    
    // Create the request payload based on data source type
    const payload = {
      source_id: dataSource.id,
      config: {
        [dataSource.type]: {
          url: dataSource.url,
          ...(dataSource.metadata || {})
        }
      }
    };

    console.log("Sending payload to collector:", payload);

    // Send data to collector service
    const { data, error } = await sendToCollector(payload, dataSource.type === 'survey');
    
    if (error) {
      console.error("Error from collector service:", error);
      throw error;
    }
    
    console.log("Collector service response:", data);
    
    // If task ID is returned, start polling for status
    if (data?.task_id) {
      // Store task ID in metadata
      // Create a proper object for updatedMetadata
      const updatedMetadata = dataSource.metadata ? 
        { ...Object.assign({}, dataSource.metadata), task_id: data.task_id } :
        { task_id: data.task_id };
      
      await supabase
        .from("data_sources")
        .update({ metadata: updatedMetadata })
        .eq("id", dataSource.id);
      
      console.log("Starting poll for task status with ID:", data.task_id);
      
      // Poll for status every 5 seconds
      const pollIntervalId = setInterval(async () => {
        console.log("Polling task status for:", data.task_id);
        const { data: statusData, error: statusError } = await checkTaskStatus(data.task_id);
        
        if (statusError) {
          console.error("Error checking task status:", statusError);
          // If there's an error checking status, don't update the status yet
          return;
        }
        
        console.log("Task status data:", statusData);
        
        if (statusData) {
          const response = statusData as TaskStatusResponse;
          const status = response.status;
          
          // Update metadata with latest task status
          const updatedTaskMetadata = updatedMetadata ? 
            { ...Object.assign({}, updatedMetadata), task_status: status, task_updated: new Date().toISOString() } : 
            { task_status: status, task_updated: new Date().toISOString() };
          
          console.log("Task status:", status);
          
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
              
              // Store final results in metadata
              const finalMetadata = updatedTaskMetadata ? 
                { ...Object.assign({}, updatedTaskMetadata), sources: response.sources, completion_time: new Date().toISOString() } : 
                { sources: response.sources, completion_time: new Date().toISOString() };
              
              await supabase
                .from("data_sources")
                .update({ metadata: finalMetadata })
                .eq("id", dataSource.id);
                
              clearInterval(pollIntervalId);
              toast.success(`Data collection completed for "${dataSource.name}"`);
              break;
            case "error":
              await updateDataSourceStatus(dataSource.id, "error");
              
              // Store error information
              const errorMetadata = updatedTaskMetadata ? 
                { ...Object.assign({}, updatedTaskMetadata), error_message: response.message, error_time: new Date().toISOString() } : 
                { error_message: response.message, error_time: new Date().toISOString() };
              
              await supabase
                .from("data_sources")
                .update({ metadata: errorMetadata })
                .eq("id", dataSource.id);
                
              clearInterval(pollIntervalId);
              toast.error(`Error processing "${dataSource.name}": ${response.message}`);
              break;
            default:
              // For any other status, just update the metadata
              await supabase
                .from("data_sources")
                .update({ metadata: updatedTaskMetadata })
                .eq("id", dataSource.id);
          }
        }
      }, 5000);
      
      // Clear interval after 10 minutes (failsafe)
      setTimeout(() => {
        clearInterval(pollIntervalId);
        // Check if status is still not completed or error
        checkTaskStatus(data.task_id).then(async ({ data: finalStatus }) => {
          const response = finalStatus as TaskStatusResponse;
          if (response && (response.status !== "completed" && response.status !== "error")) {
            // If still not completed after timeout, mark as error
            await updateDataSourceStatus(dataSource.id, "error");
            
            const timeoutMetadata = updatedMetadata ? 
              { ...Object.assign({}, updatedMetadata), error_message: "Collection timed out after 10 minutes", error_time: new Date().toISOString() } : 
              { error_message: "Collection timed out after 10 minutes", error_time: new Date().toISOString() };
            
            await supabase
              .from("data_sources")
              .update({ metadata: timeoutMetadata })
              .eq("id", dataSource.id);
              
            toast.error(`Data collection timed out for "${dataSource.name}"`);
          }
        });
      }, 600000);
      
      return { success: true, task_id: data.task_id };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error triggering API collection:", error);
    
    // Update status and metadata with error information
    await updateDataSourceStatus(dataSource.id, "error");
    
    const errorMetadata = typeof dataSource.metadata === 'object' ? 
      { ...Object.assign({}, dataSource.metadata), error_message: error.message, error_time: new Date().toISOString() } : 
      { error_message: error.message, error_time: new Date().toISOString() };
    
    await supabase
      .from("data_sources")
      .update({ metadata: errorMetadata })
      .eq("id", dataSource.id);
    
    toast.error(`Failed to collect data for "${dataSource.name}": ${error.message}`);
    return { success: false, error };
  }
};

// Function to run the complete analysis pipeline on a data source
export const runAnalysisPipeline = async (dataSourceId: string) => {
  try {
    // First, get the data source details
    const { data: dataSource, error: fetchError } = await supabase
      .from("data_sources")
      .select("*")
      .eq("id", dataSourceId)
      .single();
    
    if (fetchError) throw fetchError;
    if (!dataSource) throw new Error("Data source not found");
    
    // Run the full analysis pipeline
    const result = await runFullAnalysisPipeline({
      source_id: dataSourceId,
      config: {
        [dataSource.type]: {
          url: dataSource.url,
          ...dataSource.metadata
        }
      }
    });
    
    if (!result.success) {
      throw new Error(result.error?.message || "Pipeline failed");
    }
    
    // Update the data source with success information
    const updatedMetadata = {
      ...dataSource.metadata,
      pipeline_success: true,
      task_ids: result.taskIds,
      pipeline_completed: new Date().toISOString()
    };
    
    await supabase
      .from("data_sources")
      .update({ 
        metadata: updatedMetadata,
        status: "completed"
      })
      .eq("id", dataSourceId);
    
    return { success: true, taskIds: result.taskIds };
  } catch (error: any) {
    console.error("Error running analysis pipeline:", error);
    toast.error(`Analysis pipeline failed: ${error.message}`);
    return { success: false, error };
  }
};

