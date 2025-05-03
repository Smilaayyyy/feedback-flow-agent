
import { apiRequest } from "./baseApiService";

// Function to check task status
export const checkTaskStatus = async (taskId: string) => {
  console.log("Checking task status for:", taskId);
  return await apiRequest(`/task/${taskId}`);
};

// Export types
export type CollectionStatus = "pending" | "collecting" | "processing" | "analyzing" | "completed" | "failed";
