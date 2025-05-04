
import { apiRequest } from "./baseApiService";

// Function to check task status
export const checkTaskStatus = async (taskId: string) => {
  console.log("Checking task status for:", taskId);
  return await apiRequest(`/api/v1/task/${taskId}`);
};

// Export types
export type CollectionStatus = "pending" | "collecting" | "processing" | "analyzing" | "completed" | "failed" | "error";

// Define a type for task status response
export interface TaskStatusResponse {
  task_id: string;
  status: CollectionStatus;
  message?: string;
  sources?: any[];
  timestamp: string;
  current_stage?: string;
  collection_task_id?: string;
  processing_task_id?: string;
  analysis_task_id?: string;
  dashboard_task_id?: string;
  [key: string]: any;
}
