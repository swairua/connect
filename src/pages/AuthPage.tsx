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
      setIsLoading(false);
    } else {
      // Check if this is the bootstrap super admin account
      if (signupEmail === 'admin@example.com' && signupPassword === 'SuperAdmin123!') {
        toast({
          title: "Super Admin Account Created!",
          description: "Initializing system administrator privileges...",
        });

        // Wait for profile creation and then assign super admin role
        setTimeout(async () => {
          try {
            // Call the bootstrap_super_admin function via Supabase
            const { data, error: bootstrapError } = await supabase
              .rpc('bootstrap_super_admin', {
                admin_email: signupEmail,
                admin_full_name: signupFullName
              });

            if (bootstrapError) {
              console.error('Bootstrap error:', bootstrapError);
              toast({
                title: "Note",
                description: "Account created. Admin role will be assigned on next login.",
              });
            } else if (data && data[0]) {
              const result = data[0];
              if (result.success) {
                toast({
                  title: "System Administrator Ready",
                  description: "You are now a super admin. Redirecting to admin panel...",
                });
              }
            }

            // The auth context will handle the redirect based on role
          } catch (err) {
            console.error('Error assigning super admin role:', err);
            toast({
              title: "Info",
              description: "Admin setup will complete on next login.",
            });
          }
        }, 1000); // Wait 1 second for profile creation
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome! Let's set up your organization.",
        });
      }
      // Navigation to appropriate page will be handled by useEffect based on role
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
                    <div className={`p-3 rounded text-sm border ${
                      error.includes('does not exist') || error.includes('Database schema')
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <p className="font-semibold">
                        {error.includes('does not exist') || error.includes('Database schema')
                          ? '⚙️ Database Initialization Required'
                          : '❌ Login Error'}
                      </p>
                      <p className="mt-2 break-words font-mono text-xs leading-relaxed">{error}</p>
                      {(error.includes('Database schema') || error.includes('does not exist') || error.includes('relation')) && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium">Your database tables need to be initialized.</p>
                          <Button
                            type="button"
                            className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => navigate('/setup')}
                          >
                            Initialize Database
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {userDataError && (
                    <div className={`p-3 rounded text-sm border ${
                      userDataError.includes('does not exist') || userDataError.includes('Database schema')
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <p className="font-semibold">
                        {userDataError.includes('does not exist') || userDataError.includes('Database schema')
                          ? '⚙️ Database Setup Needed'
                          : '⚠️ Server Error'}
                      </p>
                      <p className="mt-2 break-words font-mono text-xs leading-relaxed">{userDataError}</p>
                      {(userDataError.includes('Database schema') || userDataError.includes('does not exist') || userDataError.includes('relation')) ? (
                        <Button
                          type="button"
                          className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigate('/setup')}
                        >
                          Initialize Database
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full text-xs"
                          onClick={async () => {
                            await refreshUserData();
                          }}
                          disabled={isLoading}
                        >
                          Retry
                        </Button>
                      )}
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
