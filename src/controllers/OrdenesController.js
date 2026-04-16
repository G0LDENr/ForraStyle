import { OrderModel } from '../models/Pedidos'
import { AdminPermissionModel } from '../models/AdminPermission'

export const OrderController = {
  async getOrders(currentUserId, currentUserRole) {
    try {
      let orders = await OrderModel.getAll()
      
      // Administrador solo ve sus propios pedidos
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
      
      // Administrador solo puede ver sus propios pedidos
      if (currentUserRole === 1 && order.created_by !== currentUserId) {
        return { success: false, error: 'No tienes permiso para ver este pedido' }
      }
      
      return { success: true, data: order }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async createOrder(orderData, currentAdminId, currentUserRole) {
    // Validaciones
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

    // SOLO Administradores tienen límite de creación diario
    if (currentUserRole === 1) {
      const canCreate = await AdminPermissionModel.canCreateOrder(currentAdminId)
      if (!canCreate) {
        const stats = await AdminPermissionModel.getDailyOrderCreationStats(currentAdminId)
        const limitText = stats?.limit === 0 ? 'sin límite' : `${stats?.limit} pedidos por día`
        return { 
          success: false, 
          error: `Límite de creación alcanzado. ${limitText}` 
        }
      }
    }

    try {
      // Generar número de pedido único
      const orderNumber = await OrderModel.generateOrderNumber()
      
      // Crear el pedido - USAR currentAdminId DIRECTAMENTE
      const newOrder = await OrderModel.create({
        ...orderData,
        order_number: orderNumber,
        created_by: currentAdminId,
        status: orderData.status || 'pendiente',
        created_at: new Date().toISOString()
      })
      
      // Incrementar contador SOLO para administradores
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
      
      // Administrador solo puede editar sus propios pedidos
      if (currentUserRole === 1 && targetOrder.created_by !== currentAdminId) {
        return { success: false, error: 'No tienes permiso para editar este pedido' }
      }
      
      // SOLO Administradores tienen límite de edición diario
      if (currentUserRole === 1) {
        const canEdit = await AdminPermissionModel.canEditOrder(currentAdminId, id, targetOrder.created_by)
        if (!canEdit) {
          const stats = await AdminPermissionModel.getDailyOrderEditStats(currentAdminId)
          if (stats && stats.limit > 0 && stats.used >= stats.limit) {
            return { 
              success: false, 
              error: `Límite de ediciones alcanzado. Solo puedes editar ${stats.limit} pedido(s) diferente(s) por día` 
            }
          }
          return { 
            success: false, 
            error: 'No tienes permiso para editar este pedido' 
          }
        }
      }
      
      // No permitir editar pedidos entregados o cancelados
      if (targetOrder.status === 'entregado' || targetOrder.status === 'cancelado') {
        return { success: false, error: 'No se pueden editar pedidos entregados o cancelados' }
      }
      
      const updatedOrder = await OrderModel.update(id, orderData)
      
      // Registrar edición SOLO para administradores
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
      
      // Validar estado
      const validStatuses = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado']
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Estado inválido' }
      }
      
      // Administrador solo puede modificar sus propios pedidos
      if (currentUserRole === 1 && targetOrder.created_by !== currentAdminId) {
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
      
      // Administrador solo puede eliminar sus propios pedidos
      if (currentUserRole === 1 && targetOrder.created_by !== currentAdminId) {
        return { success: false, error: 'No tienes permiso para eliminar este pedido' }
      }
      
      // SIN límites diarios para eliminar
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
    
    // Super Admin (rol 0) - todos los permisos sin límites
    if (currentUserRole === 0) {
      console.log('✅ Super Admin - todos los permisos');
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        dailyLimit: 0,
        currentDailyCount: 0,
        editDailyLimit: 0,
        currentEditCount: 0
      };
    }
    
    // Administrador (rol 1) - obtener permisos con límites
    if (currentUserRole === 1) {
      console.log('👤 Administrador - obteniendo permisos con límites');
      const permissions = await AdminPermissionModel.getOrderPermissions(adminId);
      console.log('📦 Permisos obtenidos:', permissions);
      return permissions;
    }
    
    console.log('❌ Rol no autorizado');
    return null;
  },

  async getOrderStatistics(currentUserId, currentUserRole, startDate, endDate) {
    try {
      let statistics;
      
      if (currentUserRole === 0) {
        // Super Admin ve todas las estadísticas
        statistics = await OrderModel.getAllStatistics(startDate, endDate)
      } else if (currentUserRole === 1) {
        // Administrador solo ve sus estadísticas
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