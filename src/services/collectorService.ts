
import { toast } from "sonner";

const API_BASE_URL = "https://ai-feedback-agrregator.onrender.com/api/v1";

// Function to send data to collector agent
export const sendToCollector = async (
  sourceData: any,
  withFiles: boolean = false
) => {
  try {
    const endpoint = withFiles ? "/collect/survey-files" : "/collect";
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sourceData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send data: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error sending data to collector:", error);
    toast.error("Failed to send data to collector agent");
    return { data: null, error };
  }
};

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

// Function to fetch dashboard data
export const fetchDashboardData = async (taskId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/${taskId}/html`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch dashboard data: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    toast.error("Failed to fetch dashboard data");
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
