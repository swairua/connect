import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Copy, CheckCircle, ExternalLink, Database, Loader2 } from "lucide-react";
import { databaseMigrations } from "@/integrations/supabase/migrations";
import { checkDatabaseStatus } from "@/utils/initializeDatabase";

const DatabaseSetupPage = () => {
  const [status, setStatus] = useState<"checking" | "not-initialized" | "initialized">("checking");
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [verifiedTables, setVerifiedTables] = useState<string[]>([]);

  useEffect(() => {
    const check = async () => {
      setIsChecking(true);
      const result = await checkDatabaseStatus();
      setVerifiedTables(result.tables);
      
      if (result.initialized) {
        setStatus("initialized");
      } else {
        setStatus("not-initialized");
      }
      setIsChecking(false);
    };

    check();
    // Recheck every 10 seconds
    const interval = setInterval(check, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(databaseMigrations);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Migration SQL copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const retryCheck = async () => {
    setIsChecking(true);
    const result = await checkDatabaseStatus();
    setVerifiedTables(result.tables);
    
    if (result.initialized) {
      setStatus("initialized");
      toast({
        title: "Success",
        description: "Database is now properly initialized!",
      });
    } else {
      toast({
        title: "Still Initializing",
        description: "Database tables not yet detected. Please check the SQL Editor.",
        variant: "destructive",
      });
    }
    setIsChecking(false);
  };

  if (status === "initialized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="border-green-200 bg-green-50 shadow-xl max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle>Database Initialized Successfully</CardTitle>
            <CardDescription>Your database is ready to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Verified Tables:</p>
              <div className="grid grid-cols-2 gap-2">
                {verifiedTables.map((table) => (
                  <div key={table} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✓ {table}
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = "/"} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Database Setup Required</h1>
          <p className="text-muted-foreground mt-2">
            Your Supabase database needs to be initialized before you can use the app
          </p>
        </div>

        <Card className="shadow-xl border-yellow-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Setup Instructions</CardTitle>
            </div>
            <CardDescription>
              Follow these steps to initialize your database
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="sql">SQL Code</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="space-y-6 mt-6">
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                        1
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground">Open Supabase Dashboard</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Go to your Supabase project dashboard
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open('https://app.supabase.com', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Supabase
                      </Button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                        2
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground">Navigate to SQL Editor</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        In your project, go to the "SQL Editor" section from the left menu
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                        3
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground">Create a New Query</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click the "New query" button to create a new SQL query
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                        4
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground">Copy and Run the Migration SQL</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Copy the SQL code from the "SQL Code" tab, paste it into the query editor, and click "Run"
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                        5
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground">Verify and Return</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Once the migration completes, click "Check Database" below to verify
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Tip:</span> The migration will create all necessary tables for user authentication, multi-tenant support, billing, and reporting.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="sql" className="space-y-4 mt-6">
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-96">
                  <pre>{databaseMigrations.substring(0, 500)}...</pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  Showing first 500 characters. Full migration SQL will be copied to clipboard.
                </p>
                <Button 
                  onClick={copyToClipboard}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy Full SQL to Clipboard"}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Check Status */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-4">Database Status</p>
              {isChecking ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking database status...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Tables verified: <span className="font-semibold text-green-600">{verifiedTables.length}</span>
                    </p>
                    {verifiedTables.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {verifiedTables.map((table) => (
                          <div key={table} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            ✓ {table}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={retryCheck}
                    variant="outline"
                    className="w-full mt-4"
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Database Status"
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSetupPage;
