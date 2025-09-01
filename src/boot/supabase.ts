import { boot } from 'quasar/wrappers'
import { createClient } from '@supabase/supabase-js'
import { API_URL, API_KEY } from 'src/config/constants'


export default boot(({ app }) => {
  if (!API_URL || !API_KEY) {
    throw new Error('API_URL and API_KEY are required')
  }
  const supabase = createClient(API_URL, API_KEY)
  app.provide('supabase', supabase);
})
