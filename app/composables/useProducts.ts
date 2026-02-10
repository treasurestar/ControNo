import type { Product, ProductStatus } from '~~/shared/types'

export function useProducts() {
  const supabase = useSupabaseClient()
  const products = useState<Product[]>('products', () => [])

  async function fetchProducts() {
    const { units } = useUnits()

    const { data, error } = await supabase
      .from('products')
      .select('id,name,ingredients,responsible,weight,fabrication,expiration,unit_id,units(name)')
      .order('expiration', { ascending: true })

    if (error) {
      console.error(error)
      products.value = []
      return
    }

    products.value = (data || []).map((item: any) => ({
      ...item,
      unidade: item.units?.name || units.value.find(u => u.id === item.unit_id)?.name || ''
    }))
  }

  async function addProduct(payload: {
    name: string
    ingredients: string
    responsible: string
    weight: string
    fabrication: string
    expiration: string
    unit_id: string
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw error
    await fetchProducts()
    return data
  }

  async function updateProduct(id: string, payload: {
    name: string
    ingredients: string
    responsible: string
    weight: string
    fabrication: string
    expiration: string
  }) {
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
    if (error) throw error
    await fetchProducts()
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchProducts()
  }

  const stats = computed(() => {
    const total = products.value.length
    const ok = products.value.filter(p => getProductStatus(p.expiration) === 'ok').length
    const vencendo = products.value.filter(p => getProductStatus(p.expiration) === 'vencendo').length
    const vencido = products.value.filter(p => getProductStatus(p.expiration) === 'vencido').length
    return { total, ok, vencendo, vencido }
  })

  function filteredProducts(filter: ProductStatus | 'all', searchTerm: string) {
    let result = products.value

    if (filter !== 'all') {
      result = result.filter(p => getProductStatus(p.expiration) === filter)
    }

    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return result
  }

  return {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    stats,
    filteredProducts
  }
}
