
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import UrlForm from "@/components/UrlForm";
import { mockUser } from "@/lib/mockData";
import { toast } from "sonner";

type OnboardingStep = 
  | "welcome" 
  | "project" 
  | "sourceType" 
  | "dataSource" 
  | "analysisPreferences" 
  | "alertSetup" 
  | "complete";

type SourceType = "forum" | "social" | "reviews" | "surveys";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | "">("");
  const [dataSourceAdded, setDataSourceAdded] = useState(false);
  const [analysisPreferences, setAnalysisPreferences] = useState({
    sentiment: true,
    themes: true,
    urgency: false,
    competitors: false,
  });
  const [alertFrequency, setAlertFrequency] = useState("daily");

  const handleProjectInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      setCurrentStep("sourceType");
    } else {
      toast.error("Please enter a project name");
    }
  };

  const handleSourceTypeSelection = (value: string) => {
    setSelectedSourceType(value as SourceType);
    setCurrentStep("dataSource");
  };

  const handleAddDataSource = (values: any) => {
    console.log("Data source added:", values);
    setDataSourceAdded(true);
    toast.success("Data source added successfully!");
    setCurrentStep("analysisPreferences");
  };

  const handleAnalysisPreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("alertSetup");
  };

  const handleAlertSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("complete");
  };

  const handleCompleteOnboarding = () => {
    toast.success("Project created successfully!");
    navigate("/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Welcome to Feedback Flow</CardTitle>
              <CardDescription>
                Let's set up your feedback analysis project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This wizard will guide you through creating your feedback analysis project:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Set up your project information</li>
                <li>Select and configure data sources</li>
                <li>Choose analysis preferences</li>
                <li>Set up alerts and notifications</li>
              </ul>
              <p>Our AI agents will take care of the rest!</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setCurrentStep("project")} className="w-full">
                Get Started
              </Button>
            </CardFooter>
          </Card>
        );

      case "project":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Tell us about your feedback analysis project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleProjectInfoSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Customer Feedback Analysis"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Project Description (Optional)</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Describe the purpose of this project..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "sourceType":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Select Data Source Type</CardTitle>
              <CardDescription>
                What type of feedback do you want to analyze?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={selectedSourceType === "forum" ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleSourceTypeSelection("forum")}
                >
                  <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>Forums</span>
                </Button>
                
                <Button 
                  variant={selectedSourceType === "social" ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleSourceTypeSelection("social")}
                >
                  <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>Social Media</span>
                </Button>
                
                <Button 
                  variant={selectedSourceType === "reviews" ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleSourceTypeSelection("reviews")}
                >
                  <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Reviews</span>
                </Button>
                
                <Button 
                  variant={selectedSourceType === "surveys" ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleSourceTypeSelection("surveys")}
                >
                  <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Surveys</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "dataSource":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Add Your {selectedSourceType} Data Source</CardTitle>
              <CardDescription>
                {selectedSourceType === "forum" && "Enter the URL of the forum you want to analyze."}
                {selectedSourceType === "social" && "Enter the social media profile or hashtag you want to monitor."}
                {selectedSourceType === "reviews" && "Enter the review site URL you want to analyze."}
                {selectedSourceType === "surveys" && "Enter the survey platform URL or embed your survey form."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UrlForm onSubmit={handleAddDataSource} />
            </CardContent>
          </Card>
        );

      case "analysisPreferences":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Analysis Preferences</CardTitle>
              <CardDescription>
                Choose what you want our AI agents to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAnalysisPreferencesSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sentiment"
                      checked={analysisPreferences.sentiment}
                      onChange={(e) => 
                        setAnalysisPreferences({
                          ...analysisPreferences,
                          sentiment: e.target.checked
                        })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="sentiment">Sentiment Analysis</Label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Detect positive, negative, and neutral opinions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="themes"
                      checked={analysisPreferences.themes}
                      onChange={(e) => 
                        setAnalysisPreferences({
                          ...analysisPreferences,
                          themes: e.target.checked
                        })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="themes">Theme Detection</Label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Identify common topics and themes in feedback
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="urgency"
                      checked={analysisPreferences.urgency}
                      onChange={(e) => 
                        setAnalysisPreferences({
                          ...analysisPreferences,
                          urgency: e.target.checked
                        })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="urgency">Urgency Detection</Label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Flag feedback that requires immediate attention
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="competitors"
                      checked={analysisPreferences.competitors}
                      onChange={(e) => 
                        setAnalysisPreferences({
                          ...analysisPreferences,
                          competitors: e.target.checked
                        })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="competitors">Competitor Mentions</Label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Track mentions of competitors in feedback
                  </p>
                </div>
                
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "alertSetup":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Alert Setup</CardTitle>
              <CardDescription>
                Set up notifications for important feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAlertSetupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-frequency">Alert Frequency</Label>
                  <Select 
                    value={alertFrequency} 
                    onValueChange={setAlertFrequency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="none">No Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert for Sentiment Below</Label>
                  <Select defaultValue="negative">
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-negative">Very Negative</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">
                  Complete Setup
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "complete":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Setup Complete!</CardTitle>
              <CardDescription>
                Your feedback analysis project is ready to go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-6">
                <div className="rounded-full bg-green-100 p-3">
                  <svg 
                    className="h-8 w-8 text-green-600"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">"{projectName}" Created Successfully!</h3>
                <p className="text-muted-foreground">
                  Our AI agents are now working on your feedback data. You'll see results on your dashboard soon.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-medium text-blue-700 mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Collection Agent gathers data from your sources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Processing Agent cleans and standardizes the data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Analysis Agent extracts insights and patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>Reporting Agent prepares visualizations and alerts</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCompleteOnboarding} className="w-full">
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={mockUser} onLogout={() => {}} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                style={{ 
                  width: 
                    currentStep === "welcome" ? "14%" : 
                    currentStep === "project" ? "28%" : 
                    currentStep === "sourceType" ? "42%" : 
                    currentStep === "dataSource" ? "56%" : 
                    currentStep === "analysisPreferences" ? "70%" :
                    currentStep === "alertSetup" ? "85%" : "100%" 
                }}
              ></div>
            </div>
            <div className="grid grid-cols-7 text-xs">
              <div className={currentStep === "welcome" ? "text-primary" : "text-muted-foreground"}>
                Start
              </div>
              <div className={currentStep === "project" ? "text-primary" : "text-muted-foreground"}>
                Project
              </div>
              <div className={currentStep === "sourceType" ? "text-primary" : "text-muted-foreground"}>
                Source Type
              </div>
              <div className={currentStep === "dataSource" ? "text-primary" : "text-muted-foreground"}>
                Data
              </div>
              <div className={currentStep === "analysisPreferences" ? "text-primary" : "text-muted-foreground"}>
                Analysis
              </div>
              <div className={currentStep === "alertSetup" ? "text-primary" : "text-muted-foreground"}>
                Alerts
              </div>
              <div className={currentStep === "complete" ? "text-primary" : "text-muted-foreground"}>
                Done
              </div>
            </div>
          </div>
        </div>
        
        {renderStepContent()}
      </main>
    </div>
  );
};

export default Onboarding;
