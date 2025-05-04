
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";

// Function to generate dashboard from analysis
export const generateDashboard = async (
  analysisTaskId: string,
  includeAlerts: boolean = true,
  includeReport: boolean = true
) => {
  try {
    const url = `/api/v1/dashboard/${analysisTaskId}?include_alerts=${includeAlerts.toString()}&include_report=${includeReport.toString()}`;
    
    console.log("Generating dashboard with URL:", url);
    
    return await apiRequest(url, {
      method: "POST"
    });
  } catch (error: any) {
    console.error("Error generating dashboard:", error);
    toast.error("Failed to generate dashboard");
    return { data: null, error };
  }
};

// Function to fetch dashboard HTML
export const fetchDashboardHtml = async (taskId: string) => {
  try {
    console.log("Fetching dashboard HTML for task:", taskId);
    return await apiRequest(`/api/v1/dashboard/${taskId}/html`);
  } catch (error: any) {
    console.error("Error fetching dashboard HTML:", error);
    toast.error("Failed to fetch dashboard");
    return { data: null, error };
  }
};

// Function to fetch dashboard data
export const fetchDashboardData = async (taskId: string) => {
  try {
    console.log("Fetching dashboard data for task:", taskId);
    // Get the HTML content
    const { data: html, error } = await apiRequest<string>(`/api/v1/dashboard/${taskId}/html`);
    
    if (error) throw error;
    
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
    console.log("Fetching report data for task:", dashboardTaskId);
    return await apiRequest(`/api/v1/report/${dashboardTaskId}`);
  } catch (error: any) {
    console.error("Error fetching report data:", error);
    toast.error("Failed to fetch report data");
    return { data: null, error };
  }
};
