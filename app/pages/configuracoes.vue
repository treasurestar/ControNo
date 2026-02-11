<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
      <div>
        <h2 class="text-xl font-semibold" style="color: var(--text-primary);">Configurações</h2>
        <p class="text-sm" style="color: var(--text-secondary);">Gerencie usuários, unidades e relatórios.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="py-2.5 px-4 rounded-lg text-sm cursor-pointer transition-all"
          :style="{
            background: activeTab === tab.id ? 'rgba(139, 115, 85, 0.1)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === tab.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
            color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)'
          }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Approval Tab -->
    <div v-if="activeTab === 'approval'" class="flex flex-col gap-4">
      <div class="card">
        <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h3 class="font-semibold" style="color: var(--text-primary);">Usuários aguardando aprovação</h3>
          <span class="text-[13px]" style="color: var(--text-secondary);">{{ pendingUsers.length }} pendente(s)</span>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in pendingUsers" :key="u.id">
                <td>{{ u.name || '-' }}</td>
                <td>{{ u.email || '-' }}</td>
                <td>{{ u.units?.name || '-' }}</td>
                <td class="flex gap-2">
                  <button
                    class="py-1.5 px-3 rounded text-xs font-medium cursor-pointer transition-colors text-white"
                    style="background-color: var(--ok-color); border: none;"
                    @click="handleApprove(u)"
                  >
                    Aprovar
                  </button>
                  <button
                    class="py-1.5 px-3 rounded text-xs font-medium cursor-pointer transition-colors text-white"
                    style="background-color: var(--vencido-color); border: none;"
                    @click="handleReject(u)"
                  >
                    Recusar
                  </button>
                </td>
              </tr>
              <tr v-if="pendingUsers.length === 0">
                <td colspan="4" class="text-[13px]" style="color: var(--text-secondary);">Nenhum usuário pendente de aprovação.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="flex flex-col gap-4">
      <UserForm @created="loadUsers" />

      <div class="card">
        <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h3 class="font-semibold" style="color: var(--text-primary);">Usuários cadastrados</h3>
          <span class="text-[13px]" style="color: var(--text-secondary);">{{ filteredUsers.length }} de {{ users.length }} usuários</span>
        </div>

        <!-- Filters -->
        <div
          class="flex items-center gap-3 mb-4 flex-wrap"
        >
          <div
            class="flex items-center gap-2 flex-1 min-w-[200px] rounded-lg py-2.5 px-3"
            style="background: var(--bg-primary); border: 1px solid var(--border-color);"
          >
            <svg class="w-4 h-4 flex-shrink-0" style="color: var(--text-secondary);" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input
              v-model="userSearch"
              type="text"
              class="flex-1 border-none bg-transparent text-sm outline-none"
              style="color: var(--text-primary);"
              placeholder="Buscar por nome ou email..."
            />
          </div>
          <select
            v-model="userFilterUnit"
            class="form-input w-auto min-w-[160px]"
          >
            <option value="">Todas as unidades</option>
            <option v-for="unit in units" :key="unit.id" :value="unit.name">{{ unit.name }}</option>
          </select>
          <select
            v-model="userFilterRole"
            class="form-input w-auto min-w-[130px]"
          >
            <option value="">Todos os perfis</option>
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Unidade</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u.id">
                <td>{{ u.name || '-' }}</td>
                <td>{{ u.email || '-' }}</td>
                <td>{{ u.units?.name || '-' }}</td>
                <td>{{ isUserAdmin(u) ? 'Admin' : 'Usuário' }}</td>
                <td>
                  <template v-if="isUserAdmin(u)">
                    <span class="text-[13px]" style="color: var(--text-secondary);">Protegido</span>
                  </template>
                  <template v-else>
                    <button class="table-action" @click="openUserEdit(u)">Editar</button>
                    <button class="table-action table-action-delete" @click="handleDeleteUser(u)">Excluir</button>
                  </template>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="text-[13px]" style="color: var(--text-secondary);">Nenhum usuário encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Units Tab -->
    <div v-if="activeTab === 'units'" class="flex flex-col gap-4">
      <!-- Criar unidade -->
      <div class="card">
        <h3 class="mb-4 font-semibold" style="color: var(--text-primary);">Adicionar unidade</h3>
        <form class="flex gap-3 items-end flex-wrap" @submit.prevent="handleAddUnit">
          <div class="flex-1 min-w-[200px]">
            <label class="block mb-2 text-sm font-medium" style="color: var(--text-primary);">Nome da unidade</label>
            <input v-model="newUnitName" type="text" class="form-input" placeholder="Ex: BDN Nova Unidade" required />
          </div>
          <button type="submit" class="btn-primary w-auto px-6" :disabled="addingUnit">
            {{ addingUnit ? 'Adicionando...' : 'Adicionar' }}
          </button>
        </form>
      </div>

      <!-- Lista de unidades -->
      <div class="card">
        <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h3 class="font-semibold" style="color: var(--text-primary);">Unidades cadastradas</h3>
          <span class="text-[13px]" style="color: var(--text-secondary);">{{ units.length }} unidades</span>
        </div>
        <div class="w-full overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in units" :key="unit.id">
                <td>{{ unit.name }}</td>
                <td>
                  <button class="table-action table-action-delete" @click="handleDeleteUnit(unit)">Excluir</button>
                </td>
              </tr>
              <tr v-if="units.length === 0">
                <td colspan="2" class="text-[13px]" style="color: var(--text-secondary);">Nenhuma unidade cadastrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Produtos por unidade -->
      <div class="card">
        <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h3 class="font-semibold" style="color: var(--text-primary);">Produtos por unidade</h3>
          <div class="flex items-center gap-3 text-sm">
            <label style="color: var(--text-secondary);">Unidade</label>
            <select v-model="selectedUnit" class="form-input w-auto" @change="loadUnitProducts">
              <option v-for="unit in units" :key="unit.id" :value="unit.name">{{ unit.name }}</option>
            </select>
          </div>
        </div>

        <!-- Search -->
        <div
          class="flex items-center gap-2 rounded-lg py-2.5 px-3 mb-4"
          style="background: var(--bg-primary); border: 1px solid var(--border-color);"
        >
          <svg class="w-4 h-4 flex-shrink-0" style="color: var(--text-secondary);" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            v-model="unitProductSearch"
            type="text"
            class="flex-1 border-none bg-transparent text-sm outline-none"
            style="color: var(--text-primary);"
            placeholder="Buscar produtos..."
          />
          <span class="text-[12px] flex-shrink-0" style="color: var(--text-secondary);">{{ filteredUnitProducts.length }} de {{ unitProducts.length }}</span>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Fabricação</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredUnitProducts" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ formatDateShort(product.fabrication) }}</td>
                <td>{{ formatDateShort(product.expiration) }}</td>
                <td><StatusBadge :status="getProductStatus(product.expiration)" /></td>
                <td>
                  <button class="table-action" @click="openUnitEdit(product)">Editar</button>
                  <button class="table-action" @click="handlePrintUnit(product)">Imprimir</button>
                  <button class="table-action table-action-delete" @click="handleDeleteUnitProduct(product)">Excluir</button>
                </td>
              </tr>
              <tr v-if="filteredUnitProducts.length === 0">
                <td colspan="5" class="text-[13px]" style="color: var(--text-secondary);">Nenhum produto encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reports Tab -->
    <div v-if="activeTab === 'reports'" class="flex flex-col gap-4">
      <div class="card">
        <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h3 class="font-semibold" style="color: var(--text-primary);">Relatório mensal por unidade</h3>
          <div class="flex items-center gap-3 text-sm flex-wrap">
            <label style="color: var(--text-secondary);">Unidade</label>
            <select v-model="reportUnit" class="form-input w-auto" @change="updateReport">
              <option v-for="unit in units" :key="unit.id" :value="unit.name">{{ unit.name }}</option>
            </select>
            <label style="color: var(--text-secondary);">Mês</label>
            <input v-model="reportMonth" type="month" class="form-input w-auto" @change="updateReport" />
            <button
              class="btn-primary w-auto px-4 flex items-center gap-2"
              :disabled="downloadingCsv || reportData.total === 0"
              @click="downloadReportCSV"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ downloadingCsv ? 'Baixando...' : 'Baixar CSV' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 my-4 max-lg:grid-cols-1">
          <div class="card" style="border: 1px solid var(--border-color);">
            <span class="text-xs uppercase tracking-wide" style="color: var(--text-secondary);">Total no mês</span>
            <span class="text-[22px] font-bold block mt-1.5" style="color: var(--text-primary);">{{ reportData.total }}</span>
          </div>
          <div class="card" style="border: 1px solid var(--border-color);">
            <span class="text-xs uppercase tracking-wide" style="color: var(--text-secondary);">Vencidos no mês</span>
            <span class="text-[22px] font-bold block mt-1.5" style="color: var(--text-primary);">{{ reportData.expired }}</span>
          </div>
          <div class="card" style="border: 1px solid var(--border-color);">
            <span class="text-xs uppercase tracking-wide" style="color: var(--text-secondary);">Média de dias até vencer</span>
            <span class="text-[22px] font-bold block mt-1.5" style="color: var(--text-primary);">{{ reportData.avg }}</span>
          </div>
        </div>

        <div class="card mt-4" style="border: 1px dashed var(--border-color);">
          <h4 class="mb-3 font-semibold" style="color: var(--text-primary);">Produtos vencidos no mês</h4>
          <div class="w-full overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in reportData.expiredProducts" :key="product.id">
                  <td>{{ product.name }}</td>
                  <td>{{ formatDateShort(product.expiration) }}</td>
                  <td><StatusBadge status="vencido" /></td>
                </tr>
                <tr v-if="reportData.expiredProducts.length === 0">
                  <td colspan="3" class="text-[13px]" style="color: var(--text-secondary);">Nenhum produto vencido no mês.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UserEditModal
      :show="showUserEditModal"
      :user="editingUser"
      @close="showUserEditModal = false"
      @updated="loadUsers"
    />

    <UnitEditModal
      :show="showUnitEditModal"
      :product="editingUnitProduct"
      @close="showUnitEditModal = false"
      @updated="loadUnitProducts"
    />
  </div>
</template>

<script setup lang="ts">
import type { Profile, Product } from '~~/shared/types'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'default'
})

const supabase = useSupabaseClient()
const { fetchProfile } = useAuth()
const { units, fetchUnits, getUnitIdByName, addUnit, deleteUnit } = useUnits()
const { printLabel } = usePrintLabel()

const ADMIN_EMAIL = 'admin@controno.com.br'

const pendingUsers = computed(() =>
  users.value.filter(u => !u.approved && u.role !== 'admin')
)

const tabs = computed(() => [
  { id: 'approval', label: `Aprovação${pendingUsers.value.length ? ` (${pendingUsers.value.length})` : ''}` },
  { id: 'users', label: 'Usuários' },
  { id: 'units', label: 'Unidades' },
  { id: 'reports', label: 'Relatórios' }
])

const activeTab = ref('approval')
const users = ref<Profile[]>([])
const unitProducts = ref<Product[]>([])
const unitProductSearch = ref('')
const selectedUnit = ref('')
const reportUnit = ref('')
const reportMonth = ref('')
const reportData = ref({
  total: 0,
  expired: 0,
  avg: 0,
  expiredProducts: [] as Product[]
})

// User filters
const userSearch = ref('')
const userFilterUnit = ref('')
const userFilterRole = ref('')

const filteredUsers = computed(() => {
  let result = users.value

  if (userSearch.value) {
    const term = userSearch.value.toLowerCase()
    result = result.filter(u =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    )
  }

  if (userFilterUnit.value) {
    result = result.filter(u => u.units?.name === userFilterUnit.value)
  }

  if (userFilterRole.value) {
    if (userFilterRole.value === 'admin') {
      result = result.filter(u => isUserAdmin(u))
    } else {
      result = result.filter(u => !isUserAdmin(u))
    }
  }

  return result
})

// Unit products filter
const filteredUnitProducts = computed(() => {
  if (!unitProductSearch.value) return unitProducts.value
  const term = unitProductSearch.value.toLowerCase()
  return unitProducts.value.filter(p =>
    p.name.toLowerCase().includes(term)
  )
})

// CSV download
const downloadingCsv = ref(false)

// Unit creation
const newUnitName = ref('')
const addingUnit = ref(false)

// User edit
const showUserEditModal = ref(false)
const editingUser = ref<Profile | null>(null)

// Unit product edit
const showUnitEditModal = ref(false)
const editingUnitProduct = ref<Product | null>(null)

onMounted(async () => {
  await fetchProfile()
  await fetchUnits()

  if (units.value.length > 0) {
    selectedUnit.value = units.value[0].name
    reportUnit.value = units.value[0].name
  }

  const now = new Date()
  reportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  await Promise.all([loadUsers(), loadUnitProducts(), updateReport()])
})

async function handleAddUnit() {
  if (!newUnitName.value.trim()) return
  addingUnit.value = true
  try {
    await addUnit(newUnitName.value.trim())
    newUnitName.value = ''
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao criar unidade.')
  } finally {
    addingUnit.value = false
  }
}

async function handleDeleteUnit(unit: { id: string; name: string }) {
  if (!confirm(`Deseja excluir a unidade "${unit.name}"? Produtos e usuários associados perderão a referência.`)) return
  try {
    await deleteUnit(unit.id)
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao excluir unidade.')
  }
}

function isUserAdmin(u: Profile) {
  return u.role === 'admin' || u.email === ADMIN_EMAIL
}

async function handleApprove(u: Profile) {
  try {
    await $fetch(`/api/admin/profiles/${u.id}/approve`, { method: 'PATCH' })
    await loadUsers()
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao aprovar usuário.')
  }
}

async function handleReject(u: Profile) {
  if (!confirm(`Deseja recusar e excluir o cadastro de "${u.name || u.email}"?`)) return
  try {
    await $fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    await loadUsers()
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao recusar usuário.')
  }
}

async function loadUsers() {
  try {
    const data = await $fetch<Profile[]>('/api/admin/profiles')
    users.value = data || []
  } catch (e) {
    console.error(e)
  }
}

async function handleDeleteUser(u: Profile) {
  if (!confirm('Deseja excluir este usuário?')) return
  try {
    await $fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    await loadUsers()
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Erro ao excluir usuário.')
  }
}

function openUserEdit(u: Profile) {
  editingUser.value = u
  showUserEditModal.value = true
}

async function loadUnitProducts() {
  if (!selectedUnit.value) return

  const unitId = await getUnitIdByName(selectedUnit.value)
  if (!unitId) {
    unitProducts.value = []
    return
  }

  const { data, error } = await supabase
    .from('products')
    .select('id,name,ingredients,responsible,weight,fabrication,expiration,unit_id,units(name)')
    .eq('unit_id', unitId)

  if (error) {
    console.error(error)
    unitProducts.value = []
    return
  }

  unitProducts.value = (data || []).map((item: any) => ({
    ...item,
    unidade: item.units?.name || ''
  }))
}

function openUnitEdit(product: Product) {
  editingUnitProduct.value = product
  showUnitEditModal.value = true
}

function handlePrintUnit(product: Product) {
  printLabel(product)
}

async function handleDeleteUnitProduct(product: Product) {
  if (!confirm('Deseja excluir este produto?')) return
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)
    if (error) throw error
    await loadUnitProducts()
    await updateReport()
  } catch (e: any) {
    alert('Erro ao excluir o produto.')
  }
}

async function updateReport() {
  if (!reportUnit.value || !reportMonth.value) return

  const unitId = await getUnitIdByName(reportUnit.value)
  if (!unitId) {
    reportData.value = { total: 0, expired: 0, avg: 0, expiredProducts: [] }
    return
  }

  const start = `${reportMonth.value}-01`
  const endDate = new Date(`${reportMonth.value}-01T00:00:00`)
  endDate.setMonth(endDate.getMonth() + 1)
  endDate.setDate(0)
  const end = endDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('products')
    .select('id,name,fabrication,expiration')
    .eq('unit_id', unitId)
    .gte('expiration', start)
    .lte('expiration', end)

  if (error) {
    console.error(error)
    reportData.value = { total: 0, expired: 0, avg: 0, expiredProducts: [] }
    return
  }

  const products = (data || []) as Product[]
  const expiredNow = products.filter(p => getProductStatus(p.expiration) === 'vencido')
  const avg = products.length
    ? Math.round(products.reduce((sum, p) => sum + dateDiffDays(p.fabrication, p.expiration), 0) / products.length)
    : 0

  reportData.value = {
    total: products.length,
    expired: expiredNow.length,
    avg,
    expiredProducts: expiredNow
  }
}

async function downloadReportCSV() {
  if (!reportUnit.value || !reportMonth.value) return
  downloadingCsv.value = true

  try {
    const unitId = await getUnitIdByName(reportUnit.value)
    if (!unitId) return

    const start = `${reportMonth.value}-01`
    const endDate = new Date(`${reportMonth.value}-01T00:00:00`)
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)
    const end = endDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('products')
      .select('name,responsible,weight,fabrication,expiration')
      .eq('unit_id', unitId)
      .gte('expiration', start)
      .lte('expiration', end)
      .order('expiration', { ascending: true })

    if (error || !data) return

    const header = 'Produto;Responsavel;Peso;Fabricacao;Vencimento;Status;Dias de Vida'
    const rows = data.map((p: any) => {
      const status = statusLabel(getProductStatus(p.expiration))
      const dias = dateDiffDays(p.fabrication, p.expiration)
      return [
        p.name,
        p.responsible || '-',
        p.weight || '-',
        formatDateToBR(p.fabrication),
        formatDateToBR(p.expiration),
        status,
        dias
      ].join(';')
    })

    const bom = '\uFEFF'
    const csv = bom + [header, ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const [year, month] = reportMonth.value.split('-')
    const fileName = `relatorio_${reportUnit.value.replace(/\s+/g, '_')}_${month}-${year}.csv`

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    downloadingCsv.value = false
  }
}
</script>
