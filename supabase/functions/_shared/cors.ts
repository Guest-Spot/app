const LOCAL_URL = 'http://localhost:9000';
const STAGING_URL = 'https://guest-spot.vercel.app';
const PRODUCTION_URL = 'https://guest-spot.vercel.app';

const allowed = new Set([
  LOCAL_URL,
  STAGING_URL,
  PRODUCTION_URL
]);
export const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': allowed.has(origin) ? origin : PRODUCTION_URL,
  'Vary': 'Origin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
});
