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
    if (!user.value?.id) return null

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id,name,email,role,unit_id,approved')
      .eq('id', user.value.id)
      .maybeSingle()

    let unitName = ''
    if (profileData?.unit_id) {
      const { data: unitData } = await supabase
        .from('units')
        .select('name')
        .eq('id', profileData.unit_id)
        .maybeSingle()
      unitName = unitData?.name || ''
    }

    const profile: Profile = {
      id: user.value.id,
      name: profileData?.name || user.value.user_metadata?.name || 'Usuario',
      email: user.value.email || profileData?.email || '',
      role: profileData?.role || 'user',
      approved: profileData?.approved ?? false,
      unit_id: profileData?.unit_id || '',
      created_at: profileData?.created_at || '',
      units: { name: unitName }
    }

    currentProfile.value = profile
    return profile
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
