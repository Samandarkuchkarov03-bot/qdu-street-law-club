import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // The default Reset Password email uses ConfirmationURL. That redirect
    // returns an implicit grant in the URL hash. Parsing it here would sign
    // the user in on the Site URL (/ or /team) and drop the hash.
    detectSessionInUrl: false,
    flowType: "implicit",
  },
});
