import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lpoykzbvbrusrzhaoviy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3lremJ2YnJ1c3J6aGFvdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTAwNjIsImV4cCI6MjA2NzA4NjA2Mn0.E6T9EqlChK2nlYvlqFBrCydRnv4aFrv3uRBaQ5L8O_s'

export const supabase = createClient(supabaseUrl, supabaseKey)
