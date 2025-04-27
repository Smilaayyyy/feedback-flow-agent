
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CollectionProgress from "./CollectionProgress";

const urlFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(["forum", "social", "reviews", "survey"], {
    required_error: "Please select a source type.",
  }),
  platform: z.string().optional(),
  keywords: z.string().optional(),
  urls: z.string(),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;

type UrlFormProps = {
  onSubmit: (values: UrlFormValues) => void;
  isSubmitting?: boolean;
};

export function UrlForm({ onSubmit, isSubmitting = false }: UrlFormProps) {
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      name: "",
      type: "forum",
      urls: "",
      keywords: "",
    },
  });

  const handleSubmit = async (values: UrlFormValues) => {
    setCollectionStatus('collecting');
    setProgress(25);
    
    // Simulate progress (in real app, this would be based on actual collection progress)
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
    toast.success("Data collection started");
  };

  const sourceType = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 animate-fade-in">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Name</FormLabel>
              <FormControl>
                <Input placeholder="Product Feedback Collection" {...field} />
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
              <FormLabel>Source Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="forum">Forums</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="reviews">Review Sites</SelectItem>
                  <SelectItem value="survey">Surveys</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {sourceType === "social" && (
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
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sourceType === "reviews" && (
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
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="trustpilot">Trustpilot</SelectItem>
                    <SelectItem value="yelp">Yelp</SelectItem>
                    <SelectItem value="google">Google Reviews</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter keywords (e.g., product names, features, or specific terms)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Separate keywords with commas. These will be used to filter relevant content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{sourceType === 'forum' ? 'Forum URLs' : sourceType === 'survey' ? 'Survey URLs' : 'Target URLs'}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={
                    sourceType === 'forum' 
                      ? "Enter forum URLs (one per line)"
                      : sourceType === 'social'
                      ? "Enter profile/page URLs (one per line)"
                      : sourceType === 'reviews'
                      ? "Enter product/business review URLs (one per line)"
                      : "Enter survey URLs (one per line)"
                  }
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {sourceType === 'forum' && "Add the URLs of forum pages you want to monitor"}
                {sourceType === 'social' && "Add the URLs of social media profiles or pages"}
                {sourceType === 'reviews' && "Add the URLs of product/business review pages"}
                {sourceType === 'survey' && "Add the URLs where survey data is hosted"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting || collectionStatus === 'collecting'}>
          {isSubmitting || collectionStatus === 'collecting' ? "Starting Collection..." : "Start Collection"}
        </Button>

        {collectionStatus !== 'idle' && (
          <CollectionProgress status={collectionStatus} progress={progress} />
        )}
      </form>
    </Form>
  );
}

export default UrlForm;
