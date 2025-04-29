
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { sourceId, action } = await req.json();

    if (!sourceId) {
      return new Response(
        JSON.stringify({ error: 'Source ID is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get the data source
    const { data: source, error: sourceError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      console.error('Error fetching source:', sourceError);
      return new Response(
        JSON.stringify({ error: 'Data source not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Simulate the agent process
    let newStatus = 'collecting';
    if (action === 'collect') {
      newStatus = 'collecting';
    } else if (action === 'process') {
      newStatus = 'processing';
    } else if (action === 'analyze') {
      newStatus = 'analyzing';
    } else if (action === 'complete') {
      newStatus = 'completed';
    }

    // Update the data source status
    const { data: updatedSource, error: updateError } = await supabase
      .from('data_sources')
      .update({ status: newStatus })
      .eq('id', sourceId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating source:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update data source' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: `Agent action '${action}' triggered successfully`,
        source: updatedSource
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
