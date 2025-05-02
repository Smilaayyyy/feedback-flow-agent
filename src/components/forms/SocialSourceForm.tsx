
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import CollectionProgress from "../CollectionProgress";
import { useState } from "react";
import { createDataSource } from "@/services/agentService";

const socialFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  platform: z.enum(["twitter", "facebook", "linkedin"]), // Only platforms that allow scraping
  keywords: z.string().min(1, { message: "Keywords are required" }),
  timeframe: z.enum(["7days", "30days", "custom"]),
});

type SocialFormValues = z.infer<typeof socialFormSchema>;

export function SocialSourceForm({ 
  onSubmit,
  projectId
}: { 
  onSubmit: (values: SocialFormValues) => void;
  projectId?: string | null;
}) {
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const form = useForm<SocialFormValues>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      name: "",
      platform: "twitter",
      keywords: "",
      timeframe: "7days",
    },
  });

  const handleSubmit = async (values: SocialFormValues) => {
    setCollectionStatus('collecting');
    setProgress(25);
    
    // Add projectId to the source data if available
    if (projectId) {
      try {
        await createDataSource(
          values.name,
          `https://api.socialmedia.com/${values.platform}`,
          "social",
          { 
            project_id: projectId,
            platform: values.platform,
            keywords: values.keywords,
            timeframe: values.timeframe
          }
        );
      } catch (error) {
        console.error("Error creating social data source:", error);
      }
    }
    
    setTimeout(() => setProgress(50), 2000);
    setTimeout(() => {
      setProgress(75);
      setCollectionStatus('processing');
    }, 4000);
    setTimeout(() => {
      setProgress(100);
      setCollectionStatus('completed');
    }, 6000);

    onSubmit(values);
    toast.success("Social media data collection started");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection Name</FormLabel>
              <FormControl>
                <Input placeholder="Social Media Collection" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="facebook">Facebook (Public Pages)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn (Public Posts)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the social media platform to collect data from. Only platforms that allow public data collection are available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords or Hashtags</FormLabel>
              <FormControl>
                <Input placeholder="#brandname OR keyword1, keyword2" {...field} />
              </FormControl>
              <FormDescription>
                Use hashtags or keywords separated by commas. Use OR for alternatives.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Range</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="7days" />
                    </FormControl>
                    <FormLabel className="font-normal">Last 7 days</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="30days" />
                    </FormControl>
                    <FormLabel className="font-normal">Last 30 days</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom range</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={collectionStatus === 'collecting'}>
          {collectionStatus === 'collecting' ? "Starting Collection..." : "Start Collection"}
        </Button>

        {collectionStatus !== 'idle' && (
          <CollectionProgress status={collectionStatus} progress={progress} />
        )}
      </form>
    </Form>
  );
}
