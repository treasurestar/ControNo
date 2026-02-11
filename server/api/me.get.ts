import { supabaseAdmin } from '~~/server/utils/supabase-admin'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // 1. Authenticate user: try cookies first, then Authorization header
    let userId: string | null = null

    try {
      const cookieUser = await serverSupabaseUser(event)
      userId = cookieUser?.id || null
      console.log('[/api/me] Cookie auth:', userId ? `OK ${userId}` : 'no id')
    } catch {
      console.log('[/api/me] Cookie auth failed, trying header...')
    }

    if (!userId) {
      const authHeader = getHeader(event, 'authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data, error: tokenError } = await supabaseAdmin.auth.getUser(token)
        if (tokenError) {
          console.error('[/api/me] Token auth failed:', tokenError.message)
        } else {
          userId = data.user?.id || null
          console.log('[/api/me] Token auth:', userId ? `OK ${userId}` : 'no id')
        }
      }
    }

    if (!userId) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    // 2. Query profile - try with approved, fallback without
    let { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id,name,email,role,unit_id,approved,units(name)')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('[/api/me] Query with approved failed:', error.message, '- trying without')
      const result = await supabaseAdmin
        .from('profiles')
        .select('id,name,email,role,unit_id,units(name)')
        .eq('id', userId)
        .maybeSingle()
      if (result.error) {
        console.error('[/api/me] Profile query failed:', result.error.message)
        throw createError({ statusCode: 500, message: result.error.message })
      }
      data = result.data ? { ...result.data, approved: true } : null
    }

    console.log('[/api/me] Result:', JSON.stringify(data))
    return data
  } catch (err: any) {
    // Re-throw createError instances, wrap unknown errors
    if (err.statusCode) throw err
    console.error('[/api/me] Unexpected error:', err)
    throw createError({ statusCode: 500, message: String(err) })
  }
})
