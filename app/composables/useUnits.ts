import type { Unit } from '~~/shared/types'

export function useUnits() {
  const units = useState<Unit[]>('units', () => [])
  const selectedUnitId = useState<string | null>('selectedUnitId', () => null)

  const selectedUnit = computed(() => {
    if (!selectedUnitId.value) return null
    return units.value.find(u => u.id === selectedUnitId.value) || null
  })

  function selectUnit(unitId: string | null) {
    selectedUnitId.value = unitId
    if (import.meta.client && unitId) {
      localStorage.setItem('adminSelectedUnitId', unitId)
    }
  }

  function restoreSelectedUnit() {
    if (import.meta.client && !selectedUnitId.value) {
      const saved = localStorage.getItem('adminSelectedUnitId')
      if (saved && units.value.some(u => u.id === saved)) {
        selectedUnitId.value = saved
      }
    }
  }

  async function fetchUnits() {
    try {
      const data = await $fetch<Unit[]>('/api/units')
      units.value = data || []
      restoreSelectedUnit()
    } catch (e) {
      console.error(e)
      units.value = []
    }
  }

  async function getUnitIdByName(name: string): Promise<string | null> {
    if (!name) return null
    const found = units.value.find(u => u.name === name)
    return found?.id || null
  }

  async function addUnit(name: string) {
    const data = await $fetch('/api/admin/units', {
      method: 'POST',
      body: { name }
    })
    await fetchUnits()
    return data
  }

  async function deleteUnit(id: string) {
    await $fetch(`/api/admin/units/${id}`, { method: 'DELETE' })
    await fetchUnits()
  }

  return { units, selectedUnitId, selectedUnit, selectUnit, fetchUnits, getUnitIdByName, addUnit, deleteUnit }
}
