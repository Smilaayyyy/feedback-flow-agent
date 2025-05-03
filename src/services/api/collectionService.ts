
import { apiRequest } from "./baseApiService";
import { toast } from "sonner";

// Interface for collection config
export interface CollectionConfig {
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
      source_id: sourceData.source_id,
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

    console.log("Sending to collector API:", apiPayload);
    
    return await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(apiPayload)
    });
  } catch (error: any) {
    console.error("Error sending data to collector:", error);
    toast.error(`Failed to send data to collector agent: ${error.message}`);
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
