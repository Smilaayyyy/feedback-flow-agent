
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";

// Function to run the entire analysis pipeline
export const runAnalysisPipeline = async (sourceData: {
  source_id: string;
  config: Record<string, any>;
}) => {
  try {
    console.log("Starting analysis pipeline with data:", sourceData);
    toast.info("Starting analysis pipeline...");
    
    // Call the pipeline endpoint
    return await apiRequest('/api/v1/pipeline', {
      method: "POST",
      body: JSON.stringify(sourceData)
    });
  } catch (error: any) {
    console.error("Error running analysis pipeline:", error);
    toast.error(`Analysis pipeline failed: ${error.message}`);
    return { data: null, error };
  }
};
