import { UserModel } from '../models/Users'

export const UserController = {
  async getUsers() {
    try {
      const users = await UserModel.getAll()
      return { success: true, data: users }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserById(id) {
    try {
      const user = await UserModel.getById(id)
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async login(email, password) {
    try {
      const user = await UserModel.login(email, password)
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async createUser(userData) {
    // Validaciones
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, error: 'Nombre, email y contraseña son requeridos' }
    }
    
    if (!userData.email.includes('@')) {
      return { success: false, error: 'Email inválido' }
    }

    if (userData.password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    if (userData.phone && userData.phone.length < 10) {
      return { success: false, error: 'Teléfono debe tener al menos 10 dígitos' }
    }

    if (userData.age && (userData.age < 18 || userData.age > 120)) {
      return { success: false, error: 'Edad debe estar entre 18 y 120 años' }
    }

    try {
      const newUser = await UserModel.create(userData)
      return { success: true, data: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateUser(id, userData) {
    try {
      const updatedUser = await UserModel.update(id, userData)
      return { success: true, data: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async deleteUser(id) {
    try {
      await UserModel.delete(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}