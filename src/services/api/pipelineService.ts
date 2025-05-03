
import { toast } from "sonner";
import { sendToCollector } from "./collectionService";
import { checkTaskStatus, TaskStatusResponse } from "./taskService";
import { processCollectedData, analyzeProcessedData } from "./processingService";
import { generateDashboard } from "./dashboardService";

// Function to run the entire pipeline from collection to dashboard
export const runFullAnalysisPipeline = async (sourceData: {
  source_id: string;
  config: Record<string, any>;
}) => {
  try {
    // 1. Collect data
    toast.info("Starting data collection...");
    const { data: collectionData, error: collectionError } = await sendToCollector(sourceData);
    if (collectionError) throw collectionError;
    
    const collectionTaskId = collectionData.task_id;
    
    // 2. Wait for collection to complete (poll status)
    let collectionStatus = "pending";
    while (collectionStatus !== "completed" && collectionStatus !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      const { data: statusData } = await checkTaskStatus(collectionTaskId);
      const response = statusData as TaskStatusResponse;
      collectionStatus = response?.status || "pending";
      
      if (response?.status === "completed") {
        toast.success("Data collection completed");
        break;
      }
      
      if (response?.status === "failed") {
        throw new Error("Data collection failed");
      }
    }
    
    // 3. Process the collected data
    toast.info("Processing collected data...");
    const { data: processData, error: processError } = await processCollectedData(collectionTaskId);
    if (processError) throw processError;
    
    const processTaskId = processData.task_id;
    
    // 4. Wait for processing to complete
    let processStatus = "pending";
    while (processStatus !== "completed" && processStatus !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      const { data: statusData } = await checkTaskStatus(processTaskId);
      const response = statusData as TaskStatusResponse;
      processStatus = response?.status || "pending";
      
      if (response?.status === "completed") {
        toast.success("Data processing completed");
        break;
      }
      
      if (response?.status === "failed") {
        throw new Error("Data processing failed");
      }
    }
    
    // 5. Analyze the processed data
    toast.info("Analyzing data...");
    const { data: analysisData, error: analysisError } = await analyzeProcessedData(processTaskId);
    if (analysisError) throw analysisError;
    
    const analysisTaskId = analysisData.task_id;
    
    // 6. Wait for analysis to complete
    let analysisStatus = "pending";
    while (analysisStatus !== "completed" && analysisStatus !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      const { data: statusData } = await checkTaskStatus(analysisTaskId);
      const response = statusData as TaskStatusResponse;
      analysisStatus = response?.status || "pending";
      
      if (response?.status === "completed") {
        toast.success("Data analysis completed");
        break;
      }
      
      if (response?.status === "failed") {
        throw new Error("Data analysis failed");
      }
    }
    
    // 7. Generate dashboard
    toast.info("Generating dashboard...");
    const { data: dashboardData, error: dashboardError } = await generateDashboard(analysisTaskId);
    if (dashboardError) throw dashboardError;
    
    const dashboardTaskId = dashboardData.task_id;
    
    // 8. Wait for dashboard generation to complete
    let dashboardStatus = "pending";
    while (dashboardStatus !== "completed" && dashboardStatus !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      const { data: statusData } = await checkTaskStatus(dashboardTaskId);
      const response = statusData as TaskStatusResponse;
      dashboardStatus = response?.status || "pending";
      
      if (response?.status === "completed") {
        toast.success("Dashboard generation completed");
        break;
      }
      
      if (response?.status === "failed") {
        throw new Error("Dashboard generation failed");
      }
    }
    
    return {
      success: true,
      taskIds: {
        collection: collectionTaskId,
        processing: processTaskId,
        analysis: analysisTaskId,
        dashboard: dashboardTaskId
      }
    };
    
  } catch (error: any) {
    console.error("Error in analysis pipeline:", error);
    toast.error(`Analysis pipeline failed: ${error.message}`);
    return { success: false, error };
  }
};
