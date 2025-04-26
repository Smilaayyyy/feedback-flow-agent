
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={null} onLogout={() => {}} />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 py-16 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Transform Your Feedback Into Insights
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Collect, analyze, and act on feedback from multiple sources using intelligent AI agents
            </p>
            <div className="space-x-4">
              <Button size="lg" onClick={() => navigate("/signup")} className="animate-fade-in">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Intelligent Collection</h3>
                <p className="text-muted-foreground">Automatically gather feedback from multiple sources</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
                <p className="text-muted-foreground">AI-powered insights and pattern recognition</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Actionable Reports</h3>
                <p className="text-muted-foreground">Generate detailed reports and set up custom alerts</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-white">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © 2025 Feedback Flow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
