
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DataSource = {
  id: string;
  name: string;
  type: string;
  status: string;
};

type Project = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  data_sources?: DataSource[];
};

type ProjectCardProps = {
  project: Project;
  onClick: () => void;
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Make sure we have valid data with defaults
  const name = project.name || "Unnamed Project";
  const description = project.description || "";
  const created_at = project.created_at || new Date().toISOString();
  const data_sources = project.data_sources || [];
  
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date(created_at));
  
  const completedSources = data_sources?.filter(source => source.status === 'completed').length || 0;
  const totalSources = data_sources?.length || 0;
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Created on {formattedDate}</CardDescription>
          </div>
          <Badge variant={totalSources > 0 ? "default" : "outline"}>
            {completedSources} / {totalSources} Sources
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Data Sources:</span> {totalSources}
          </div>
          {description && (
            <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {description}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">View Project</Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
