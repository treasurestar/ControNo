import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const { error } = await supabaseAdmin
    .from('units')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { ok: true }
})
