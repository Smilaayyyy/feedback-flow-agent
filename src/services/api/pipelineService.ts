
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";
import { checkTaskStatus, TaskStatusResponse } from "./taskService";

// Define interface for pipeline response
interface PipelineResponse {
  task_id: string;
  status: string;
  message?: string;
  [key: string]: any;
}

// Function to run the entire pipeline from collection to dashboard via a single API endpoint
export const runFullAnalysisPipeline = async (sourceData: {
  source_id: string;
  config: Record<string, any>;
}) => {
  try {
    // Call the unified pipeline endpoint
    toast.info("Starting analysis pipeline...");
    const { data: pipelineData, error: pipelineError } = await apiRequest<PipelineResponse>('/api/v1/pipeline', {
      method: "POST",
      body: JSON.stringify(sourceData)
    });
    
    if (pipelineError) throw pipelineError;
    
    // Get the main pipeline task ID
    const pipelineTaskId = pipelineData?.task_id;
    if (!pipelineTaskId) throw new Error("No task ID returned from pipeline");
    
    // Poll for pipeline status
    let pipelineStatus = "pending";
    const taskIds = {
      pipeline: pipelineTaskId,
      collection: null,
      processing: null, 
      analysis: null,
      dashboard: null
    };
    
    // Function to update UI based on pipeline stage
    const updateStageStatus = (stage: string, taskId: string | null) => {
      if (taskId) {
        taskIds[stage] = taskId;
        toast.info(`${capitalizeFirstLetter(stage)} stage started`);
      }
    };
    
    // Poll for status and update UI
    while (pipelineStatus !== "completed" && pipelineStatus !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      const { data: statusData } = await checkTaskStatus(pipelineTaskId);
      const response = statusData as TaskStatusResponse;
      
      pipelineStatus = response?.status || "pending";
      
      // Update UI based on current stage
      if (response?.current_stage) {
        switch (response.current_stage) {
          case "collection":
            updateStageStatus("collection", response.collection_task_id);
            break;
          case "processing":
            updateStageStatus("processing", response.processing_task_id);
            break;
          case "analysis":
            updateStageStatus("analysis", response.analysis_task_id);
            break;
          case "dashboard":
            updateStageStatus("dashboard", response.dashboard_task_id);
            break;
        }
      }
      
      // Check for completion or failure
      if (response?.status === "completed") {
        toast.success("Analysis pipeline completed successfully");
        
        // Get all task IDs from the final response
        if (response.collection_task_id) taskIds.collection = response.collection_task_id;
        if (response.processing_task_id) taskIds.processing = response.processing_task_id;
        if (response.analysis_task_id) taskIds.analysis = response.analysis_task_id;
        if (response.dashboard_task_id) taskIds.dashboard = response.dashboard_task_id;
        
        break;
      }
      
      if (response?.status === "failed" || response?.status === "error") {
        throw new Error(`Pipeline failed: ${response.message || "Unknown error"}`);
      }
    }
    
    return {
      success: true,
      taskIds
    };
    
  } catch (error: any) {
    console.error("Error in analysis pipeline:", error);
    toast.error(`Analysis pipeline failed: ${error.message}`);
    return { success: false, error };
  }
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
