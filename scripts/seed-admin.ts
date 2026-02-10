// Run once: npx tsx scripts/seed-admin.ts
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedAdmin() {
  const email = 'admin@controno.com.br'
  const password = '0004' // mesma senha do mock original

  // Criar usuário no auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Admin' }
  })

  if (error) {
    console.error('Erro ao criar usuário:', error.message)
    return
  }

  console.log('Usuário criado:', data.user.id)

  // Buscar a unidade BDN Boa Viagem
  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('name', 'BDN Boa Viagem')
    .maybeSingle()

  // Atualizar profile como admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: 'Admin',
      email,
      role: 'admin',
      unit_id: unit?.id || null
    })
    .eq('id', data.user.id)

  if (profileError) {
    console.error('Erro ao atualizar profile:', profileError.message)
    return
  }

  console.log('Admin criado com sucesso!')
  console.log(`Email: ${email}`)
  console.log(`Senha: ${password}`)
}

seedAdmin()
