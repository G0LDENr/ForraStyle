class PermissionService {
  constructor() {
    this.defaultPermissions = {
      createUsers: {
        enabled: false,
        dailyLimit: 0,
        currentCount: 0,
        lastReset: new Date().toDateString()
      },
      editUsers: {
        enabled: false,
        canEditAdmins: false,
        dailyLimit: 0,
        currentCount: 0,
        lastReset: new Date().toDateString()
      },
      deleteUsers: {
        enabled: false,
        canDeleteAdmins: false,
        canDeleteSuperAdmin: false
      }
    };
  }

  getAdminPermissions(adminId) {
    const permissions = localStorage.getItem(`admin_permissions_${adminId}`);
    
    if (!permissions) {
      return JSON.parse(JSON.stringify(this.defaultPermissions));
    }
    
    const parsedPermissions = JSON.parse(permissions);
    
    // Limpiar campos antiguos
    if (parsedPermissions.viewReports !== undefined) delete parsedPermissions.viewReports;
    if (parsedPermissions.manageOrders !== undefined) delete parsedPermissions.manageOrders;
    
    // Migrar estructura antigua de editUsers
    if (parsedPermissions.editUsers) {
      if (parsedPermissions.editUsers.editLimit !== undefined) {
        parsedPermissions.editUsers.dailyLimit = parsedPermissions.editUsers.editLimit;
        delete parsedPermissions.editUsers.editLimit;
      }
      if (parsedPermissions.editUsers.currentEditCount !== undefined) {
        parsedPermissions.editUsers.currentCount = parsedPermissions.editUsers.currentEditCount;
        delete parsedPermissions.editUsers.currentEditCount;
      }
      if (parsedPermissions.editUsers.editReset !== undefined) {
        parsedPermissions.editUsers.lastReset = parsedPermissions.editUsers.editReset;
        delete parsedPermissions.editUsers.editReset;
      }
    }
    
    // Asegurar estructura correcta
    if (!parsedPermissions.editUsers) {
      parsedPermissions.editUsers = { ...this.defaultPermissions.editUsers };
    }
    if (parsedPermissions.editUsers.dailyLimit === undefined) parsedPermissions.editUsers.dailyLimit = 0;
    if (parsedPermissions.editUsers.currentCount === undefined) parsedPermissions.editUsers.currentCount = 0;
    if (parsedPermissions.editUsers.lastReset === undefined) parsedPermissions.editUsers.lastReset = new Date().toDateString();
    if (parsedPermissions.deleteUsers.canDeleteSuperAdmin === undefined) parsedPermissions.deleteUsers.canDeleteSuperAdmin = false;
    
    return parsedPermissions;
  }

  setAdminPermissions(adminId, permissions) {
    localStorage.setItem(`admin_permissions_${adminId}`, JSON.stringify(permissions));
  }

  canCreateUser(adminId) {
    const permissions = this.getAdminPermissions(adminId);
    if (!permissions.createUsers.enabled) return false;
    
    const today = new Date().toDateString();
    if (permissions.createUsers.lastReset !== today) {
      permissions.createUsers.currentCount = 0;
      permissions.createUsers.lastReset = today;
      this.setAdminPermissions(adminId, permissions);
    }
    
    return permissions.createUsers.dailyLimit === 0 ||
           permissions.createUsers.currentCount < permissions.createUsers.dailyLimit;
  }

  canEditUser(adminId, targetUserRole) {
    const permissions = this.getAdminPermissions(adminId);
    if (!permissions.editUsers.enabled) return false;
    
    const today = new Date().toDateString();
    if (permissions.editUsers.lastReset !== today) {
      permissions.editUsers.currentCount = 0;
      permissions.editUsers.lastReset = today;
      this.setAdminPermissions(adminId, permissions);
    }
    
    if (permissions.editUsers.dailyLimit > 0 &&
        permissions.editUsers.currentCount >= permissions.editUsers.dailyLimit) {
      return false;
    }
    
    if (targetUserRole === 0) return false;
    if (targetUserRole === 1 && !permissions.editUsers.canEditAdmins) return false;
    
    return true;
  }

  canDeleteUser(adminId, targetUserRole) {
    const permissions = this.getAdminPermissions(adminId);
    if (!permissions.deleteUsers.enabled) return false;
    
    if (targetUserRole === 0) return permissions.deleteUsers.canDeleteSuperAdmin;
    if (targetUserRole === 1) return permissions.deleteUsers.canDeleteAdmins;
    
    return true;
  }

  registerUserCreation(adminId) {
    const permissions = this.getAdminPermissions(adminId);
    if (permissions.createUsers.enabled && permissions.createUsers.dailyLimit > 0) {
      permissions.createUsers.currentCount++;
      this.setAdminPermissions(adminId, permissions);
    }
  }

  registerUserEdit(adminId) {
    const permissions = this.getAdminPermissions(adminId);
    if (permissions.editUsers.enabled && permissions.editUsers.dailyLimit > 0) {
      permissions.editUsers.currentCount++;
      this.setAdminPermissions(adminId, permissions);
    }
  }

  getDailyCreationStats(adminId) {
    const permissions = this.getAdminPermissions(adminId);
    if (!permissions.createUsers.enabled) return null;
    
    const today = new Date().toDateString();
    if (permissions.createUsers.lastReset !== today) {
      return { used: 0, limit: permissions.createUsers.dailyLimit };
    }
    
    return {
      used: permissions.createUsers.currentCount,
      limit: permissions.createUsers.dailyLimit
    };
  }

  getDailyEditStats(adminId) {
    const permissions = this.getAdminPermissions(adminId);
    if (!permissions.editUsers.enabled) return null;
    
    const today = new Date().toDateString();
    if (permissions.editUsers.lastReset !== today) {
      return { used: 0, limit: permissions.editUsers.dailyLimit };
    }
    
    return {
      used: permissions.editUsers.currentCount,
      limit: permissions.editUsers.dailyLimit
    };
  }

  getUserPermissions(adminId) {
    const permissions = this.getAdminPermissions(adminId);
    return {
      canCreate: permissions.createUsers?.enabled || false,
      canEdit: permissions.editUsers?.enabled || false,
      canDelete: permissions.deleteUsers?.enabled || false,
      dailyLimit: permissions.createUsers?.dailyLimit || 0,
      currentDailyCount: permissions.createUsers?.currentCount || 0,
      canEditAdmins: permissions.editUsers?.canEditAdmins || false,
      canDeleteAdmins: permissions.deleteUsers?.canDeleteAdmins || false,
      canDeleteSuperAdmin: permissions.deleteUsers?.canDeleteSuperAdmin || false,
      editDailyLimit: permissions.editUsers?.dailyLimit || 0,
      currentEditCount: permissions.editUsers?.currentCount || 0
    };
  }
}

export default new PermissionService();