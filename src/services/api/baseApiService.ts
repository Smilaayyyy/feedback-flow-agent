
// Common API configuration and utility functions

// API endpoint configuration
export const API_BASE_URL = "http://0.0.0.0:8000/api/v1";

// Base fetch function with error handling
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
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
