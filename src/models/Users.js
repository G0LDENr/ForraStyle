import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

export const UserModel = {
  // Obtener todos los usuarios
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, age, rol, created_at')
    
    if (error) throw error
    return data
  },

  // Obtener un usuario por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, age, rol, created_at')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Obtener usuario por email
  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear usuario (con name, email, phone, age, password, rol)
  async create(userData) {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        age: userData.age || null,
        password: hashedPassword,
        rol: userData.rol || 2 // Por defecto rol 2 (usuario normal)
      }])
      .select('id, name, email, phone, age, rol, created_at')
    
    if (error) throw error
    return data[0]
  },

  // Actualizar usuario
  async update(id, userData) {
    const updateData = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      age: userData.age,
      rol: userData.rol
    }
    
    // Si se actualiza la contraseña, hashearla
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10)
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, phone, age, rol, created_at')
    
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
  },

  // Autenticación
  async login(email, password) {
    const user = await this.getByEmail(email)
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta')
    }
    
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}