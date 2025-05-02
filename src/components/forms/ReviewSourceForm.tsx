
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import CollectionProgress from "../CollectionProgress";
import { useState } from "react";
import { createDataSource } from "@/services/agentService";

const reviewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  platforms: z.array(z.string()).min(1, { message: "At least one platform is required" }),
  productName: z.string().min(1, { message: "Product name is required" }),
  minRating: z.string(),
  timeframe: z.enum(["7days", "30days", "custom"]),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewSourceForm({ 
  onSubmit,
  projectId
}: { 
  onSubmit: (values: ReviewFormValues) => void;
  projectId?: string | null;
}) {
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      platforms: ["Google"],
      productName: "",
      minRating: "0",
      timeframe: "30days",
    },
  });

  const platforms = [
    { id: "Google", label: "Google Reviews" },
    { id: "Trustpilot", label: "Trustpilot" },
    { id: "Yelp", label: "Yelp" },
    { id: "Amazon", label: "Amazon Reviews" },
  ];

  const handleSubmit = async (values: ReviewFormValues) => {
    setCollectionStatus('collecting');
    setProgress(25);
    
    if (projectId) {
      try {
        await createDataSource(
          values.name,
          `https://api.reviews.com/${values.platforms[0].toLowerCase()}`,
          "reviews",
          { 
            project_id: projectId,
            platforms: values.platforms,
            product_name: values.productName,
            min_rating: values.minRating,
            timeframe: values.timeframe
          }
        );
      } catch (error) {
        console.error("Error creating review data source:", error);
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
    toast.success("Review data collection started");
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
                <Input placeholder="Review Collection" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platforms"
          render={() => (
            <FormItem>
              <FormLabel>Review Platforms</FormLabel>
              <FormDescription>
                Select review sites to scrape for feedback
              </FormDescription>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {platforms.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control}
                    name="platforms"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={platform.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(platform.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, platform.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== platform.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {platform.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product or Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 'Acme Inc.'" {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of the product or company to search for reviews
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Rating</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="0" />
                    </FormControl>
                    <FormLabel className="font-normal">All</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="1" />
                    </FormControl>
                    <FormLabel className="font-normal">1★+</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="2" />
                    </FormControl>
                    <FormLabel className="font-normal">2★+</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="3" />
                    </FormControl>
                    <FormLabel className="font-normal">3★+</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
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
