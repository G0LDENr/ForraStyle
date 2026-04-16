import { supabase } from '../lib/supabase'

export const AdminPermissionModel = {
  // ==================== MÉTODOS BASE ====================
  
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

  async createDefault(adminId) {
    const today = new Date().toISOString().split('T')[0];
    
    const newPermission = {
      admin_id: adminId,
      // Permisos de usuarios
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
      // Permisos de pedidos
      can_create_orders: false,
      order_daily_limit: 0,
      order_current_count: 0,
      order_last_reset: today,
      can_edit_orders: false,
      order_edit_daily_limit: 0,
      order_edit_current_count: 0,
      order_edit_last_reset: today,
      can_edit_all_orders: false,
      can_delete_orders: false,
      can_delete_all_orders: false
    };

    const { data, error } = await supabase
      .from('admin_permissions')
      .insert([newPermission])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // ==================== MÉTODOS PARA USUARIOS ====================
  
  async update(adminId, permissions) {
    console.log('📝 AdminPermissionModel.update (usuarios) recibió:', { adminId, permissions });
    
    try {
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
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', adminId)
        .select();
      
      if (error) {
        console.error('❌ Error en update:', error);
        throw error;
      }
      
      console.log('✅ Permisos de usuarios actualizados correctamente:', data?.[0]);
      return data?.[0];
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // ==================== MÉTODOS PARA PEDIDOS ====================
  
  async updateOrderPermissions(adminId, permissions) {
    console.log('📝 AdminPermissionModel.updateOrderPermissions recibió:', { adminId, permissions });
    
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .update({
          can_create_orders: permissions.canCreateOrders,
          order_daily_limit: permissions.orderDailyLimit,
          can_edit_orders: permissions.canEditOrders,
          order_edit_daily_limit: permissions.orderEditDailyLimit,
          can_edit_all_orders: permissions.canEditAllOrders,
          can_delete_orders: permissions.canDeleteOrders,
          can_delete_all_orders: permissions.canDeleteAllOrders,
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', adminId)
        .select();
      
      if (error) {
        console.error('❌ Error en updateOrderPermissions:', error);
        throw error;
      }
      
      console.log('✅ Permisos de pedidos actualizados correctamente:', data?.[0]);
      return data?.[0];
    } catch (error) {
      console.error('Error en updateOrderPermissions:', error);
      throw error;
    }
  },

  async canCreateOrder(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_create_orders) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let currentCount = permissions.order_current_count;
    
    if (permissions.order_last_reset !== today) {
      currentCount = 0;
      await supabase
        .from('admin_permissions')
        .update({
          order_current_count: 0,
          order_last_reset: today
        })
        .eq('admin_id', adminId);
    }
    
    if (permissions.order_daily_limit === 0) return true;
    return currentCount < permissions.order_daily_limit;
  },

  async incrementOrderCreateCount(adminId) {
    const today = new Date().toISOString().split('T')[0];
    const permissions = await this.getByAdminId(adminId);
    
    let newCount = permissions.order_current_count;
    if (permissions.order_last_reset !== today) {
      newCount = 1;
    } else {
      newCount = permissions.order_current_count + 1;
    }

    const { error } = await supabase
      .from('admin_permissions')
      .update({
        order_current_count: newCount,
        order_last_reset: today
      })
      .eq('admin_id', adminId);
    
    if (error) throw error;
  },

  async canEditOrder(adminId, orderCreatorId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_edit_orders) return false;
    
    if (permissions.can_edit_all_orders) {
      const today = new Date().toISOString().split('T')[0];
      let currentCount = permissions.order_edit_current_count;
      
      if (permissions.order_edit_last_reset !== today) {
        currentCount = 0;
      }
      
      if (permissions.order_edit_daily_limit === 0) return true;
      return currentCount < permissions.order_edit_daily_limit;
    }
    
    if (orderCreatorId !== adminId) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let currentCount = permissions.order_edit_current_count;
    
    if (permissions.order_edit_last_reset !== today) {
      currentCount = 0;
    }
    
    if (permissions.order_edit_daily_limit === 0) return true;
    return currentCount < permissions.order_edit_daily_limit;
  },

  async registerOrderEdit(adminId) {
    const today = new Date().toISOString().split('T')[0];
    const permissions = await this.getByAdminId(adminId);
    
    let newCount = permissions.order_edit_current_count;
    if (permissions.order_edit_last_reset !== today) {
      newCount = 1;
    } else {
      newCount = permissions.order_edit_current_count + 1;
    }

    const { error } = await supabase
      .from('admin_permissions')
      .update({
        order_edit_current_count: newCount,
        order_edit_last_reset: today
      })
      .eq('admin_id', adminId);
    
    if (error) throw error;
  },

  async canDeleteOrder(adminId, orderCreatorId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_delete_orders) return false;
    
    if (permissions.can_delete_all_orders) return true;
    
    return orderCreatorId === adminId;
  },

  async getDailyOrderCreationStats(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_create_orders) return null;
    
    const today = new Date().toISOString().split('T')[0];
    let used = permissions.order_current_count;
    
    if (permissions.order_last_reset !== today) {
      used = 0;
    }
    
    return { used, limit: permissions.order_daily_limit };
  },

  async getDailyOrderEditStats(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_edit_orders) return null;
    
    const today = new Date().toISOString().split('T')[0];
    let used = permissions.order_edit_current_count;
    
    if (permissions.order_edit_last_reset !== today) {
      used = 0;
    }
    
    return { used, limit: permissions.order_edit_daily_limit };
  },

  async getOrderPermissions(adminId) {
    try {
      const permissions = await this.getByAdminId(adminId);
      
      if (!permissions) {
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canEditAllOrders: false,
          canDeleteAllOrders: false,
          dailyLimit: 0,
          currentDailyCount: 0,
          editDailyLimit: 0,
          currentEditCount: 0
        };
      }
      
      const today = new Date().toISOString().split('T')[0];
      let currentDailyCount = permissions.order_current_count || 0;
      if (permissions.order_last_reset !== today) {
        currentDailyCount = 0;
      }
      
      let currentEditCount = permissions.order_edit_current_count || 0;
      if (permissions.order_edit_last_reset !== today) {
        currentEditCount = 0;
      }
      
      return {
        canCreate: permissions.can_create_orders || false,
        canEdit: permissions.can_edit_orders || false,
        canDelete: permissions.can_delete_orders || false,
        canEditAllOrders: permissions.can_edit_all_orders || false,
        canDeleteAllOrders: permissions.can_delete_all_orders || false,
        dailyLimit: permissions.order_daily_limit || 0,
        currentDailyCount: currentDailyCount,
        editDailyLimit: permissions.order_edit_daily_limit || 0,
        currentEditCount: currentEditCount
      };
    } catch (error) {
      console.error('Error en getOrderPermissions:', error);
      return null;
    }
  },

  // ==================== MÉTODOS PARA USUARIOS (EXISTENTES) ====================

  async canCreateUser(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_create_users) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let currentCount = permissions.create_current_count;
    
    if (permissions.create_last_reset !== today) {
      currentCount = 0;
      await supabase
        .from('admin_permissions')
        .update({
          create_current_count: 0,
          create_last_reset: today
        })
        .eq('admin_id', adminId);
    }
    
    if (permissions.create_daily_limit === 0) return true;
    return currentCount < permissions.create_daily_limit;
  },

  async incrementCreateCount(adminId) {
    const today = new Date().toISOString().split('T')[0];
    const permissions = await this.getByAdminId(adminId);
    
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

  async canEditUser(adminId, targetUserId, targetUserRole) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_edit_users) return false;
    
    if (targetUserRole === 0) return false;
    if (targetUserRole === 1 && !permissions.can_edit_admins) return false;
    
    const today = new Date().toISOString().split('T')[0];
    let currentCount = permissions.edit_current_count;
    
    if (permissions.edit_last_reset !== today) {
      currentCount = 0;
    }
    
    if (permissions.edit_daily_limit === 0) return true;
    return currentCount < permissions.edit_daily_limit;
  },

  async registerUserEdit(adminId) {
    const today = new Date().toISOString().split('T')[0];
    const permissions = await this.getByAdminId(adminId);
    
    let newCount = permissions.edit_current_count;
    if (permissions.edit_last_reset !== today) {
      newCount = 1;
    } else {
      newCount = permissions.edit_current_count + 1;
    }

    const { error } = await supabase
      .from('admin_permissions')
      .update({
        edit_current_count: newCount,
        edit_last_reset: today
      })
      .eq('admin_id', adminId);
    
    if (error) throw error;
  },

  async canDeleteUser(adminId, targetUserRole) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_delete_users) return false;
    
    if (targetUserRole === 0) return permissions.can_delete_super_admin;
    if (targetUserRole === 1) return permissions.can_delete_admins;
    
    return true;
  },

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

  async getDailyEditStats(adminId) {
    const permissions = await this.getByAdminId(adminId);
    if (!permissions.can_edit_users) return null;
    
    const today = new Date().toISOString().split('T')[0];
    let used = permissions.edit_current_count;
    
    if (permissions.edit_last_reset !== today) {
      used = 0;
    }
    
    return { used, limit: permissions.edit_daily_limit };
  },

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
      
      const today = new Date().toISOString().split('T')[0];
      let currentEditCount = permissions.edit_current_count;
      if (permissions.edit_last_reset !== today) {
        currentEditCount = 0;
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
        currentEditCount: currentEditCount
      };
    } catch (error) {
      console.error('Error en getUserPermissions:', error);
      return null;
    }
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
          order_current_count: 0,
          order_last_reset: today,
          order_edit_current_count: 0,
          order_edit_last_reset: today
        })
        .eq('admin_id', adminId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error en resetCounters:', error);
      throw error;
    }
  },

  async delete(adminId) {
    const { error } = await supabase
      .from('admin_permissions')
      .delete()
      .eq('admin_id', adminId);
    
    if (error) throw error;
    return true;
  }
};