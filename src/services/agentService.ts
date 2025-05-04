
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
// This is an updated version of the triggerCollectionApi function
// to use the pipeline API instead of the collector API

const triggerCollectionApi = async (dataSource: any) => {
  try {
    console.log("Triggering pipeline API for data source:", dataSource);
    
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

    console.log("Sending payload to pipeline API:", payload);

    // Use the pipeline service instead of collector
    const { data, error } = await runFullAnalysisPipeline(payload);
    
    if (error) {
      console.error("Error from pipeline service:", error);
      throw error;
    }
    
    console.log("Pipeline service response:", data);
    
    // If pipeline was successful, store task IDs in metadata
    if (data?.success && data?.taskIds) {
      // Store task IDs in metadata
      let updatedMetadata = {};
      
      // Only spread if dataSource.metadata is an object
      if (dataSource.metadata && typeof dataSource.metadata === 'object') {
        updatedMetadata = { 
          ...dataSource.metadata, 
          pipeline_task_id: data.taskIds.pipeline,
          collection_task_id: data.taskIds.collection,
          processing_task_id: data.taskIds.processing,
          analysis_task_id: data.taskIds.analysis,
          dashboard_task_id: data.taskIds.dashboard,
          pipeline_started: new Date().toISOString()
        };
      } else {
        updatedMetadata = { 
          pipeline_task_id: data.taskIds.pipeline,
          collection_task_id: data.taskIds.collection,
          processing_task_id: data.taskIds.processing,
          analysis_task_id: data.taskIds.analysis,
          dashboard_task_id: data.taskIds.dashboard,
          pipeline_started: new Date().toISOString()
        };
      }
      
      await supabase
        .from("data_sources")
        .update({ 
          metadata: updatedMetadata,
          status: "completed" // Mark as completed since the pipeline handles all statuses
        })
        .eq("id", dataSource.id);
      
      toast.success(`Analysis pipeline completed for "${dataSource.name}"`);
      return { success: true, taskIds: data.taskIds };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error triggering pipeline API:", error);
    
    // Update status and metadata with error information
    await updateDataSourceStatus(dataSource.id, "error");
    
    let errorMetadata = {};
    
    if (typeof dataSource.metadata === 'object' && dataSource.metadata !== null) {
      errorMetadata = { 
        ...dataSource.metadata, 
        error_message: error.message, 
        error_time: new Date().toISOString() 
      };
    } else {
      errorMetadata = { 
        error_message: error.message, 
        error_time: new Date().toISOString() 
      };
    }
    
    await supabase
      .from("data_sources")
      .update({ metadata: errorMetadata })
      .eq("id", dataSource.id);
    
    toast.error(`Pipeline failed for "${dataSource.name}": ${error.message}`);
    return { success: false, error };
  }
};
