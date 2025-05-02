
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mockUser } from "@/lib/mockData";
import { Project } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";
import { createProject, getProjects } from "@/services/agentService";

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters."),
  description: z.string().optional(),
});

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const { data, error } = await getProjects();
    
    if (error) {
      toast.error("Failed to load projects");
      console.error("Error loading projects:", error);
    } else if (data) {
      setProjects(data);
    } else {
      // If no data from API, use mock data for demonstration
      setProjects([]);
    }
    
    setIsLoading(false);
  };

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      const { data, error } = await createProject(values.name, values.description);
      
      if (error) throw error;
      
      setDialogOpen(false);
      toast.success(`Project "${values.name}" created successfully`);
      
      // Navigate to data collection page with project ID
      navigate(`/data-collection?projectId=${data.id}&projectName=${encodeURIComponent(data.name)}`);
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Projects</h1>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button onClick={() => setDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter project description"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Continue to Data Collection
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/dashboard?projectId=${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-4">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first feedback analysis project to get started.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
