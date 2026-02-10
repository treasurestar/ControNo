export interface Unit {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  unit_id: string
  role: 'admin' | 'user'
  approved: boolean
  created_at: string
  units?: { name: string }
}

export interface Product {
  id: string
  name: string
  ingredients: string
  responsible: string
  weight: string
  fabrication: string
  expiration: string
  unit_id: string
  created_at: string
  updated_at: string
  units?: { name: string }
  unidade?: string
}

export type ProductStatus = 'ok' | 'vencendo' | 'vencido'
export type ViewMode = 'cards' | 'table' | 'flags'
