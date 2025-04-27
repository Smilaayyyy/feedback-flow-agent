
import { Progress } from "@/components/ui/progress";
import { Circle } from "lucide-react";

type CollectionProgressProps = {
  status: 'idle' | 'collecting' | 'processing' | 'analyzing' | 'completed' | 'error';
  progress: number;
};

const CollectionProgress = ({ status, progress }: CollectionProgressProps) => {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Collection Progress</span>
        <span className="text-sm text-muted-foreground capitalize">{status}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3" fill={status !== 'idle' ? 'currentColor' : 'none'} />
          Collection
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3" fill={status === 'processing' || status === 'analyzing' || status === 'completed' ? 'currentColor' : 'none'} />
          Processing
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3" fill={status === 'analyzing' || status === 'completed' ? 'currentColor' : 'none'} />
          Analysis
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3" fill={status === 'completed' ? 'currentColor' : 'none'} />
          Complete
        </div>
      </div>
    </div>
  );
};

export default CollectionProgress;
