import { supabaseAdmin, getUnitIdByName } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { name, unitName, role, password } = body || {}

  const unitId = await getUnitIdByName(unitName)
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      name: name || null,
      role: role || 'user',
      unit_id: unitId
    })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  if (password) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id!, {
      password
    })
    if (authError) {
      throw createError({ statusCode: 400, statusMessage: authError.message })
    }
  }

  return { ok: true }
})
