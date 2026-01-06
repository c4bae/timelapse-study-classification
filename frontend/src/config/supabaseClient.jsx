import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/clerk-react'

export default function createClerkSupabaseClient () {
    const supabaseURL = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    const { session } = useSession()
    
    return createClient(supabaseURL, supabaseKey, {
        async accessToken() {
            return session?.getToken() ?? null
        }
    },)
}