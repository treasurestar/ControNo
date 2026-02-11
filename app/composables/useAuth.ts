import type { Profile } from '~~/shared/types'

export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const currentProfile = useState<Profile | null>('currentProfile', () => null)

  const isAdmin = computed(() => {
    if (!currentProfile.value) return false
    return currentProfile.value.role === 'admin' || currentProfile.value.email === 'admin@controno.com.br'
  })

  async function fetchProfile() {
    if (!user.value?.id) {
      console.warn('[fetchProfile] No user.id, skipping')
      return null
    }

    try {
      // Get token from in-memory session (available immediately after signIn)
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      } else {
        console.warn('[fetchProfile] No access_token in session')
      }

      console.log('[fetchProfile] Calling /api/me for user:', user.value.id)
      const profileData = await $fetch('/api/me', { headers })
      console.log('[fetchProfile] Response:', JSON.stringify(profileData))

      if (!profileData) {
        console.warn('[fetchProfile] /api/me returned null')
        currentProfile.value = null
        return null
      }

      const profile: Profile = {
        id: profileData.id,
        name: profileData.name || user.value.user_metadata?.name || 'Usuario',
        email: profileData.email || user.value.email || '',
        role: profileData.role || 'user',
        approved: profileData.approved ?? true,
        unit_id: profileData.unit_id || '',
        created_at: profileData.created_at || '',
        units: { name: profileData.units?.name || '' }
      }

      console.log('[fetchProfile] Profile loaded, role:', profile.role)
      currentProfile.value = profile
      return profile
    } catch (err) {
      console.error('[fetchProfile] Error:', err)
      currentProfile.value = null
      return null
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const profile = await fetchProfile()
    if (profile && !profile.approved && profile.role !== 'admin') {
      await supabase.auth.signOut()
      currentProfile.value = null
      throw new Error('ACCOUNT_PENDING_APPROVAL')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    currentProfile.value = null
    await navigateTo('/login')
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return {
    user,
    currentProfile,
    isAdmin,
    fetchProfile,
    login,
    logout,
    resetPassword
  }
}
