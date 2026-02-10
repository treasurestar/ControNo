import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,name,email,role,unit_id,approved,units(name)')
    .order('name', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
})
