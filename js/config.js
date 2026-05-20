// ================================================================
//  NestVault — Supabase config & shared state
// ================================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL  = 'https://duafopsvmyhmqoxsajwz.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1YWZvcHN2bXlobXFveHNhand6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTc4OTEsImV4cCI6MjA5NDc3Mzg5MX0.3M0wAugi8Q_d_8slrTMO3wOXnp2okP59hCOmIUqaieI';
export const BUCKET        = 'Images_Property';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// Shared mutable state
export const state = {
  user:    null,   // Supabase auth user
  profile: null,   // profiles row
  chatSub: null,   // active realtime channel
};
