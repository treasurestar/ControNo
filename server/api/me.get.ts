import { supabaseAdmin } from '~~/server/utils/supabase-admin'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Try serverSupabaseUser first (reads from cookies)
  let user = null
  try {
    user = await serverSupabaseUser(event)
    console.log('[/api/me] serverSupabaseUser OK:', user?.id)
  } catch (err) {
    console.warn('[/api/me] serverSupabaseUser failed:', err)
  }

  // Fallback: read Authorization header and verify token
  if (!user) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('[/api/me] Trying Authorization header fallback')
      const { data: { user: tokenUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token)
      if (tokenError) {
        console.error('[/api/me] Token verification failed:', tokenError.message)
      } else {
        user = tokenUser
        console.log('[/api/me] Token fallback OK:', user?.id)
      }
    }
  }

  if (!user) {
    console.error('[/api/me] No authenticated user found')
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,name,email,role,unit_id,approved,units(name)')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[/api/me] Profile query error:', error.message)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  console.log('[/api/me] Returning profile:', JSON.stringify(data))
  return data
})
