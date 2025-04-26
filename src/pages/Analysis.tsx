
import Header from "@/components/Header";
import { mockUser, mockAnalysisResults } from "@/lib/mockData";
import AnalysisSummary from "@/components/AnalysisSummary";

const Analysis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">Analysis Results</h1>
          
          <div className="space-y-6">
            {mockAnalysisResults.map((result) => (
              <AnalysisSummary key={result.id} analysisResult={result} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
