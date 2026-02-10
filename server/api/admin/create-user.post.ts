import { supabaseAdmin, getUnitIdByName } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, unitName, role } = body || {}

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email e senha são obrigatórios.' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  const unitId = await getUnitIdByName(unitName)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      name: name || null,
      email,
      role: role || 'user',
      unit_id: unitId,
      approved: true
    })
    .eq('id', data.user.id)

  if (profileError) {
    throw createError({ statusCode: 400, statusMessage: profileError.message })
  }

  return { id: data.user.id }
})
