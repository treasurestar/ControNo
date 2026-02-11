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
    try {
      // Get session from Supabase client (handles token refresh automatically)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user?.id) {
        console.warn('[fetchProfile] No session/user, skipping')
        return null
      }

      console.log('[fetchProfile] Querying profile for:', session.user.id)

      // Query profile directly via Supabase client (uses RLS, no server endpoint needed)
      let profileData: any = null

      const { data, error } = await supabase
        .from('profiles')
        .select('id,name,email,role,unit_id,approved,units(name)')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.warn('[fetchProfile] Query failed:', error.message, '- retrying without approved')
        // Fallback: approved column might not exist
        const { data: fallback, error: fallbackErr } = await supabase
          .from('profiles')
          .select('id,name,email,role,unit_id,units(name)')
          .eq('id', session.user.id)
          .maybeSingle()
        if (fallbackErr || !fallback) {
          console.error('[fetchProfile] Fallback also failed:', fallbackErr?.message)
          currentProfile.value = null
          return null
        }
        profileData = { ...fallback, approved: true }
      } else {
        profileData = data
      }

      if (!profileData) {
        console.warn('[fetchProfile] No profile found')
        currentProfile.value = null
        return null
      }

      const profile: Profile = {
        id: profileData.id,
        name: profileData.name || session.user.user_metadata?.name || 'Usuario',
        email: profileData.email || session.user.email || '',
        role: profileData.role || 'user',
        approved: profileData.approved ?? true,
        unit_id: profileData.unit_id || '',
        created_at: profileData.created_at || '',
        units: { name: profileData.units?.name || '' }
      }

      console.log('[fetchProfile] Profile loaded, role:', profile.role, 'approved:', profile.approved)
      currentProfile.value = profile
      return profile
    } catch (err: any) {
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
