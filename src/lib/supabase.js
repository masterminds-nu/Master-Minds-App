import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ulorlqdltddtabvvxhhp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsb3JscWRsdGRkdGFidnZ4aGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzU3ODEsImV4cCI6MjA3NDExMTc4MX0.8Dw1ctGAk_oMO3mztg3mOK2EjxjACBIMWeOXAXS8adE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
