export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/login')
  }

  const { currentProfile, fetchProfile } = useAuth()
  if (!currentProfile.value) {
    await fetchProfile()
  }

  if (!currentProfile.value || (currentProfile.value.role !== 'admin' && currentProfile.value.email !== 'admin@controno.com.br')) {
    return navigateTo('/dashboard')
  }
})
