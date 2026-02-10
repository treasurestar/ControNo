import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUnitIdByName(name: string): Promise<string | null> {
  if (!name) return null
  const { data, error } = await supabaseAdmin
    .from('units')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (error) throw error
  return data?.id || null
}
