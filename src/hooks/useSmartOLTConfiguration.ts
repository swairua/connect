import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ONTDevice {
  serial: string;
  name: string;
  status: string;
  signal: string;
  uptime: string;
  olt_id: string;
  pon_port: string;
  description: string;
}

export interface SmartOLTConfiguration {
  id: string;
  tenant_id: string;
  api_url: string | null;
  api_key: string | null;
  olt_device_id: string | null;
  default_service_profile: string | null;
  default_speed_profile: string | null;
  auto_provision_enabled: boolean;
  ont_password_pattern: string | null;
  default_vlan: string | null;
  billing_suspension_enabled: boolean;
  suspend_method: string | null;
  reactivate_method: string | null;
  is_connected: boolean | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmartOLTConfigurationInput {
  api_url: string;
  api_key: string;
  olt_device_id: string;
  default_service_profile: string;
  default_speed_profile: string;
  auto_provision_enabled: boolean;
  ont_password_pattern: string;
  default_vlan: string;
  billing_suspension_enabled: boolean;
  suspend_method: string;
  reactivate_method: string;
}

export function useSmartOLTConfiguration(tenantId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isFetchingONTs, setIsFetchingONTs] = useState(false);

  // Fetch configuration
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['smartolt-configuration', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('smartolt_configurations')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw error;
      return data as SmartOLTConfiguration | null;
    },
    enabled: !!tenantId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel('smartolt-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smartolt_configurations',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['smartolt-configuration', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  // Save configuration mutation
  const saveMutation = useMutation({
    mutationFn: async (input: SmartOLTConfigurationInput) => {
      if (!tenantId) throw new Error('No tenant ID');

      const configData = {
        tenant_id: tenantId,
        api_url: input.api_url || null,
        api_key: input.api_key || null,
        olt_device_id: input.olt_device_id || null,
        default_service_profile: input.default_service_profile || null,
        default_speed_profile: input.default_speed_profile || null,
        auto_provision_enabled: input.auto_provision_enabled,
        ont_password_pattern: input.ont_password_pattern || null,
        default_vlan: input.default_vlan || null,
        billing_suspension_enabled: input.billing_suspension_enabled,
        suspend_method: input.suspend_method || null,
        reactivate_method: input.reactivate_method || null,
      };

      if (config?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('smartolt_configurations')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('smartolt_configurations')
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'SmartOLT configuration has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['smartolt-configuration', tenantId] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (input: { api_url: string; api_key: string; olt_device_id?: string }) => {
      setIsTestingConnection(true);

      const { data, error } = await supabase.functions.invoke('test-smartolt-connection', {
        body: {
          api_url: input.api_url,
          api_key: input.api_key,
          olt_device_id: input.olt_device_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async (result) => {
      setIsTestingConnection(false);
      
      if (result.success) {
        toast({
          title: 'Connection successful',
          description: result.message || 'Successfully connected to SmartOLT API.',
        });

        // Update connection status in database
        if (config?.id) {
          await supabase
            .from('smartolt_configurations')
            .update({ 
              is_connected: true, 
              last_sync_at: new Date().toISOString() 
            })
            .eq('id', config.id);
          
          queryClient.invalidateQueries({ queryKey: ['smartolt-configuration', tenantId] });
        }
      } else {
        toast({
          title: 'Connection failed',
          description: result.error || 'Failed to connect to SmartOLT API.',
          variant: 'destructive',
        });

        // Update connection status
        if (config?.id) {
          await supabase
            .from('smartolt_configurations')
            .update({ is_connected: false })
            .eq('id', config.id);
          
          queryClient.invalidateQueries({ queryKey: ['smartolt-configuration', tenantId] });
        }
      }
    },
    onError: (error) => {
      setIsTestingConnection(false);
      toast({
        title: 'Connection test failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fetch ONTs query
  const { 
    data: ontsData, 
    isLoading: isLoadingONTs, 
    refetch: refetchONTs 
  } = useQuery({
    queryKey: ['smartolt-onts', tenantId, config?.api_url],
    queryFn: async () => {
      if (!config?.api_url || !config?.api_key || !config?.is_connected) {
        return { onts: [], total: 0 };
      }

      setIsFetchingONTs(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-smartolt-onts', {
          body: {
            api_url: config.api_url,
            api_key: config.api_key,
            olt_device_id: config.olt_device_id || undefined,
          },
        });

        if (error) throw error;
        
        if (data.success) {
          return { onts: data.onts as ONTDevice[], total: data.total };
        } else {
          console.error('Failed to fetch ONTs:', data.error);
          return { onts: [], total: 0 };
        }
      } finally {
        setIsFetchingONTs(false);
      }
    },
    enabled: !!config?.api_url && !!config?.api_key && !!config?.is_connected,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });

  // Manual refresh function
  const refreshONTs = useCallback(async () => {
    if (!config?.api_url || !config?.api_key) {
      toast({
        title: 'Cannot refresh ONTs',
        description: 'Please configure SmartOLT API settings first.',
        variant: 'destructive',
      });
      return;
    }

    setIsFetchingONTs(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-smartolt-onts', {
        body: {
          api_url: config.api_url,
          api_key: config.api_key,
          olt_device_id: config.olt_device_id || undefined,
        },
      });

      if (error) throw error;

      if (data.success) {
        queryClient.setQueryData(['smartolt-onts', tenantId, config.api_url], {
          onts: data.onts,
          total: data.total,
        });
        toast({
          title: 'ONT data refreshed',
          description: `Loaded ${data.total} ONT devices from SmartOLT.`,
        });
      } else {
        toast({
          title: 'Failed to refresh ONTs',
          description: data.error || 'Unknown error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error refreshing ONTs',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingONTs(false);
    }
  }, [config, tenantId, queryClient, toast]);

  return {
    config,
    isLoading,
    error,
    isSaving: saveMutation.isPending,
    isTestingConnection,
    saveConfig: saveMutation.mutate,
    testConnection: testConnectionMutation.mutate,
    // ONT data
    onts: ontsData?.onts || [],
    totalONTs: ontsData?.total || 0,
    isLoadingONTs: isLoadingONTs || isFetchingONTs,
    refreshONTs,
  };
}
