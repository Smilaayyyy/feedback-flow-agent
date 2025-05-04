
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";

// Interface for pipeline response
interface PipelineResponse {
  task_id: string;
  status: string;
  message?: string;
  dashboard_url?: string;
  [key: string]: any;
}

// Function to run the entire analysis pipeline
export const runAnalysisPipeline = async (sourceData: {
  source_id: string;
  config: Record<string, any>;
}) => {
  try {
    console.log("Starting analysis pipeline with data:", sourceData);
    toast.info("Starting analysis pipeline...");
    
    // Format payload correctly - ensure config only contains the needed type
    const sourceType = Object.keys(sourceData.config)[0];
    const payload = {
      source_id: sourceData.source_id,
      config: {
        [sourceType]: sourceData.config[sourceType]
      }
    };
    
    console.log("Sending formatted payload to pipeline API:", payload);
    
    // Call the pipeline endpoint
    return await apiRequest<PipelineResponse>('/api/v1/pipeline', {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error: any) {
    console.error("Error running analysis pipeline:", error);
    toast.error(`Analysis pipeline failed: ${error.message}`);
    return { data: null, error };
  }
};
