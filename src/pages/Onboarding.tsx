
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import UrlForm from "@/components/UrlForm";
import { mockUser } from "@/lib/mockData";
import { OnboardingStep } from "@/lib/types";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [projectName, setProjectName] = useState("");
  const [dataSourceAdded, setDataSourceAdded] = useState(false);

  const handleProjectNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      setCurrentStep("dataSource");
    } else {
      toast.error("Please enter a project name");
    }
  };

  const handleAddDataSource = (values: any) => {
    setDataSourceAdded(true);
  };

  const handleCompleteOnboarding = () => {
    toast.success("Project created successfully!");
    navigate("/dashboard");
  };

  const handleSkipToComplete = () => {
    setCurrentStep("complete");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Welcome to Feedback Flow</CardTitle>
              <CardDescription>
                Let's get you set up with your first project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This onboarding will help you create your first feedback analysis project.
                You'll be able to collect and analyze feedback from various sources.
              </p>
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
              <CardTitle>Create Your Project</CardTitle>
              <CardDescription>
                Name your feedback analysis project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleProjectNameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Customer Feedback Analysis"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "dataSource":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Add Your First Data Source</CardTitle>
              <CardDescription>
                Enter the URL of the forum, website, or survey you want to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UrlForm onSubmit={handleAddDataSource} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={handleSkipToComplete}>
                Skip for now
              </Button>
              {dataSourceAdded && (
                <Button onClick={() => setCurrentStep("complete")}>
                  Continue
                </Button>
              )}
            </CardFooter>
          </Card>
        );

      case "complete":
        return (
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>You're all set!</CardTitle>
              <CardDescription>
                Your project is ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-8">
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
              <p className="text-center">
                You've successfully created your project
                {projectName && <strong> "{projectName}"</strong>}.
                {dataSourceAdded && " We've also added your first data source."}
              </p>
              <p className="text-center text-muted-foreground">
                You can now proceed to your dashboard to see your project.
              </p>
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
                  width: currentStep === "welcome" ? "25%" : 
                         currentStep === "project" ? "50%" : 
                         currentStep === "dataSource" ? "75%" : "100%" 
                }}
              ></div>
            </div>
            <div className="flex justify-between">
              <div className={`text-xs font-medium ${currentStep === "welcome" ? "text-primary" : "text-muted-foreground"}`}>
                Welcome
              </div>
              <div className={`text-xs font-medium ${currentStep === "project" ? "text-primary" : "text-muted-foreground"}`}>
                Project
              </div>
              <div className={`text-xs font-medium ${currentStep === "dataSource" ? "text-primary" : "text-muted-foreground"}`}>
                Data Source
              </div>
              <div className={`text-xs font-medium ${currentStep === "complete" ? "text-primary" : "text-muted-foreground"}`}>
                Complete
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
