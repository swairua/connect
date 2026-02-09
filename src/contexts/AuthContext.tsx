import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AppRole = 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer';

// Retry utility with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
}

interface UserRole {
  role: AppRole;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

interface TenantMembership {
  tenant_id: string;
  role: AppRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  tenants: Tenant[];
  currentTenant: Tenant | null;
  tenantMemberships: TenantMembership[];
  loading: boolean;
  userDataError: string | null;
  isSuperAdmin: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setCurrentTenant: (tenant: Tenant) => void;
  hasTenantRole: (role: AppRole) => boolean;
  refreshUserData: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantMemberships, setTenantMemberships] = useState<TenantMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDataError, setUserDataError] = useState<string | null>(null);

  const isSuperAdmin = roles.includes('super_admin');
  
  // User needs onboarding if they're logged in, not a super admin, and have no tenants
  const needsOnboarding = !!user && !isSuperAdmin && tenants.length === 0 && !loading;

  // Check if user has a specific role in the current tenant
  const hasTenantRole = (role: AppRole): boolean => {
    if (!currentTenant) return false;
    const membership = tenantMemberships.find(m => m.tenant_id === currentTenant.id);
    return membership?.role === role;
  };

  // Refresh user data (called after onboarding) - returns true if user has tenants after refresh
  const refreshUserData = async (): Promise<boolean> => {
    if (user) {
      setLoading(true);
      await fetchUserData(user.id);
      setLoading(false);
      // Return whether the user now has tenants (for immediate use after onboarding)
      const { data } = await supabase
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', user.id)
        .limit(1);
      return (data?.length ?? 0) > 0;
    }
    return false;
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch all data in parallel with retry logic
      await withRetry(async () => {
        const [profileResult, rolesResult, tenantMembersResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('user_roles').select('role').eq('user_id', userId),
          supabase.from('tenant_members').select('tenant_id, role').eq('user_id', userId),
        ]);

        // Check for errors on each result
        const errors = [];
        if (profileResult.error) {
          errors.push(`Profile: ${profileResult.error.message}`);
        }
        if (rolesResult.error) {
          errors.push(`Roles: ${rolesResult.error.message}`);
        }
        if (tenantMembersResult.error) {
          errors.push(`Tenants: ${tenantMembersResult.error.message}`);
        }

        // If any query failed, throw error for retry logic
        if (errors.length > 0) {
          throw new Error(errors.join('; '));
        }

        // Only set data if queries succeeded
        if (profileResult.data) {
          setProfile(profileResult.data as UserProfile);
        }

        if (rolesResult.data) {
          setRoles(rolesResult.data.map((r: UserRole) => r.role));
        }

        if (tenantMembersResult.data && tenantMembersResult.data.length > 0) {
          // Get unique tenant IDs
          const tenantIds = Array.from(new Set((tenantMembersResult.data as any[]).map(tm => tm.tenant_id)));

          // Fetch tenant details for all tenant IDs
          const { data: tenantsData, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .in('id', tenantIds);

          if (tenantsError) {
            throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
          }

          setTenants((tenantsData || []) as Tenant[]);

          const memberships = (tenantMembersResult.data as any[]).map((tm: any) => ({
            tenant_id: tm.tenant_id,
            role: tm.role as AppRole,
          }));
          setTenantMemberships(memberships);

          if (!currentTenant && tenantsData && tenantsData.length > 0) {
            setCurrentTenant(tenantsData[0] as Tenant);
          }
        } else {
          // Explicitly set empty arrays when no tenant data
          setTenants([]);
          setTenantMemberships([]);
        }

        // Clear error state on success
        setUserDataError(null);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching user data:', errorMessage);

      // Set error state
      setUserDataError(errorMessage);

      // Determine if current user is admin to show detailed error
      const isAdmin = roles.includes('super_admin') || roles.includes('admin');

      // Show appropriate toast based on user role
      if (isAdmin) {
        // Show detailed error for admins
        toast({
          title: "Server Error Loading Account Data",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Show generic error for regular users
        toast({
          title: "Server Error",
          description: "Unable to load your account data. Please try again or contact support.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            await fetchUserData(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setTenants([]);
          setTenantMemberships([]);
          setCurrentTenant(null);
          setUserDataError(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setTenants([]);
    setTenantMemberships([]);
    setCurrentTenant(null);
    setUserDataError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        tenants,
        currentTenant,
        tenantMemberships,
        loading,
        userDataError,
        isSuperAdmin,
        needsOnboarding,
        signIn,
        signUp,
        signOut,
        setCurrentTenant,
        hasTenantRole,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
