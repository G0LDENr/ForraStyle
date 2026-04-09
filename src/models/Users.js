import { supabase } from '../lib/supabase'

export const UserModel = {
  // Obtener todos los usuarios
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) throw error
    return data
  },

  // Obtener un usuario por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear usuario (con name, email, phone, age)
  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        age: userData.age
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Actualizar usuario
  async update(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        age: userData.age
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Eliminar usuario
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}