import React, { useState, useEffect, useCallback } from 'react';
import { OrderController } from '../../controllers/OrdenesController';
import { CreateOrderModal } from './Create-Pedidos';
import { EditOrderModal } from './Edit-Pedidos';
import { ViewOrderModal } from './View-Pedidos';
import { FaSpinner, FaCheckCircle, FaShoppingCart, FaExclamationTriangle, FaSync, FaEye, FaEdit, FaTrash, FaClipboardList, FaClock, FaTruck, FaCheckDouble, FaChartLine } from 'react-icons/fa';
import '../../css/pedidos/pedidos.css';

export function OrderList({ currentAdminId, currentUserRole }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canEditAllOrders: false,
    canDeleteAllOrders: false,
    dailyLimit: 0,
    currentDailyCount: 0,
    editDailyLimit: 0,
    currentEditCount: 0
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  
  const initialLoadDone = React.useRef(false);

  const getAdminIdAndRole = useCallback(() => {
    let adminId = currentAdminId;
    let userRole = currentUserRole;
    
    if (!adminId || userRole === undefined) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        adminId = user.id;
        userRole = user.rol;
      }
    }
    
    return { adminId, userRole };
  }, [currentAdminId, currentUserRole]);

  // Función para cargar SOLO los pedidos
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      console.log('📊 Cargando pedidos - Admin ID:', adminId, 'Rol:', userRole);
      
      const result = await OrderController.getOrders(adminId, userRole);
      console.log('📦 Resultado de pedidos:', result);
      
      if (result.success) {
        console.log(`📋 Total de pedidos cargados: ${result.data.length}`);
        setOrders(result.data);
      } else {
        console.error('❌ Error:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fatal:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [getAdminIdAndRole]);

  // Cargar permisos
  const loadPermissions = useCallback(async () => {
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      console.log('🔐 Cargando permisos para:', { adminId, userRole });
      
      // SUPER ADMIN - todos los permisos
      if (userRole === 0) {
        console.log('👑 Super Admin - todos los permisos true');
        setPermissions({
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canEditAllOrders: true,
          canDeleteAllOrders: true,
          dailyLimit: 0,
          currentDailyCount: 0,
          editDailyLimit: 0,
          currentEditCount: 0
        });
        return;
      }
      
      // ADMIN - obtener permisos de la BD
      if (userRole === 1) {
        const perms = await OrderController.getOrderPermissions(adminId, userRole);
        console.log('📦 Permisos desde controller:', perms);
        
        if (perms) {
          setPermissions({
            canCreate: perms.canCreate === true,
            canEdit: perms.canEdit === true,
            canDelete: perms.canDelete === true,
            canEditAllOrders: perms.canEditAllOrders === true,
            canDeleteAllOrders: perms.canDeleteAllOrders === true,
            dailyLimit: perms.dailyLimit || 0,
            currentDailyCount: perms.currentDailyCount || 0,
            editDailyLimit: perms.editDailyLimit || 0,
            currentEditCount: perms.currentEditCount || 0
          });
        }
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
      // En caso de error, dar permisos básicos
      setPermissions({
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canEditAllOrders: false,
        canDeleteAllOrders: false,
        dailyLimit: 0,
        currentDailyCount: 0,
        editDailyLimit: 0,
        currentEditCount: 0
      });
    }
  }, [getAdminIdAndRole]);

  // Cargar todo
  const loadAllData = useCallback(async () => {
    await Promise.all([loadOrders(), loadPermissions()]);
  }, [loadOrders, loadPermissions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // Escuchar evento de actualización de permisos
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      console.log('🔄 Evento permissionsUpdated recibido');
      loadPermissions();
      loadOrders();
    };
    window.addEventListener('permissionsUpdated', handlePermissionsUpdated);
    return () => window.removeEventListener('permissionsUpdated', handlePermissionsUpdated);
  }, [loadPermissions, loadOrders]);

  // Carga inicial
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadAllData();
    }
  }, [loadAllData]);

  // Verificar si puede crear
  const canCreateOrder = useCallback(() => {
    const { userRole } = getAdminIdAndRole();
    if (userRole === 0) return true;
    return permissions.canCreate === true;
  }, [getAdminIdAndRole, permissions.canCreate]);

  // Verificar si puede editar un pedido específico
  const canEditOrder = useCallback((order) => {
    const { adminId, userRole } = getAdminIdAndRole();
    if (userRole === 0) return true;
    if (!permissions.canEdit) return false;
    if (permissions.canEditAllOrders) return true;
    return order.created_by === adminId;
  }, [getAdminIdAndRole, permissions.canEdit, permissions.canEditAllOrders]);

  // Verificar si puede eliminar un pedido específico
  const canDeleteOrder = useCallback((order) => {
    const { adminId, userRole } = getAdminIdAndRole();
    if (userRole === 0) return true;
    if (!permissions.canDelete) return false;
    if (permissions.canDeleteAllOrders) return true;
    return order.created_by === adminId;
  }, [getAdminIdAndRole, permissions.canDelete, permissions.canDeleteAllOrders]);

  // Handlers
  const handleCreateClick = () => {
    if (!canCreateOrder()) {
      setPermissionError('No tienes permiso para crear pedidos');
      setShowPermissionDenied(true);
      setTimeout(() => setShowPermissionDenied(false), 3000);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleEdit = (order) => {
    if (!canEditOrder(order)) {
      setPermissionError('No tienes permiso para editar este pedido');
      setShowPermissionDenied(true);
      setTimeout(() => setShowPermissionDenied(false), 3000);
      return;
    }
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (order) => {
    if (!canDeleteOrder(order)) {
      setPermissionError('No tienes permiso para eliminar este pedido');
      setShowPermissionDenied(true);
      setTimeout(() => setShowPermissionDenied(false), 3000);
      return;
    }
    setOrderToDelete(order);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const { adminId, userRole } = getAdminIdAndRole();
    const result = await OrderController.deleteOrder(orderToDelete.id, adminId, userRole);
    
    if (result.success) {
      setSuccessMessage('Pedido eliminado exitosamente');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      await loadOrders();
      setTimeout(() => setShowSuccessModal(false), 2000);
    } else {
      setPermissionError(result.error);
      setShowPermissionDenied(true);
      setShowConfirmModal(false);
      setTimeout(() => setShowPermissionDenied(false), 3000);
    }
    setDeleteLoading(false);
    setOrderToDelete(null);
  };

  const handleOrderCreated = async () => {
    await loadOrders();
    await loadPermissions();
  };

  const handleOrderUpdated = async () => {
    await loadOrders();
    await loadPermissions();
  };

  // Estadísticas
  const getOrderStats = () => {
    const total = orders.length;
    const pendientes = orders.filter(o => o.status === 'pendiente').length;
    const enProceso = orders.filter(o => o.status === 'en_proceso').length;
    const enviados = orders.filter(o => o.status === 'enviado').length;
    const entregados = orders.filter(o => o.status === 'entregado').length;
    const cancelados = orders.filter(o => o.status === 'cancelado').length;
    const totalPrecio = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    return { total, pendientes, enProceso, enviados, entregados, cancelados, totalPrecio };
  };

  const stats = getOrderStats();

  const getStatusBadge = (status) => {
    const statusMap = {
      'pendiente': 'pedidos-status-pending',
      'en_proceso': 'pedidos-status-processing',
      'enviado': 'pedidos-status-shipped',
      'entregado': 'pedidos-status-delivered',
      'cancelado': 'pedidos-status-cancelled'
    };
    const statusText = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return <span className={`pedidos-order-status-badge ${statusMap[status] || 'pedidos-status-pending'}`}>{statusText[status] || status}</span>;
  };

  // Filtros
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchLower) || 
                          order.customer_email?.toLowerCase().includes(searchLower) ||
                          order.order_number?.toLowerCase().includes(searchLower);
    let matchesStatus = true;
    if (statusFilter !== 'todos') matchesStatus = order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleStatusFilter = (status) => { setStatusFilter(status); setCurrentPage(1); };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="pedidos-loading">
        <FaSpinner className="pedidos-spinner" /> Cargando pedidos...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="pedidos-error">
        <FaExclamationTriangle />
        <span>Error: {error}</span>
        <button onClick={() => loadAllData()} className="pedidos-retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h2 className="pedidos-title">
          <FaShoppingCart className="pedidos-title-icon" /> Gestión de Pedidos
        </h2>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="pedidos-stats-grid">
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon blue"><FaClipboardList /></div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Total Pedidos</span>
            <span className="pedidos-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon orange"><FaClock /></div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Pendientes</span>
            <span className="pedidos-stat-value">{stats.pendientes}</span>
          </div>
        </div>
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon blue-light"><FaSpinner /></div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">En Proceso</span>
            <span className="pedidos-stat-value">{stats.enProceso}</span>
          </div>
        </div>
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon purple"><FaTruck /></div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Enviados</span>
            <span className="pedidos-stat-value">{stats.enviados}</span>
          </div>
        </div>
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon green"><FaCheckDouble /></div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Entregados</span>
            <span className="pedidos-stat-value">{stats.entregados}</span>
          </div>
        </div>
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon red"><FaChartLine /></div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Total Ventas</span>
            <span className="pedidos-stat-value total-sales">{formatCurrency(stats.totalPrecio)}</span>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {showPermissionDenied && (
        <div className="pedidos-permission-denied">
          <FaExclamationTriangle /> {permissionError}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="pedidos-search-bar">
        <div className="pedidos-search-wrapper">
          <input 
            type="text" 
            placeholder="Buscar por cliente, email o número de pedido..." 
            value={searchTerm} 
            onChange={handleSearch} 
            className="pedidos-search-input" 
          />
        </div>
        <div className="pedidos-status-filter-wrapper">
          <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} className="pedidos-status-filter-select">
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="pedidos-actions">
          <button onClick={handleRefresh} className="pedidos-refresh-btn" disabled={refreshing}>
            <FaSync className={refreshing ? 'pedidos-spinning' : ''} /> Actualizar
          </button>
          {canCreateOrder() && (
            <button onClick={handleCreateClick} className="pedidos-create-btn">
              + Crear Pedido
            </button>
          )}
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="pedidos-table-wrapper">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Núm. Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? null : (
              currentOrders.map((order, index) => {
                const canEdit = canEditOrder(order);
                const canDelete = canDeleteOrder(order);
                
                return (
                  <tr key={order.id}>
                    <td data-label="#">{indexOfFirstOrder + index + 1}</td>
                    <td data-label="Núm. Pedido" className="pedidos-order-number">
                      {order.order_number || `ORD-${order.id}`}
                    </td>
                    <td data-label="Cliente">
                      <div className="pedidos-customer-info">
                        <strong>{order.customer_name}</strong>
                        <small>{order.customer_email}</small>
                      </div>
                    </td>
                    <td data-label="Total" className="pedidos-order-total">
                      {formatCurrency(order.total)}
                    </td>
                    <td data-label="Estado">{getStatusBadge(order.status)}</td>
                    <td data-label="Fecha">{formatDate(order.created_at)}</td>
                    <td data-label="Acciones" className="pedidos-actions-cell">
                      <button onClick={() => handleView(order)} className="pedidos-view-btn" title="Ver">
                        <FaEye /> Ver
                      </button>
                      <button 
                        onClick={() => handleEdit(order)} 
                        className={`pedidos-edit-btn ${!canEdit ? 'pedidos-disabled-btn' : ''}`}
                        disabled={!canEdit}
                        title={!canEdit ? 'No tienes permiso para editar' : 'Editar'}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(order)} 
                        className={`pedidos-delete-btn ${!canDelete ? 'pedidos-disabled-btn' : ''}`}
                        disabled={!canDelete}
                        title={!canDelete ? 'No tienes permiso para eliminar' : 'Eliminar'}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </td>
                  </tr>);
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Solo mostrar cuando NO hay pedidos en el sistema */}
      {orders.length === 0 && (
        <div className="pedidos-empty">
          <p>No hay pedidos en el sistema</p>
        </div>
      )}

      {/* Paginación */}
      {filteredOrders.length > ordersPerPage && (
        <div className="pedidos-pagination">
          <div className="pedidos-pagination-info">
            Mostrando {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} de {filteredOrders.length} pedidos
          </div>
          <div className="pedidos-pagination-controls">
            <button onClick={prevPage} disabled={currentPage === 1} className="pedidos-pagination-btn">Anterior</button>
            <span className="pedidos-pagination-current">Página {currentPage} de {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="pedidos-pagination-btn">Siguiente</button>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateOrderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onOrderCreated={handleOrderCreated} 
        currentUserRole={currentUserRole} 
        currentAdminId={currentAdminId}
      />
      
      <EditOrderModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setSelectedOrder(null); }} 
        onOrderUpdated={handleOrderUpdated} 
        order={selectedOrder} 
        currentUserRole={currentUserRole}
        currentAdminId={currentAdminId}
      />

      <ViewOrderModal 
        isOpen={isViewModalOpen} 
        onClose={() => { setIsViewModalOpen(false); setSelectedOrder(null); }} 
        order={selectedOrder} 
      />

      {/* Modal de confirmación de eliminación */}
      {showConfirmModal && (
        <div className="pedidos-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="pedidos-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="pedidos-modal-header"><h3>Confirmar Eliminación</h3></div>
            <div className="pedidos-modal-body">
              <p>¿Estás seguro de que deseas eliminar este pedido?</p>
              <p><strong>{orderToDelete?.order_number || `Pedido #${orderToDelete?.id}`}</strong></p>
              <p>Cliente: {orderToDelete?.customer_name}</p>
              <p className="pedidos-modal-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="pedidos-modal-footer">
              <button className="pedidos-modal-cancel" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button className="pedidos-modal-confirm" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? <><FaSpinner className="pedidos-spinner" /> Eliminando...</> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="pedidos-success-overlay">
          <div className="pedidos-success-container">
            <div className="pedidos-success-icon"><FaCheckCircle /></div>
            <h3>Éxito</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}