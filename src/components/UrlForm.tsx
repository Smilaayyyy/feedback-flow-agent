
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const urlFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  type: z.enum(["forum", "website", "social", "survey"], {
    required_error: "Please select a source type.",
  }),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;

type UrlFormProps = {
  onSubmit: (values: UrlFormValues) => void;
  isSubmitting?: boolean;
};

export function UrlForm({ onSubmit, isSubmitting = false }: UrlFormProps) {
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      name: "",
      url: "",
      type: "forum",
    },
  });

  const handleSubmit = (values: UrlFormValues) => {
    onSubmit(values);
    toast.success("Data source added successfully");
    form.reset();
  };

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
                <Input placeholder="Product Forum" {...field} />
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
                <Input placeholder="https://example.com/forum" {...field} />
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
                  <SelectItem value="forum">Forum</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Source"}
        </Button>
      </form>
    </Form>
  );
}

export default UrlForm;
