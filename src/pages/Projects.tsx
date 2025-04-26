
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { mockUser, mockProject } from "@/lib/mockData";
import { Project } from "@/lib/types";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([mockProject]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <Button onClick={() => {}}>New Project</Button>
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
