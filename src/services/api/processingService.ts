
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";

// Function to process data after collection
export const processCollectedData = async (collectionTaskId: string) => {
  try {
    return await apiRequest(`/process/${collectionTaskId}`, {
      method: "POST"
    });
  } catch (error: any) {
    console.error("Error processing data:", error);
    toast.error("Failed to process collected data");
    return { data: null, error };
  }
};

// Function to analyze processed data
export const analyzeProcessedData = async (processingTaskId: string) => {
  try {
    return await apiRequest(`/analyze/${processingTaskId}`, {
      method: "POST"
    });
  } catch (error: any) {
    console.error("Error analyzing data:", error);
    toast.error("Failed to analyze processed data");
    return { data: null, error };
  }
};
