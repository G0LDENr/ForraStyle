import { UserModel } from '../models/Users'
import { AdminPermissionModel } from '../models/AdminPermission'

export const UserController = {
  async getUsers(currentUserId, currentUserRole) {
    try {
      let users = await UserModel.getAll()
      
      if (currentUserRole === 1) {
        users = users.filter(user => user.rol !== 0)
      }
      
      return { success: true, data: users }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserById(id, currentUserRole) {
    try {
      const user = await UserModel.getById(id)
      
      if (currentUserRole === 1 && user.rol === 0) {
        return { success: false, error: 'No tienes permiso para ver este usuario' }
      }
      
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

  async createUser(userData, currentAdminId, currentUserRole) {
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

    if (currentUserRole === 1) {
      const canCreate = await AdminPermissionModel.canCreateUser(currentAdminId)
      if (!canCreate) {
        const stats = await AdminPermissionModel.getDailyCreationStats(currentAdminId)
        const limitText = stats?.limit === 0 ? 'sin límite' : `${stats?.limit} usuarios por día`
        return { 
          success: false, 
          error: `Límite de creación alcanzado. ${limitText}` 
        }
      }
    }

    if (currentUserRole === 1 && userData.rol === 0) {
      return { success: false, error: 'No tienes permiso para crear Super Administradores' }
    }

    try {
      const newUser = await UserModel.create(userData)
      
      if (currentUserRole === 1) {
        await AdminPermissionModel.incrementCreateCount(currentAdminId)
      }
      
      return { success: true, data: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateUser(id, userData, currentAdminId, currentUserRole) {
    try {
      const targetUser = await UserModel.getById(id)
      
      if (!targetUser) {
        return { success: false, error: 'Usuario no encontrado' }
      }
      
      if (currentUserRole === 1) {
        const canEdit = await AdminPermissionModel.canEditUser(currentAdminId, id, targetUser.rol)
        if (!canEdit) {
          const stats = await AdminPermissionModel.getDailyEditStats(currentAdminId)
          if (stats && stats.limit > 0 && stats.used >= stats.limit) {
            return { 
              success: false, 
              error: `Límite de ediciones alcanzado. Solo puedes editar ${stats.limit} usuario(s) diferente(s) por día` 
            }
          }
          return { 
            success: false, 
            error: 'No tienes permiso para editar este usuario' 
          }
        }
      }
      
      if (currentUserRole === 1 && userData.rol === 0) {
        return { success: false, error: 'No puedes asignar el rol de Super Administrador' }
      }
      
      if (currentUserRole === 1 && targetUser.rol === 0) {
        return { success: false, error: 'No puedes modificar un Super Administrador' }
      }
      
      const updatedUser = await UserModel.update(id, userData)
      
      if (currentUserRole === 1) {
        await AdminPermissionModel.registerUserEdit(currentAdminId, id)
      }
      
      return { success: true, data: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async deleteUser(id, currentAdminId, currentUserRole) {
    try {
      const targetUser = await UserModel.getById(id)
      
      if (!targetUser) {
        return { success: false, error: 'Usuario no encontrado' }
      }
      
      if (currentUserRole === 1) {
        const canDelete = await AdminPermissionModel.canDeleteUser(currentAdminId, targetUser.rol)
        if (!canDelete) {
          return { 
            success: false, 
            error: 'No tienes permiso para eliminar este usuario' 
          }
        }
      }
      
      if (id === currentAdminId) {
        return { success: false, error: 'No puedes eliminar tu propio usuario' }
      }
      
      if (targetUser.rol === 0 && currentUserRole !== 0) {
        return { success: false, error: 'No puedes eliminar un Super Administrador' }
      }
      
      if (targetUser.rol === 1) {
        await AdminPermissionModel.delete(id)
      }
      
      await UserModel.delete(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getDailyStats(currentAdminId, currentUserRole) {
    if (currentUserRole !== 1) return null
    return await AdminPermissionModel.getDailyCreationStats(currentAdminId)
  },

  async getDailyEditStats(currentAdminId, currentUserRole) {
    if (currentUserRole !== 1) return null
    return await AdminPermissionModel.getDailyEditStats(currentAdminId)
  },

  // CORREGIDO: Usar el método getUserPermissions del modelo
  async getUserPermissions(adminId, currentUserRole) {
    console.log(`🔐 getUserPermissions llamado - adminId: ${adminId}, currentUserRole: ${currentUserRole}`);
    
    // Super Admin (rol 0) puede ver todos los permisos
    // Administradores (rol 1) pueden ver sus propios permisos
    if (currentUserRole !== 0 && currentUserRole !== 1) {
      console.log('❌ Rol no autorizado para ver permisos');
      return null;
    }
    
    try {
      // Usar el método del modelo que ya maneja la creación por defecto
      const permissions = await AdminPermissionModel.getUserPermissions(adminId);
      console.log('📦 Permisos desde el modelo:', permissions);
      
      if (!permissions) {
        console.log('⚠️ No se encontraron permisos');
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          dailyLimit: 0,
          currentDailyCount: 0,
          canEditAdmins: false,
          canDeleteAdmins: false,
          canDeleteSuperAdmin: false,
          editDailyLimit: 0,
          currentEditCount: 0
        };
      }
      
      console.log('✅ Permisos procesados:', permissions);
      return permissions;
    } catch (error) {
      console.error('Error en getUserPermissions:', error);
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        dailyLimit: 0,
        currentDailyCount: 0,
        canEditAdmins: false,
        canDeleteAdmins: false,
        canDeleteSuperAdmin: false,
        editDailyLimit: 0,
        currentEditCount: 0
      };
    }
  },

  async updateAdminPermissions(adminId, permissionsData, currentUserRole) {
    if (currentUserRole !== 0) {
      return { success: false, error: 'No tienes permiso para modificar permisos' }
    }

    try {
      const updated = await AdminPermissionModel.update(adminId, permissionsData)
      return { success: true, data: updated }
    } catch (error) {
      console.error('Error en updateAdminPermissions:', error);
      return { success: false, error: error.message }
    }
  },

  async resetAdminCounters(adminId, currentUserRole) {
    console.log('🔄 Reiniciando contadores para:', { adminId, currentUserRole });
    
    // Solo Super Admin puede reiniciar contadores
    if (currentUserRole !== 0) {
      console.log('❌ Usuario no autorizado para reiniciar contadores');
      return { success: false, error: 'No tienes permiso para reiniciar contadores. Solo Super Administradores.' };
    }

    try {
      const result = await AdminPermissionModel.resetCounters(adminId);
      console.log('✅ Contadores reiniciados exitosamente');
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en resetAdminCounters:', error);
      return { success: false, error: error.message };
    }
  }

};