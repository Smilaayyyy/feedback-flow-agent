
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockUser, mockProject } from "@/lib/mockData";
import { Project } from "@/lib/types";
import { FolderPlus } from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([mockProject]);
  const [newProjectUrl, setNewProjectUrl] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating project with URL:", newProjectUrl);
    // TODO: Implement project creation logic
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Projects</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Forum URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="Enter forum URL"
                      value={newProjectUrl}
                      onChange={(e) => setNewProjectUrl(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Project</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
