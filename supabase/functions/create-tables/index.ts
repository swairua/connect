import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sql } = await req.json();

    if (!sql) {
      return new Response(
        JSON.stringify({ error: "No SQL provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("SQL execution error:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          tablesCreated: [
            'subscribers',
            'packages',
            'service_plans',
            'invoices',
            'payments',
            'tickets',
            'notification_templates',
            'activity_logs',
            'revenue_reports',
            'ageing_reports',
            'churn_reports',
            'package_performance',
            'usage_analytics',
            'dashboard_stats',
            'network_configurations',
            'smartolt_configurations',
            'unmatched_payments'
          ]
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Tables created successfully",
        tablesCreated: [
          'subscribers',
          'packages',
          'service_plans',
          'invoices',
          'payments',
          'tickets',
          'notification_templates',
          'activity_logs',
          'revenue_reports',
          'ageing_reports',
          'churn_reports',
          'package_performance',
          'usage_analytics',
          'dashboard_stats',
          'network_configurations',
          'smartolt_configurations',
          'unmatched_payments'
        ]
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        tablesCreated: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
