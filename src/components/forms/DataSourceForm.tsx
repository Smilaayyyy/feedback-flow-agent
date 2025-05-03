
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import CollectionProgress from "../CollectionProgress";
import { useState } from "react";
import { Upload } from "lucide-react";
import { createDataSource } from "@/services/agentService";

const dataSourceFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  sourceType: z.enum(["api", "file"]),
  apiUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  file: z.any().optional(),
});

type DataSourceFormValues = z.infer<typeof dataSourceFormSchema>;

export function DataSourceForm({ 
  onSubmit, 
  projectId 
}: { 
  onSubmit: (values: DataSourceFormValues) => void;
  projectId?: string | null;
}) {
  const [collectionStatus, setCollectionStatus] = useState<'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const form = useForm<DataSourceFormValues>({
    resolver: zodResolver(dataSourceFormSchema),
    defaultValues: {
      name: "",
      sourceType: "api",
      apiUrl: "",
    },
  });

  const handleSubmit = async (values: DataSourceFormValues) => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    setCollectionStatus('collecting');
    setProgress(25);
    
    try {
      // Create the data source with the correct parameters - fixed the metadata parameter type
      const { data, error } = await createDataSource(
        values.name,
        values.apiUrl || "https://api.example.com/data",
        "forum", // Using forum as the default type for form/api data
        { 
          sourceType: values.sourceType,
          project_id: projectId 
        } // Pass metadata as an object, not a string
      );
      
      if (error) {
        throw error;
      }
      
      // Update progress
      setProgress(50);
      setCollectionStatus('processing');
      
      // Wait for a short period to show processing status
      setTimeout(() => {
        setProgress(75);
      }, 2000);
      
      // Call onSubmit with the form values
      onSubmit(values);
      
      // Complete the progress
      setTimeout(() => {
        setProgress(100);
        setCollectionStatus('completed');
        toast.success(`Data source "${values.name}" created and collection started`);
      }, 4000);
      
    } catch (error: any) {
      console.error("Error creating data source:", error);
      setCollectionStatus('error');
      toast.error(`Failed to create data source: ${error.message}`);
    }
  };

  const handleFileBrowse = () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput instanceof HTMLInputElement) {
      fileInput.click();
    }
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
                <Input placeholder="Enter collection name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="api">API Endpoint</SelectItem>
                  <SelectItem value="file">Upload File</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how you want to provide the data
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("sourceType") === "api" && (
          <FormField
            control={form.control}
            name="apiUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Endpoint</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.example.com/data" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the URL where your data is hosted
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("sourceType") === "file" && (
          <FormField
            control={form.control}
            name="file"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".csv,.json,.xlsx"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      {...field}
                    />
                    <Button type="button" variant="outline" onClick={handleFileBrowse}>
                      <Upload className="mr-2 h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Upload your data file (CSV, JSON, or Excel)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={collectionStatus !== 'idle'}
        >
          {collectionStatus === 'idle' 
            ? "Start Collection" 
            : collectionStatus === 'collecting' 
              ? "Starting Collection..." 
              : collectionStatus === 'processing' 
                ? "Processing..." 
                : collectionStatus === 'analyzing' 
                  ? "Analyzing..." 
                  : collectionStatus === 'completed' 
                    ? "Completed" 
                    : "Error"
          }
        </Button>

        {collectionStatus !== 'idle' && (
          <CollectionProgress status={collectionStatus} progress={progress} />
        )}
      </form>
    </Form>
  );
}
