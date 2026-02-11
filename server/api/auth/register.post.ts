import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, unit_id } = body || {}

  if (!name || !email || !password || !unit_id) {
    throw createError({ statusCode: 400, message: 'Todos os campos são obrigatórios.' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'A senha deve ter no mínimo 6 caracteres.' })
  }

  // Verify unit exists
  const { data: unit } = await supabaseAdmin
    .from('units')
    .select('id')
    .eq('id', unit_id)
    .maybeSingle()

  if (!unit) {
    throw createError({ statusCode: 400, message: 'Unidade inválida.' })
  }

  // Use regular client (anon key) so Supabase sends confirmation email via SMTP
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  )

  // Redirect to /confirm after email verification
  const origin = getRequestURL(event).origin

  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      emailRedirectTo: `${origin}/confirm`
    }
  })

  if (error) {
    const msg = error.message.includes('already been registered')
      ? 'Este email já está cadastrado.'
      : error.message
    throw createError({ statusCode: 400, message: msg })
  }

  if (!data.user) {
    throw createError({ statusCode: 400, message: 'Erro ao criar usuário.' })
  }

  // Update profile with name, unit, and approved: false
  // (trigger handle_new_user already created the profile row)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      unit_id,
      approved: false
    })
    .eq('id', data.user.id)

  if (profileError) {
    throw createError({ statusCode: 400, message: profileError.message })
  }

  return { ok: true }
})
