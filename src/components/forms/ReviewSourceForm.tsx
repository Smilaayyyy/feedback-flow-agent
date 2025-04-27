
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

const reviewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  platforms: z.array(z.string()).min(1, { message: "Select at least one platform" }),
  productName: z.string().min(1, { message: "Product name is required" }),
  minRating: z.string(),
  timeframe: z.enum(["7days", "30days", "custom"]),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewSourceForm({ onSubmit }: { onSubmit: (values: ReviewFormValues) => void }) {
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      name: "",
      platforms: [],
      productName: "",
      minRating: "all",
      timeframe: "7days",
    },
  });

  const handlePlatformSelect = (platform: string) => {
    const current = [...selectedPlatforms];
    const index = current.indexOf(platform);
    
    if (index === -1) {
      current.push(platform);
    } else {
      current.splice(index, 1);
    }
    
    setSelectedPlatforms(current);
    form.setValue("platforms", current);
  };

  const handleSubmit = async (values: ReviewFormValues) => {
    setCollectionStatus('collecting');
    setProgress(25);
    
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
              <FormLabel>Platforms</FormLabel>
              <div className="flex flex-wrap gap-2">
                {["amazon", "trustpilot", "yelp", "google"].map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    onClick={() => handlePlatformSelect(platform)}
                    className="capitalize"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
              <FormDescription>
                Select one or more platforms to collect reviews from
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product or Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product or business name" {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select minimum rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="1">1+ Star</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                </SelectContent>
              </Select>
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
