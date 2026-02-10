import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async () => {
  const { data, error } = await supabaseAdmin
    .from('units')
    .select('id,name,created_at')
    .order('name', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
})
