import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, autoConfirm, isAdmin } = body || {}

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email e senha são obrigatórios.' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'A senha deve ter no mínimo 6 caracteres.' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: !!autoConfirm
  })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  const role = isAdmin ? 'admin' : 'user'
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      email,
      role,
      approved: true
    })
    .eq('id', data.user.id)

  if (profileError) {
    throw createError({ statusCode: 400, statusMessage: profileError.message })
  }

  return { id: data.user.id, email, role }
})
