// src/services/collectorService.ts
import { toast } from "sonner";
import { CollectionStatus } from "./agentService";

const API_BASE_URL = "https://ai-feedback-agrregator.onrender.com/api/v1";
// Uncomment this for local development
// const API_BASE_URL = "http://localhost:8000/api/v1";

// Interface for collection config
interface CollectionConfig {
  social?: {
    platform?: string;
    hashtags?: string[];
    date_range?: string;
  };
  review?: {
    websites?: string[];
    date_range?: string;
  };
  survey?: {
    form_id?: string;
    files_dir?: string | null;
    api_endpoints?: string[];
  };
}

// Function to send data to collector agent
export const sendToCollector = async (
  sourceData: {
    source_id: string;
    config: Record<string, any>;
  },
  withFiles: boolean = false
) => {
  try {
    const endpoint = withFiles ? "/collect/survey-files" : "/collect";
    
    // Convert the sourceData to the expected format for the API
    const apiPayload = {
      config: {
        social: {
          platform: sourceData.config.social?.url?.includes("twitter") || sourceData.config.social?.url?.includes("x.com") 
            ? "Twitter" 
            : sourceData.config.social?.url?.includes("facebook") 
              ? "Facebook" 
              : "Twitter",
          hashtags: sourceData.config.social?.hashtags || ["#feedback"],
          date_range: sourceData.config.social?.date_range || "last_30_days"
        },
        review: {
          websites: sourceData.config.review?.websites || 
            (sourceData.config.review?.url ? [determineReviewSite(sourceData.config.review.url)] : ["Google", "Yelp"]),
          date_range: sourceData.config.review?.date_range || "last_30_days"
        },
        survey: {
          form_id: sourceData.config.survey?.form_id || "default_form",
          files_dir: sourceData.config.survey?.files_dir || null,
          api_endpoints: sourceData.config.survey?.api_endpoints || []
        }
      }
    };

    console.log("Sending to collector:", apiPayload);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send data: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Collection response:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Error sending data to collector:", error);
    toast.error("Failed to send data to collector agent");
    return { data: null, error };
  }
};

// Helper function to determine review site from URL
function determineReviewSite(url: string): string {
  if (url.includes("trustpilot")) return "Trustpilot";
  if (url.includes("yelp")) return "Yelp";
  if (url.includes("google")) return "Google";
  if (url.includes("tripadvisor")) return "TripAdvisor";
  if (url.includes("amazon")) return "Amazon";
  return "Google"; // Default
}

// Function to check task status
export const checkTaskStatus = async (taskId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check task status: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error checking task status:", error);
    return { data: null, error };
  }
};

// Function to process data after collection
export const processCollectedData = async (collectionTaskId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/process/${collectionTaskId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to process data: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error processing data:", error);
    toast.error("Failed to process collected data");
    return { data: null, error };
  }
};

// Function to analyze processed data
export const analyzeProcessedData = async (processingTaskId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/${processingTaskId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to analyze data: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error analyzing data:", error);
    toast.error("Failed to analyze processed data");
    return { data: null, error };
  }
};

// Function to generate dashboard from analysis
export const generateDashboard = async (
  analysisTaskId: string,
  includeAlerts: boolean = true,
  includeReport: boolean = true
) => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/${analysisTaskId}`);
    url.searchParams.append("include_alerts", includeAlerts.toString());
    url.searchParams.append("include_report", includeReport.toString());
    
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate dashboard: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error generating dashboard:", error);
    toast.error("Failed to generate dashboard");
    return { data: null, error };
  }
};

// Function to fetch dashboard HTML
export const fetchDashboardHtml = async (taskId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/${taskId}/html`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch dashboard HTML: ${errorText}`);
    }
    
    const htmlContent = await response.text();
    return { data: htmlContent, error: null };
  } catch (error: any) {
    console.error("Error fetching dashboard HTML:", error);
    toast.error("Failed to fetch dashboard");
    return { data: null, error };
  }
};

// Function to fetch dashboard data
export const fetchDashboardData = async (taskId: string) => {
  try {
    // First get the HTML content
    const htmlResponse = await fetch(`${API_BASE_URL}/dashboard/${taskId}/html`);
    
    if (!htmlResponse.ok) {
      const errorText = await htmlResponse.text();
      throw new Error(`Failed to fetch dashboard HTML: ${errorText}`);
    }
    
    const html = await htmlResponse.text();
    
    return { 
      data: { html }, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error fetching dashboard HTML:", error);
    toast.error("Failed to fetch dashboard");
    return { data: null, error };
  }
};

// Function to fetch report data
export const fetchReportData = async (dashboardTaskId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/report/${dashboardTaskId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch report data: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching report data:", error);
    toast.error("Failed to fetch report data");
    return { data: null, error };
  }
};

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
      collectionStatus = statusData?.status || "pending";
      
      if (statusData?.status === "completed") {
        toast.success("Data collection completed");
        break;
      }
      
      if (statusData?.status === "failed") {
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
      processStatus = statusData?.status || "pending";
      
      if (statusData?.status === "completed") {
        toast.success("Data processing completed");
        break;
      }
      
      if (statusData?.status === "failed") {
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
      analysisStatus = statusData?.status || "pending";
      
      if (statusData?.status === "completed") {
        toast.success("Data analysis completed");
        break;
      }
      
      if (statusData?.status === "failed") {
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
      dashboardStatus = statusData?.status || "pending";
      
      if (statusData?.status === "completed") {
        toast.success("Dashboard generation completed");
        break;
      }
      
      if (statusData?.status === "failed") {
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
