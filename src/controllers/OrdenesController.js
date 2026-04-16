import { OrderModel } from '../models/Pedidos'
import { AdminPermissionModel } from '../models/AdminPermission'

export const OrderController = {
  async getOrders(currentUserId, currentUserRole) {
    try {
      let orders = await OrderModel.getAll()
      
      if (currentUserRole === 1) {
        orders = orders.filter(order => order.created_by === currentUserId)
      }
      
      return { success: true, data: orders }
    } catch (error) {
      console.error('Error al obtener pedidos:', error)
      return { success: false, error: error.message }
    }
  },

  async getOrderById(id, currentUserId, currentUserRole) {
    try {
      const order = await OrderModel.getById(id)
      
      if (!order) {
        return { success: false, error: 'Pedido no encontrado' }
      }
      
      if (currentUserRole === 1 && order.created_by !== currentUserId) {
        return { success: false, error: 'No tienes permiso para ver este pedido' }
      }
      
      return { success: true, data: order }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async createOrder(orderData, currentAdminId, currentUserRole) {
    if (!orderData.customer_name || !orderData.customer_email || !orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'Nombre del cliente, email y al menos un producto son requeridos' }
    }
    
    if (!orderData.customer_email.includes('@')) {
      return { success: false, error: 'Email del cliente inválido' }
    }

    if (orderData.customer_phone && orderData.customer_phone.length < 10) {
      return { success: false, error: 'Teléfono debe tener al menos 10 dígitos' }
    }

    if (orderData.total && (orderData.total <= 0 || isNaN(orderData.total))) {
      return { success: false, error: 'El total debe ser un número positivo' }
    }

    const permissions = await this.getOrderPermissions(currentAdminId, currentUserRole)
    if (!permissions.canCreate) {
      return { success: false, error: 'No tienes permiso para crear pedidos' }
    }

    if (currentUserRole === 1 && permissions.dailyLimit > 0) {
      if (permissions.currentDailyCount >= permissions.dailyLimit) {
        return { 
          success: false, 
          error: `Límite de creación alcanzado. Solo puedes crear ${permissions.dailyLimit} pedidos por día` 
        }
      }
    }

    try {
      const orderNumber = await OrderModel.generateOrderNumber()
      
      const newOrder = await OrderModel.create({
        ...orderData,
        order_number: orderNumber,
        created_by: currentAdminId,
        status: orderData.status || 'pendiente',
        created_at: new Date().toISOString()
      })
      
      if (currentUserRole === 1) {
        await AdminPermissionModel.incrementOrderCreateCount(currentAdminId)
      }
      
      return { success: true, data: newOrder }
    } catch (error) {
      console.error('Error en createOrder:', error)
      return { success: false, error: error.message }
    }
  },

  async updateOrder(id, orderData, currentAdminId, currentUserRole) {
    try {
      const targetOrder = await OrderModel.getById(id)
      
      if (!targetOrder) {
        return { success: false, error: 'Pedido no encontrado' }
      }
      
      const permissions = await this.getOrderPermissions(currentAdminId, currentUserRole)
      
      if (!permissions.canEdit) {
        return { success: false, error: 'No tienes permiso para editar pedidos' }
      }
      
      const canEditThisOrder = permissions.canEditAllOrders || targetOrder.created_by === currentAdminId
      if (!canEditThisOrder) {
        return { success: false, error: 'No tienes permiso para editar este pedido' }
      }
      
      if (currentUserRole === 1 && permissions.editDailyLimit > 0) {
        if (permissions.currentEditCount >= permissions.editDailyLimit) {
          return { 
            success: false, 
            error: `Límite de ediciones alcanzado. Solo puedes editar ${permissions.editDailyLimit} pedido(s) por día` 
          }
        }
      }
      
      if (targetOrder.status === 'entregado' || targetOrder.status === 'cancelado') {
        return { success: false, error: 'No se pueden editar pedidos entregados o cancelados' }
      }
      
      const updatedOrder = await OrderModel.update(id, orderData)
      
      if (currentUserRole === 1) {
        await AdminPermissionModel.registerOrderEdit(currentAdminId, id)
      }
      
      return { success: true, data: updatedOrder }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updateOrderStatus(id, status, currentAdminId, currentUserRole) {
    try {
      const targetOrder = await OrderModel.getById(id)
      
      if (!targetOrder) {
        return { success: false, error: 'Pedido no encontrado' }
      }
      
      const validStatuses = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado']
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Estado inválido' }
      }
      
      const permissions = await this.getOrderPermissions(currentAdminId, currentUserRole)
      
      if (!permissions.canEdit) {
        return { success: false, error: 'No tienes permiso para modificar pedidos' }
      }
      
      const canEditThisOrder = permissions.canEditAllOrders || targetOrder.created_by === currentAdminId
      if (!canEditThisOrder) {
        return { success: false, error: 'No tienes permiso para modificar este pedido' }
      }
      
      const updatedOrder = await OrderModel.updateStatus(id, status)
      return { success: true, data: updatedOrder }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async deleteOrder(id, currentAdminId, currentUserRole) {
    try {
      const targetOrder = await OrderModel.getById(id)
      
      if (!targetOrder) {
        return { success: false, error: 'Pedido no encontrado' }
      }
      
      const permissions = await this.getOrderPermissions(currentAdminId, currentUserRole)
      
      if (!permissions.canDelete) {
        return { success: false, error: 'No tienes permiso para eliminar pedidos' }
      }
      
      const canDeleteThisOrder = permissions.canDeleteAllOrders || targetOrder.created_by === currentAdminId
      if (!canDeleteThisOrder) {
        return { success: false, error: 'No tienes permiso para eliminar este pedido' }
      }
      
      if (targetOrder.status === 'entregado') {
        return { success: false, error: 'No se pueden eliminar pedidos entregados' }
      }
      
      await OrderModel.delete(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getDailyOrderStats(currentAdminId, currentUserRole) {
    if (currentUserRole !== 1) return null
    const stats = await AdminPermissionModel.getDailyOrderCreationStats(currentAdminId)
    return stats
  },

  async getDailyOrderEditStats(currentAdminId, currentUserRole) {
    if (currentUserRole !== 1) return null
    return await AdminPermissionModel.getDailyOrderEditStats(currentAdminId)
  },

  async getOrderPermissions(adminId, currentUserRole) {
    console.log(`getOrderPermissions llamado - adminId: ${adminId}, currentUserRole: ${currentUserRole}`);
    
    if (currentUserRole === 0) {
      console.log('✅ Super Admin - todos los permisos');
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canEditAllOrders: true,
        canDeleteAllOrders: true,
        dailyLimit: 0,
        currentDailyCount: 0,
        editDailyLimit: 0,
        currentEditCount: 0
      };
    }
    
    if (currentUserRole === 1) {
      console.log('👤 Administrador - obteniendo permisos con límites');
      const permissions = await AdminPermissionModel.getOrderPermissions(adminId);
      console.log('📦 Permisos obtenidos del modelo:', permissions);
      
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
      
      return permissions;
    }
    
    console.log('❌ Rol no autorizado');
    return null;
  },

  async updateOrderPermissions(adminId, permissions, currentUserRole) {
    console.log('📝 updateOrderPermissions llamado:', { adminId, permissions, currentUserRole });
    
    try {
      if (currentUserRole !== 0) {
        return { success: false, error: 'No tienes permisos para actualizar permisos de pedidos' };
      }
      
      // Asegurar que los parámetros tengan los nombres correctos
      const orderPermissions = {
        canCreateOrders: permissions.canCreateOrders !== undefined ? permissions.canCreateOrders : false,
        orderDailyLimit: permissions.orderDailyLimit !== undefined ? permissions.orderDailyLimit : 0,
        canEditOrders: permissions.canEditOrders !== undefined ? permissions.canEditOrders : false,
        orderEditDailyLimit: permissions.orderEditDailyLimit !== undefined ? permissions.orderEditDailyLimit : 0,
        canEditAllOrders: permissions.canEditAllOrders !== undefined ? permissions.canEditAllOrders : false,
        canDeleteOrders: permissions.canDeleteOrders !== undefined ? permissions.canDeleteOrders : false,
        canDeleteAllOrders: permissions.canDeleteAllOrders !== undefined ? permissions.canDeleteAllOrders : false
      };
      
      console.log('📦 Enviando a updateOrderPermissions:', orderPermissions);
      
      const result = await AdminPermissionModel.updateOrderPermissions(adminId, orderPermissions);
      
      console.log('✅ Permisos de pedidos actualizados:', result);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('permissionsUpdated', { 
          detail: { adminId, permissions: result }
        }));
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en updateOrderPermissions:', error);
      return { success: false, error: error.message };
    }
  },

  async getAdminOrderPermissions(adminId, currentUserRole) {
    console.log(`getAdminOrderPermissions llamado - adminId: ${adminId}, currentUserRole: ${currentUserRole}`);
    
    try {
      if (currentUserRole !== 0 && currentUserRole !== 1) {
        return { success: false, error: 'No autorizado' };
      }
      
      const permissions = await AdminPermissionModel.getOrderPermissions(adminId);
      console.log('📦 Permisos desde getOrderPermissions:', permissions);
      
      if (!permissions) {
        return { 
          success: true, 
          data: {
            canCreateOrders: false,
            orderDailyLimit: 0,
            orderCurrentCount: 0,
            canEditOrders: false,
            orderEditDailyLimit: 0,
            orderEditCurrentCount: 0,
            canEditAllOrders: false,
            canDeleteOrders: false,
            canDeleteAllOrders: false
          }
        };
      }
      
      return {
        success: true,
        data: {
          canCreateOrders: permissions.canCreate || false,
          orderDailyLimit: permissions.dailyLimit || 0,
          orderCurrentCount: permissions.currentDailyCount || 0,
          canEditOrders: permissions.canEdit || false,
          orderEditDailyLimit: permissions.editDailyLimit || 0,
          orderEditCurrentCount: permissions.currentEditCount || 0,
          canEditAllOrders: permissions.canEditAllOrders || false,
          canDeleteOrders: permissions.canDelete || false,
          canDeleteAllOrders: permissions.canDeleteAllOrders || false
        }
      };
    } catch (error) {
      console.error('Error en getAdminOrderPermissions:', error);
      return { success: false, error: error.message };
    }
  },

  async getOrderStatistics(currentUserId, currentUserRole, startDate, endDate) {
    try {
      let statistics;
      
      if (currentUserRole === 0) {
        statistics = await OrderModel.getAllStatistics(startDate, endDate)
      } else if (currentUserRole === 1) {
        statistics = await OrderModel.getUserStatistics(currentUserId, startDate, endDate)
      } else {
        return { success: false, error: 'No autorizado' }
      }
      
      return { success: true, data: statistics }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
};