import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id!)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { ok: true }
})
