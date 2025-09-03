// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const artistUuid = pathParts[pathParts.length - 1];

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders(origin)
    });
  }

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? ''
        }
      }
    });

    const viewFields = 'uuid, title, description, location, date, startTime, endTime, status, artistUuid';

    if (!artistUuid || artistUuid === 'artistTrips') {
      return new Response(JSON.stringify({
        message: 'Artist UUID is required'
      }), {
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    const { data, error } = await supabase
      .from('trips')
      .select(viewFields)
      .eq('artistUuid', artistUuid);

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      message: err?.message ?? String(err)
    }), {
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
