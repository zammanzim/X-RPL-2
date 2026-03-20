if (typeof window.supabaseClient === 'undefined') {

    const SUPABASE_URL = "https://wsywjfwdapnuxbwshkuz.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzeXdqZndkYXBudXhid3Noa3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzYyOTMsImV4cCI6MjA4MjA1MjI5M30.IkdxVGTH-X4G33BnYzwbERZRqlWxxOfOwPBzzALgaVw";

    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log("✅ Supabase Connected!");
}