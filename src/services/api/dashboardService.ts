
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";

// Function to generate dashboard from analysis
export const generateDashboard = async (
  analysisTaskId: string,
  includeAlerts: boolean = true,
  includeReport: boolean = true
) => {
  try {
    const url = new URL(`/dashboard/${analysisTaskId}`, apiRequest.toString());
    url.searchParams.append("include_alerts", includeAlerts.toString());
    url.searchParams.append("include_report", includeReport.toString());
    
    return await apiRequest(url.pathname + url.search, {
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
    return await apiRequest(`/dashboard/${taskId}/html`);
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
    // First get the HTML content
    const { data: html, error } = await apiRequest<string>(`/dashboard/${taskId}/html`);
    
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
    return await apiRequest(`/report/${dashboardTaskId}`);
  } catch (error: any) {
    console.error("Error fetching report data:", error);
    toast.error("Failed to fetch report data");
    return { data: null, error };
  }
};
