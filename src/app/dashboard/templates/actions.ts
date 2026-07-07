'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTemplate(name: string, form_type: string, file_url: string) {
  try {
    const supabase = await createClient()
    
    // Kiểm tra quyền ADMIN
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
      
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role !== 'ADMIN') throw new Error('Forbidden')

    const { error } = await supabase
      .from('templates')
      .insert([
        {
          name,
          form_type,
          file_url,
          is_active: true
        }
      ])

    if (error) throw error

    revalidatePath('/dashboard/templates')
    revalidatePath('/dashboard/print')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function toggleTemplateStatus(id: string, is_active: boolean) {
  try {
    const supabase = await createClient()
    
    // Kiểm tra quyền ADMIN
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
      
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role !== 'ADMIN') throw new Error('Forbidden')

    const { error } = await supabase
      .from('templates')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/templates')
    revalidatePath('/dashboard/print')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteTemplate(id: string) {
  try {
    const supabase = await createClient()
    
    // Kiểm tra quyền ADMIN
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
      
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role !== 'ADMIN') throw new Error('Forbidden')

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/templates')
    revalidatePath('/dashboard/print')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
