import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export type TestMode = 'cloud' | 'local';

export interface NetworkConfiguration {
  id: string;
  tenant_id: string;
  router_type: string;
  connection_mode: string;
  router_host: string | null;
  api_port: number | null;
  username: string | null;
  password: string | null;
  is_connected: boolean;
  api_version: string | null;
  active_sessions: number;
  last_sync_at: string | null;
  test_mode: TestMode;
  created_at: string;
  updated_at: string;
}

export interface NetworkConfigurationInput {
  router_type: string;
  connection_mode: string;
  router_host: string;
  api_port: number;
  username: string;
  password: string;
  test_mode?: TestMode;
}

interface MikrotikConnectionResponse {
  success: boolean;
  message: string;
  apiVersion?: string;
  activeSessions?: number;
  error?: string;
}

export function useNetworkConfiguration() {
  const { currentTenant } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tenantId = currentTenant?.id;

  const {
    data: config,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["network-configuration", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from("network_configurations")
        .select("*")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (error) throw error;
      return data as NetworkConfiguration | null;
    },
    enabled: !!tenantId,
  });

  // Subscribe to realtime updates for this tenant's network configuration
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`network-config-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'network_configurations',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('Network config realtime update:', payload);
          // Invalidate the query to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ["network-configuration", tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (input: NetworkConfigurationInput) => {
      if (!tenantId) throw new Error("No tenant selected");

      // Check if config exists
      const { data: existing } = await supabase
        .from("network_configurations")
        .select("id")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("network_configurations")
          .update({
            router_type: input.router_type,
            connection_mode: input.connection_mode,
            router_host: input.router_host,
            api_port: input.api_port,
            username: input.username,
            password: input.password,
            test_mode: input.test_mode || 'cloud',
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("network_configurations")
          .insert({
            tenant_id: tenantId,
            router_type: input.router_type,
            connection_mode: input.connection_mode,
            router_host: input.router_host,
            api_port: input.api_port,
            username: input.username,
            password: input.password,
            test_mode: input.test_mode || 'cloud',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-configuration", tenantId] });
      toast({
        title: "Settings Saved",
        description: "Network configuration has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save network configuration.",
        variant: "destructive",
      });
    },
  });

  // Local browser-based connection test (reachability check via HTTP)
  const testLocalConnection = async (): Promise<MikrotikConnectionResponse> => {
    if (!config?.router_host) {
      throw new Error("Router host is required");
    }

    const host = config.router_host;
    const port = config.api_port || 80;
    
    // Try common Mikrotik web interface ports
    const testUrls = [
      `http://${host}:80`,
      `http://${host}:${port}`,
      `https://${host}:443`,
    ];

    for (const url of testUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // In no-cors mode, we can't read the response, but if we got here without error,
        // it means the server responded (reachable)
        return {
          success: true,
          message: `Router at ${host} is reachable (local network test)`,
          apiVersion: 'Local Test',
          activeSessions: 0,
        };
      } catch (fetchError) {
        // Continue to next URL
        continue;
      }
    }

    throw new Error(`Cannot reach router at ${host}. Make sure you're on the same network.`);
  };

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId || !config) throw new Error("No configuration to test");

      const testMode = config.test_mode || 'cloud';
      let data: MikrotikConnectionResponse;

      if (testMode === 'local') {
        // Use browser-based local testing
        data = await testLocalConnection();
      } else {
        // Use cloud edge function for testing
        const result = await supabase.functions.invoke<MikrotikConnectionResponse>(
          'test-mikrotik-connection',
          {
            body: {
              host: config.router_host,
              port: config.api_port,
              username: config.username,
              password: config.password,
            },
          }
        );

        if (result.error) throw new Error(result.error.message || 'Failed to test connection');
        if (!result.data) throw new Error('No response from connection test');

        if (!result.data.success) {
          throw new Error(result.data.error || result.data.message || 'Connection failed');
        }

        data = result.data;
      }

      // Update connection status in database
      const { error: updateError } = await supabase
        .from("network_configurations")
        .update({
          is_connected: true,
          api_version: data.apiVersion || null,
          active_sessions: data.activeSessions || 0,
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["network-configuration", tenantId] });
      toast({
        title: "Connection Successful",
        description: `Connected to ${config?.router_host}. ${data.apiVersion || ''}`,
      });
    },
    onError: (error: Error) => {
      // Update database to show disconnected
      if (config?.id) {
        supabase
          .from("network_configurations")
          .update({ is_connected: false })
          .eq("id", config.id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["network-configuration", tenantId] });
          });
      }

      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to router.",
        variant: "destructive",
      });
    },
  });

  return {
    config,
    isLoading,
    error,
    saveConfig: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    testConnection: testConnectionMutation.mutate,
    isTesting: testConnectionMutation.isPending,
    hasConfig: !!config,
  };
}
