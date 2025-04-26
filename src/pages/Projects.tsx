
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockUser, mockProject } from "@/lib/mockData";
import { Project } from "@/lib/types";
import { FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([mockProject]);
  const navigate = useNavigate();

  const handleCreateProject = () => {
    // Redirect to onboarding page for new project creation
    navigate("/onboarding");
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
                <div className="py-4">
                  <p className="text-muted-foreground mb-4">
                    Creating a new project will guide you through our onboarding process to set up
                    data sources and analysis preferences.
                  </p>
                  <Button onClick={handleCreateProject} className="w-full">
                    Continue to Project Setup
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate("/dashboard")}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
