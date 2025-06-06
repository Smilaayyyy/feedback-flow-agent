
// Common API configuration and utility functions

// API endpoint configuration 
export const API_BASE_URL = "https://ai-feedback-agrregator.onrender.com/api/v1";

// Base fetch function with error handling
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    // Make sure endpoint starts with / for consistency
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    
    // Add API_BASE_URL to the endpoint
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API request failed: ${errorText}`);
    }
    
    // Handle both JSON and text responses
    const contentType = response.headers.get("content-type");
    let data: any;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log("API response:", data);
    return { data, error: null };
  } catch (error: any) {
    console.error("API request error:", error);
    return { data: null, error };
  }
}
