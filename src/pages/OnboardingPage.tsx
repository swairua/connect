import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Wifi, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const tenantSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  slug: z.string()
    .trim()
    .min(2, "URL slug must be at least 2 characters")
    .max(50, "URL slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "URL slug can only contain lowercase letters, numbers, and hyphens"),
});

const OnboardingPage = () => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refreshUserData, tenants, needsOnboarding, loading: authLoading } = useAuth();

  // Redirect if user already has a tenant (but not during submission flow)
  useEffect(() => {
    if (!hasSubmitted && !authLoading && !needsOnboarding && tenants.length > 0) {
      navigate("/", { replace: true });
    }
  }, [needsOnboarding, tenants, navigate, authLoading, hasSubmitted]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    if (!slug || slug === generateSlug(name.slice(0, -1))) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = tenantSchema.safeParse({ name, slug });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_tenant_for_user', {
        _tenant_name: name.trim(),
        _tenant_slug: slug.trim(),
      });

      if (error) {
        if (error.message.includes('already taken')) {
          toast({
            title: "Slug Already Taken",
            description: "This organization URL is already in use. Please choose a different one.",
            variant: "destructive",
          });
        } else if (error.message.includes('already belongs')) {
          toast({
            title: "Already Onboarded",
            description: "You already belong to an organization.",
            variant: "destructive",
          });
          navigate("/");
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Organization Created!",
        description: `Welcome to ${name}. You're now the admin of your ISP organization.`,
      });

      // Mark as submitted to prevent useEffect redirect interference
      setHasSubmitted(true);

      // Refresh user data and navigate immediately after confirmation
      if (refreshUserData) {
        const hasTenants = await refreshUserData();
        if (hasTenants) {
          navigate("/", { replace: true });
          return;
        }
      }

      // Fallback navigation
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <Wifi className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="text-2xl font-bold text-white">NetFlow ISP</span>
        </div>

        <Card className="border-border/50 bg-card/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Building2 className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="text-2xl">Create Your Organization</CardTitle>
            <CardDescription className="text-base">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! Set up your ISP organization to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Internet Services"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={loading}
                  className="h-11"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  The name of your ISP or internet service company
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Organization URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">netflow.app/</span>
                  <Input
                    id="slug"
                    placeholder="acme-internet"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    disabled={loading}
                    className="h-11 flex-1"
                    maxLength={50}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  A unique URL identifier for your organization
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-6"
                disabled={loading || !name.trim() || !slug.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Organization...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                You'll be set up as the admin of this organization and can invite team members later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;