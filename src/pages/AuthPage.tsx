import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Wifi, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading, isSuperAdmin, needsOnboarding, userDataError, refreshUserData } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state - empty on initial load
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  useEffect(() => {
    if (user && !authLoading) {
      // Redirect super admins to super admin dashboard
      if (isSuperAdmin) {
        navigate("/super-admin");
      } else if (needsOnboarding) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    }
  }, [user, authLoading, isSuperAdmin, needsOnboarding, navigate]);

  // Show connection status toast on page load
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        toast({
          title: "Connected",
          description: `Logged in as ${user.email}`,
        });
      } else {
        toast({
          title: "Not Connected",
          description: "Please log in or create an account to continue",
        });
      }
    }
  }, []);

  const createTestUser = async () => {
    const testEmail = "gichukisimon@gmail.com";
    const testPassword = "Password123";

    try {
      setIsCreatingTestUser(true);

      // Try to check if test user exists by attempting signup
      const { error: signupError } = await signUp(testEmail, testPassword, "Test User");

      if (signupError) {
        // If user already exists, that's fine - we'll use the existing account
        if (signupError.message && signupError.message.includes("already registered")) {
          toast({
            title: "Test User Exists",
            description: "Test user already exists. Auto-filling form with credentials...",
          });
        } else if (signupError.message && signupError.message.includes("Database error")) {
          // Database error (missing tables) - still allow user to try to sign in
          toast({
            title: "Note: Database Setup Required",
            description: "The test user account may not be fully set up yet. Check that all database tables exist.",
            variant: "destructive",
          });
        } else {
          // Other signup error
          throw signupError;
        }
      } else {
        // Signup succeeded - new test user created
        toast({
          title: "Test User Created",
          description: "New test user created successfully!",
        });
      }

      // Auto-fill the login form with test credentials
      setLoginEmail(testEmail);
      setLoginPassword(testPassword);

      toast({
        title: "Form Auto-Filled",
        description: `Form filled with test credentials: ${testEmail}. Click Sign In to continue.`,
      });
    } catch (error: any) {
      toast({
        title: "Error with Test User",
        description: error.message || "Unable to prepare test user. You can try to sign in manually.",
        variant: "destructive",
      });
      console.error("Error with test user:", error);
    } finally {
      setIsCreatingTestUser(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.success) {
      const errorMsg = validation.error.errors[0].message;
      setError(errorMsg);
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      // Check if this is a database schema error
      if (error.message.includes('Database tables not found') ||
          error.message.includes('relation') ||
          error.message.includes('does not exist')) {
        setError(error.message);
        toast({
          title: "Database Not Initialized",
          description: "Please set up your database first.",
          variant: "destructive",
        });
        // Redirect to setup page
        setTimeout(() => {
          navigate('/setup');
        }, 1500);
      } else {
        const errorMsg = error.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : `${error.message}`;
        setError(errorMsg);
        toast({
          title: "Login Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } else {
      setError(null);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Navigation will be handled by useEffect based on role
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({
      email: signupEmail,
      password: signupPassword,
      fullName: signupFullName,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(signupEmail, signupPassword, signupFullName);
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("already registered")) {
        errorMessage = "This email is already registered. Please login instead.";
      }
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome! Let's set up your organization.",
      });
      // Navigation to onboarding will be handled by useEffect
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Wifi className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ISP Billing System</h1>
          <p className="text-muted-foreground mt-2">Multi-tenant Internet Service Provider Management</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login" className="m-0">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center">
                    Enter your credentials to access your dashboard
                  </CardDescription>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <p className="font-semibold">Error:</p>
                      <p className="mt-1 break-words font-mono text-xs">{error}</p>
                      {(error.includes('Database tables not found') || error.includes('does not exist')) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full text-xs bg-white hover:bg-gray-50"
                          onClick={() => navigate('/setup')}
                        >
                          Set Up Database
                        </Button>
                      )}
                    </div>
                  )}

                  {userDataError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      <p className="font-semibold">Server Error:</p>
                      <p className="mt-1 break-words font-mono text-xs">{userDataError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full text-xs"
                        onClick={async () => {
                          await refreshUserData();
                        }}
                        disabled={isLoading}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Debug Button - Test User Creation */}
                  <div className="pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={createTestUser}
                      disabled={isCreatingTestUser || isLoading}
                    >
                      {isCreatingTestUser ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Test User...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Create Test User (Debug)
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="m-0">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center">
                    Create an account to get started
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Multi-tenant ISP Management Platform
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
