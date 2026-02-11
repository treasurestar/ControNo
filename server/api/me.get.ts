import { supabaseAdmin } from '~~/server/utils/supabase-admin'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,name,email,role,unit_id,approved,units(name)')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
