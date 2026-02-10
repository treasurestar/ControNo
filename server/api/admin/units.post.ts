import { supabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name } = body || {}

  if (!name || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome da unidade é obrigatório.' })
  }

  const { data, error } = await supabaseAdmin
    .from('units')
    .insert({ name: name.trim() })
    .select('id,name,created_at')
    .single()

  if (error) {
    const msg = error.code === '23505'
      ? 'Já existe uma unidade com esse nome.'
      : error.message
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  return data
})
