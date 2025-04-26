
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { mockUser, newUser } from "@/lib/mockData";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in a real app, this would be an API call
    if (email && password) {
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast.success("Logged in successfully");
      
      if (mockUser.hasProject) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } else {
      toast.error("Please enter email and password");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - in a real app, this would be an API call
    if (email && password && name) {
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Account created successfully");
      navigate("/onboarding");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={null} onLogout={() => {}} />
      
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 animate-fade-in">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Introducing Feedback Flow
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Transform Your Feedback Data into Actionable Insights
                </h1>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Collect, analyze, and visualize feedback from forums, websites, and surveys to get a complete picture of what your users are saying.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-md space-y-4 animate-fade-in">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <Card>
                      <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                          Enter your email and password to access your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              placeholder="m@example.com" 
                              required 
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                              id="password" 
                              required 
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Login
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="register">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription>
                          Enter your information to create a new account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <form onSubmit={handleSignup} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                              id="name" 
                              placeholder="John Doe" 
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              placeholder="m@example.com" 
                              required 
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                              id="password" 
                              required 
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Register
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Key Features
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how Feedback Flow can help you understand your users better
                </p>
              </div>
              
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
                <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m16 12-4 4-4-4" />
                      <path d="M12 8v8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Automated Collection</h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically gather feedback from forums, websites, and social media
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M2 12h20" />
                      <path d="M12 2v20" />
                      <path d="m4.93 4.93 14.14 14.14" />
                      <path d="m19.07 4.93-14.14 14.14" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Identify key themes, sentiment, and trends in your feedback
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2v8" />
                      <path d="m4.93 10.93 1.41 1.41" />
                      <path d="M2 18h2" />
                      <path d="M20 18h2" />
                      <path d="m19.07 10.93-1.41 1.41" />
                      <path d="M22 22H2" />
                      <path d="m8 22 4-10 4 10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Visual Reporting</h3>
                  <p className="text-muted-foreground text-sm">
                    View actionable insights with intuitive dashboards and reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 md:py-8">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold">Feedback Flow</h3>
              <p className="text-sm text-muted-foreground">
                Transform your feedback data into actionable insights with our AI-powered platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Company</h4>
                <div className="text-sm text-muted-foreground">About</div>
                <div className="text-sm text-muted-foreground">Contact</div>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Support</h4>
                <div className="text-sm text-muted-foreground">Documentation</div>
                <div className="text-sm text-muted-foreground">Help Center</div>
              </div>
            </div>
          </div>
          <div className="border-t py-6 text-center text-sm text-muted-foreground">
            © 2025 Feedback Flow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
