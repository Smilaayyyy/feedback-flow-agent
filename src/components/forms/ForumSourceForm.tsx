
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CollectionProgress from "../CollectionProgress";
import { useState } from "react";

const forumFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  urls: z.string().min(1, { message: "At least one URL is required" }),
});

type ForumFormValues = z.infer<typeof forumFormSchema>;

export function ForumSourceForm({ onSubmit }: { onSubmit: (values: ForumFormValues) => void }) {
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const form = useForm<ForumFormValues>({
    resolver: zodResolver(forumFormSchema),
    defaultValues: {
      name: "",
      urls: "",
    },
  });

  const handleSubmit = async (values: ForumFormValues) => {
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
    toast.success("Forum data collection started");
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
                <Input placeholder="Forum Data Collection" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forum URLs</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter forum URLs (one per line)"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Add the URLs of forum pages you want to monitor
              </FormDescription>
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
