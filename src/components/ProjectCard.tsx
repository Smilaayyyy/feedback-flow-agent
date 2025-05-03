
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
  
  // Get collection names from data sources
  const getCollectionNames = () => {
    if (data_sources.length === 0) return "No collections";
    
    const typeCount = data_sources.reduce((acc, source) => {
      const type = source.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCount)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Created on {formattedDate}</CardDescription>
          </div>
          <Badge variant={data_sources.length > 0 ? "default" : "outline"}>
            {getCollectionNames()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Collections:</span> {getCollectionNames()}
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
