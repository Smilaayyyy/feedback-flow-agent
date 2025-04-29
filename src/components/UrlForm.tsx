
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createDataSource } from "@/services/agentService";
import { toast } from "sonner";

const urlFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  type: z.enum(["forum", "social", "review", "survey"]),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;

const UrlForm = ({ onSubmit }: { onSubmit: (values: UrlFormValues) => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      const { data, error } = await createDataSource(
        values.name,
        values.url,
        values.type,
        { submittedAt: new Date().toISOString() }
      );
      
      if (error) throw error;
      
      // Call the onSubmit callback from parent component
      onSubmit(values);
      
      // Reset the form
      form.reset();
      
      toast.success("Data source added successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add data source");
    } finally {
      setIsSubmitting(false);
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
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="forum">Forum / Discussion</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="review">Review Site</SelectItem>
                  <SelectItem value="survey">Survey / Form</SelectItem>
                </SelectContent>
              </Select>
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
