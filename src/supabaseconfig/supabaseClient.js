import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yujyexkjxzrguxssxyfk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1anlleGtqeHpyZ3V4c3N4eWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTg4NjIsImV4cCI6MjA3NzU3NDg2Mn0.4aqLq173zeC-y25FxfA0RMamK3h1B8GIV4e6-ktLRsc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
