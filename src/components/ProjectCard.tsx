
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
  onClick: () => void;
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(project.createdAt);
  
  const completedSources = project.dataSources.filter(source => source.status === 'completed').length;
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>Created on {formattedDate}</CardDescription>
          </div>
          <Badge variant={completedSources > 0 ? "default" : "outline"}>
            {completedSources} / {project.dataSources.length} Sources
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Data Sources:</span> {project.dataSources.length}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Analysis Results:</span> {project.analysisResults.length}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">View Project</Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
