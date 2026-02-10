export function useTheme() {
  const theme = useState<'light' | 'dark'>('theme', () => 'light')

  function initTheme() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
      theme.value = saved || 'light'
      applyTheme()
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
    if (import.meta.client) {
      localStorage.setItem('theme', theme.value)
    }
  }

  function applyTheme() {
    if (import.meta.client) {
      const html = document.documentElement
      if (theme.value === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }

  return { theme, initTheme, toggleTheme }
}
