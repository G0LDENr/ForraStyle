import { supabase } from '../lib/supabase'

export const AdminPermissionModel = {
  // Obtener permisos por admin_id
  async getByAdminId(adminId) {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .eq('admin_id', adminId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return await this.createDefault(adminId);
      }
      
      return data[0];
    } catch (error) {
      console.error('Error en getByAdminId:', error);
      throw error;
    }
  },

  // Crear permisos por defecto
  async createDefault(adminId) {
    const today = new Date().toISOString().split('T')[0];
    
    const newPermission = {
      admin_id: adminId,
      can_create_users: false,
      create_daily_limit: 0,
      create_current_count: 0,
      create_last_reset: today,
      can_edit_users: false,
      edit_daily_limit: 0,
      edit_current_count: 0,
      edit_last_reset: today,
      can_edit_admins: false,
      can_delete_users: false,
      can_delete_admins: false,
      can_delete_super_admin: false,
      user_edit_counts: {}
    };

    const { data, error } = await supabase
      .from('admin_permissions')
      .insert([newPermission])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Actualizar permisos
  async update(adminId, permissions) {
    const { data, error } = await supabase
      .from('admin_permissions')
      .update({
        can_create_users: permissions.canCreateUsers,
        create_daily_limit: permissions.createDailyLimit,
        can_edit_users: permissions.canEditUsers,
        edit_daily_limit: permissions.editDailyLimit,
        can_edit_admins: permissions.canEditAdmins,
        can_delete_users: permissions.canDeleteUsers,
        can_delete_admins: permissions.canDeleteAdmins,
        can_delete_super_admin: permissions.canDeleteSuperAdmin,
        updated_at: new Date()
      })
      .eq('admin_id', adminId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Verificar si puede editar usuario (límite POR USUARIO)
  async canEditUser(adminId, targetUserId, targetUserRole) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_edit_users) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let userEditCounts = permissions.user_edit_counts || {};
    
    // Limpiar registros de días anteriores
    const keys = Object.keys(userEditCounts);
    keys.forEach(key => {
      if (!key.startsWith(today)) {
        delete userEditCounts[key];
      }
    });
    
    // Obtener cuántas veces ha editado este usuario hoy
    const userEditCount = userEditCounts[`${today}_${targetUserId}`] || 0;
    
    // Si ya alcanzó el límite para este usuario, no puede editar
    if (permissions.edit_daily_limit > 0 && userEditCount >= permissions.edit_daily_limit) {
      return false;
    }
    
    if (targetUserRole === 0) return false;
    if (targetUserRole === 1 && !permissions.can_edit_admins) return false;
    
    return true;
  },

  // Registrar edición de usuario
  async registerUserEdit(adminId, targetUserId) {
    const permissions = await this.getByAdminId(adminId);
    const today = new Date().toISOString().split('T')[0];
    
    let userEditCounts = permissions.user_edit_counts || {};
    const key = `${today}_${targetUserId}`;
    
    userEditCounts[key] = (userEditCounts[key] || 0) + 1;
    
    // Limpiar registros antiguos (mantener solo últimos 7 días)
    const keys = Object.keys(userEditCounts);
    if (keys.length > 7) {
      const oldestKey = keys.sort()[0];
      delete userEditCounts[oldestKey];
    }
    
    const { error } = await supabase
      .from('admin_permissions')
      .update({ user_edit_counts: userEditCounts })
      .eq('admin_id', adminId);
    
    if (error) throw error;
  },

  // Verificar si puede crear usuario
  async canCreateUser(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_create_users) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let currentCount = permissions.create_current_count;
    
    // Resetear contador si es un nuevo día
    if (permissions.create_last_reset !== today) {
      currentCount = 0;
      // Actualizar el contador en la base de datos
      await supabase
        .from('admin_permissions')
        .update({
          create_current_count: 0,
          create_last_reset: today
        })
        .eq('admin_id', adminId);
    }
    
    // Si el límite es 0, significa sin límite, siempre puede crear
    if (permissions.create_daily_limit === 0) return true;
    
    // Si hay límite, verificar que no lo haya alcanzado
    return currentCount < permissions.create_daily_limit;
  },

  // Registrar creación de usuario
  async incrementCreateCount(adminId) {
    const today = new Date().toISOString().split('T')[0];
    const permissions = await this.getByAdminId(adminId);
    
    // Siempre incrementar el contador, incluso si el límite es 0
    // Esto es para llevar estadísticas
    let newCount = permissions.create_current_count;
    if (permissions.create_last_reset !== today) {
      newCount = 1;
    } else {
      newCount = permissions.create_current_count + 1;
    }

    const { error } = await supabase
      .from('admin_permissions')
      .update({
        create_current_count: newCount,
        create_last_reset: today
      })
      .eq('admin_id', adminId);
    
    if (error) throw error;
  },

  // Verificar si puede eliminar usuario
  async canDeleteUser(adminId, targetUserRole) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_delete_users) return false;
    
    if (targetUserRole === 0) return permissions.can_delete_super_admin;
    if (targetUserRole === 1) return permissions.can_delete_admins;
    
    return true;
  },

  // Obtener estadísticas diarias de creación
  async getDailyCreationStats(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_create_users) return null;
    
    const today = new Date().toISOString().split('T')[0];
    let used = permissions.create_current_count;
    
    if (permissions.create_last_reset !== today) {
      used = 0;
    }
    
    return { used, limit: permissions.create_daily_limit };
  },

  // Obtener estadísticas de edición (cuántos usuarios diferentes ha editado)
  async getDailyEditStats(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_edit_users) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const userEditCounts = permissions.user_edit_counts || {};
    
    // Contar cuántos usuarios diferentes ha editado hoy
    let editedUsersCount = 0;
    Object.keys(userEditCounts).forEach(key => {
      if (key.startsWith(today)) {
        editedUsersCount++;
      }
    });
    
    return { used: editedUsersCount, limit: permissions.edit_daily_limit };
  },

  // Obtener permisos formateados para el frontend
  async getUserPermissions(adminId) {
    try {
      const permissions = await this.getByAdminId(adminId);
      
      if (!permissions) {
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
      
      return {
        canCreate: permissions.can_create_users || false,
        canEdit: permissions.can_edit_users || false,
        canDelete: permissions.can_delete_users || false,
        dailyLimit: permissions.create_daily_limit || 0,
        currentDailyCount: permissions.create_current_count || 0,
        canEditAdmins: permissions.can_edit_admins || false,
        canDeleteAdmins: permissions.can_delete_admins || false,
        canDeleteSuperAdmin: permissions.can_delete_super_admin || false,
        editDailyLimit: permissions.edit_daily_limit || 0,
        currentEditCount: permissions.edit_current_count || 0
      };
    } catch (error) {
      console.error('Error en getUserPermissions:', error);
      return null;
    }
  },

  // Eliminar permisos
  async delete(adminId) {
    const { error } = await supabase
      .from('admin_permissions')
      .delete()
      .eq('admin_id', adminId);
    
    if (error) throw error;
    return true;
  },

  async resetCounters(adminId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('admin_permissions')
        .update({
          create_current_count: 0,
          create_last_reset: today,
          edit_current_count: 0,
          edit_last_reset: today,
          user_edit_counts: {}
        })
        .eq('admin_id', adminId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error en resetCounters:', error);
      throw error;
    }
  }

};