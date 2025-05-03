
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createDataSource, DataSourceType } from "@/services/agentService";
import { toast } from "sonner";
import { Facebook, Instagram, Youtube, Link as LinkIcon } from "lucide-react";

const urlFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  type: z.enum(["forum", "social", "reviews", "survey"]),
  platform: z.string().optional(),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;

const UrlForm = ({ onSubmit }: { onSubmit: (values: UrlFormValues) => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("forum");
  
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      name: "",
      url: "",
      type: "forum",
    },
  });

  const handleSubmit = async (values: UrlFormValues) => {
    setIsSubmitting(true);
    try {
      // Create data source in Supabase and trigger collector agent
      const metadata = { 
        submittedAt: new Date().toISOString(),
        platform: values.platform || null
      };
      
      const { data, error } = await createDataSource(
        values.name,
        values.url,
        values.type as DataSourceType,
        metadata
      );
      
      if (error) throw error;
      
      // Call the onSubmit callback from parent component
      onSubmit(values);
      
      // Reset the form
      form.reset();
      
      toast.success("Data source added successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to add data source: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    form.setValue("type", value as "forum" | "social" | "reviews" | "survey");
    
    // Reset platform when changing type
    form.setValue("platform", undefined);
    
    // Clear URL when changing type
    form.setValue("url", "");
  };
  
  // Get the platform options based on selected type
  const getPlatformOptions = () => {
    switch (selectedType) {
      case "social":
        return [
          { value: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4 mr-2" /> },
          { value: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4 mr-2" /> },
          { value: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4 mr-2" /> },
          { value: "reddit", label: "Reddit", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "twitter", label: "X/Twitter", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "linkedin", label: "LinkedIn", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
        ];
      case "reviews":
        return [
          { value: "trustpilot", label: "Trustpilot", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "yelp", label: "Yelp", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "google", label: "Google Reviews", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "amazon", label: "Amazon", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "tripadvisor", label: "TripAdvisor", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
        ];
      case "survey":
        return [
          { value: "surveymonkey", label: "SurveyMonkey", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "typeform", label: "Typeform", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "googleforms", label: "Google Forms", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "microsoft", label: "Microsoft Forms", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
          { value: "qualtrics", label: "Qualtrics", icon: <LinkIcon className="h-4 w-4 mr-2" /> },
        ];
      default:
        return [];
    }
  };

  // Get URL placeholder based on selected type and platform
  const getUrlPlaceholder = () => {
    const platform = form.watch("platform");
    
    if (selectedType === "social" && platform) {
      switch (platform) {
        case "facebook": return "https://facebook.com/page-name";
        case "instagram": return "https://instagram.com/account-name";
        case "youtube": return "https://youtube.com/channel/channel-id";
        case "reddit": return "https://reddit.com/r/subreddit-name";
        case "twitter": return "https://twitter.com/account-name";
        case "linkedin": return "https://linkedin.com/company/company-name";
      }
    }
    
    switch (selectedType) {
      case "forum": return "https://example-forum.com/discussion/topic";
      case "social": return "https://social-media-url.com";
      case "reviews": return "https://review-site.com/business/your-business";
      case "survey": return "https://survey-platform.com/your-survey";
      default: return "https://example.com";
    }
  };
  
  const platformOptions = getPlatformOptions();
  const showPlatformSelector = ["social", "reviews", "survey"].includes(selectedType);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Data Source" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={handleTypeChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="forum">Forum / Discussion</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="reviews">Review Site</SelectItem>
                  <SelectItem value="survey">Survey / Form</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showPlatformSelector && platformOptions.length > 0 && (
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {platformOptions.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                      >
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {selectedType === "social" 
                    ? "Select a social media platform that allows data collection"
                    : selectedType === "reviews" 
                      ? "Select a review site to collect feedback from"
                      : "Select the platform hosting your survey or form"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder={getUrlPlaceholder()} {...field} />
              </FormControl>
              <FormDescription>
                Enter the specific URL for the {selectedType} data you want to collect
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding Data Source..." : "Add Data Source"}
        </Button>
      </form>
    </Form>
  );
};

export default UrlForm;
