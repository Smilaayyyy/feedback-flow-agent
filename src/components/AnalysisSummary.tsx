
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResult, Theme } from "@/lib/types";

type AnalysisSummaryProps = {
  analysisResult: AnalysisResult;
};

export function AnalysisSummary({ analysisResult }: AnalysisSummaryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.5) return "text-green-500";
    if (score >= 0 && score < 0.5) return "text-blue-500";
    if (score >= -0.5 && score < 0) return "text-yellow-500";
    return "text-red-500";
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 0.5) return "Positive";
    if (score >= 0 && score < 0.5) return "Somewhat Positive";
    if (score >= -0.5 && score < 0) return "Somewhat Negative";
    return "Negative";
  };

  const getThemeBarColor = (sentiment: number) => {
    if (sentiment >= 0.5) return "bg-green-500";
    if (sentiment >= 0 && sentiment < 0.5) return "bg-blue-500";
    if (sentiment >= -0.5 && sentiment < 0) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Find the theme with the highest count
  const maxThemeCount = Math.max(...analysisResult.topThemes.map(theme => theme.count));

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Analysis Results</span>
          <span className="text-sm text-muted-foreground">{formatDate(analysisResult.createdAt)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Overall Sentiment</h4>
            <span className={`${getSentimentColor(analysisResult.sentimentScore)} font-medium`}>
              {getSentimentLabel(analysisResult.sentimentScore)}
            </span>
          </div>
          <Progress 
            value={(analysisResult.sentimentScore + 1) * 50} // Convert from -1 to 1 scale to 0 to 100 scale
            className="h-2"
          />
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Top Themes</h4>
          {analysisResult.topThemes.map((theme, index) => (
            <ThemeBar key={index} theme={theme} maxCount={maxThemeCount} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeBar({ theme, maxCount }: { theme: Theme, maxCount: number }) {
  const percentage = Math.round((theme.count / maxCount) * 100);
  
  const getThemeBarColor = (sentiment: number) => {
    if (sentiment >= 0.5) return "bg-green-500";
    if (sentiment >= 0 && sentiment < 0.5) return "bg-blue-500";
    if (sentiment >= -0.5 && sentiment < 0) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span>{theme.name}</span>
        <span className="text-muted-foreground">{theme.count} mentions</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${getThemeBarColor(theme.sentiment)} rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default AnalysisSummary;
