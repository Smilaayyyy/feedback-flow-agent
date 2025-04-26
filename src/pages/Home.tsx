
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={null} onLogout={() => {}} />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            AI-Powered Feedback Analysis
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Aggregate and analyze feedback from multiple sources using intelligent agents
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate("/signup")} className="animate-fade-in">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              Learn More
            </Button>
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
