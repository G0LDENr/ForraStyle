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
  const [dailyStats, setDailyStats] = useState(null);
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
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

  const loadPermissionsAndStats = useCallback(async (adminId, userRole) => {
    try {
      const permissionsResult = await OrderController.getOrderPermissions(adminId, userRole);
      if (permissionsResult) {
        setPermissions({
          canCreate: permissionsResult.canCreate || false,
          canEdit: permissionsResult.canEdit || false,
          canDelete: permissionsResult.canDelete || false,
          dailyLimit: permissionsResult.dailyLimit || 0,
          currentDailyCount: permissionsResult.currentDailyCount || 0,
          editDailyLimit: permissionsResult.editDailyLimit || 0,
          currentEditCount: permissionsResult.currentEditCount || 0
        });
      }
      
      if (userRole === 1) {
        const stats = await OrderController.getDailyOrderStats(adminId, userRole);
        setDailyStats(stats);
      }
    } catch (error) {
      console.error('Error cargando permisos/estadisticas:', error);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      
      if (userRole === 1 && adminId) {
        const stats = await OrderController.getDailyOrderStats(adminId, userRole);
        setDailyStats(stats);
        
        const permissionsResult = await OrderController.getOrderPermissions(adminId, userRole);
        if (permissionsResult) {
          setPermissions({
            canCreate: permissionsResult.canCreate || false,
            canEdit: permissionsResult.canEdit || false,
            canDelete: permissionsResult.canDelete || false,
            dailyLimit: permissionsResult.dailyLimit || 0,
            currentDailyCount: permissionsResult.currentDailyCount || 0,
            editDailyLimit: permissionsResult.editDailyLimit || 0,
            currentEditCount: permissionsResult.currentEditCount || 0
          });
        }
      }
    } catch (error) {
      console.error('Error refrescando estadisticas:', error);
    }
  }, [getAdminIdAndRole]);

  useEffect(() => {
    const handlePermissionsUpdated = (event) => {
      console.log('🔄 Permisos actualizados, recargando...', event.detail);
      refreshStats();
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated);
    };
  }, [refreshStats]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      
      const ordersResult = await OrderController.getOrders(adminId, userRole);
      if (ordersResult.success) {
        setOrders(ordersResult.data);
      } else {
        setError(ordersResult.error);
      }
      
      await loadPermissionsAndStats(adminId, userRole);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [getAdminIdAndRole, loadPermissionsAndStats]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadAllData();
    }
  }, [loadAllData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      
      const ordersResult = await OrderController.getOrders(adminId, userRole);
      if (ordersResult.success) {
        setOrders(ordersResult.data);
      }
      
      await loadPermissionsAndStats(adminId, userRole);
    } catch (error) {
      console.error('Error refrescando:', error);
      setPermissionError('Error al refrescar los datos');
      setShowPermissionDenied(true);
      setTimeout(() => setShowPermissionDenied(false), 3000);
    } finally {
      setRefreshing(false);
    }
  }, [getAdminIdAndRole, loadPermissionsAndStats]);

  const refreshOrders = useCallback(async () => {
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      const result = await OrderController.getOrders(adminId, userRole);
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error refrescando pedidos:', error);
    }
  }, [getAdminIdAndRole]);

  const canCreateOrder = useCallback(() => {
    if (currentUserRole === 0) return true;
    if (!permissions.canCreate) return false;
    if (permissions.dailyLimit === 0) return true;
    return permissions.currentDailyCount < permissions.dailyLimit;
  }, [currentUserRole, permissions.canCreate, permissions.dailyLimit, permissions.currentDailyCount]);

  const canEditOrder = useCallback((order) => {
    if (currentUserRole === 0) return true;
    if (!permissions.canEdit) return false;
    if (order.created_by !== currentAdminId) return false;
    if (permissions.editDailyLimit === 0) return true;
    return permissions.currentEditCount < permissions.editDailyLimit;
  }, [currentUserRole, permissions.canEdit, permissions.editDailyLimit, permissions.currentEditCount, currentAdminId]);

  const canDeleteOrder = useCallback((order) => {
    if (currentUserRole === 0) return true;
    if (!permissions.canDelete) return false;
    return order.created_by === currentAdminId;
  }, [currentUserRole, permissions.canDelete, currentAdminId]);

  const handleDeleteClick = (order) => {
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
      await refreshOrders();
      await refreshStats();
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

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCreateClick = () => {
    if (!canCreateOrder()) {
      let errorMsg = 'No tienes permiso para crear pedidos';
      if (permissions.dailyLimit > 0 && permissions.currentDailyCount >= permissions.dailyLimit) {
        errorMsg = `Límite de creación alcanzado. Solo puedes crear ${permissions.dailyLimit} pedidos por día`;
      } else if (!permissions.canCreate) {
        errorMsg = 'No tienes permiso para crear pedidos';
      }
      setPermissionError(errorMsg);
      setShowPermissionDenied(true);
      setTimeout(() => setShowPermissionDenied(false), 3000);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleOrderCreated = async () => {
    await refreshOrders();
    await refreshStats();
  };

  const handleOrderUpdated = async () => {
    await refreshOrders();
    await refreshStats();
  };

  // Calcular estadísticas de pedidos
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

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchLower) || 
                          order.customer_email?.toLowerCase().includes(searchLower) ||
                          order.order_number?.toLowerCase().includes(searchLower);
    let matchesStatus = true;
    if (statusFilter !== 'todos') matchesStatus = order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <button onClick={() => { initialLoadDone.current = false; loadAllData(); }} className="pedidos-retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h2 className="pedidos-title"><FaShoppingCart className="pedidos-title-icon" /> Gestión de Pedidos</h2>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="pedidos-stats-grid">
        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon blue">
            <FaClipboardList />
          </div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Total Pedidos</span>
            <span className="pedidos-stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon orange">
            <FaClock />
          </div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Pendientes</span>
            <span className="pedidos-stat-value">{stats.pendientes}</span>
          </div>
        </div>

        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon blue-light">
            <FaSpinner />
          </div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">En Proceso</span>
            <span className="pedidos-stat-value">{stats.enProceso}</span>
          </div>
        </div>

        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon purple">
            <FaTruck />
          </div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Enviados</span>
            <span className="pedidos-stat-value">{stats.enviados}</span>
          </div>
        </div>

        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon green">
            <FaCheckDouble />
          </div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Entregados</span>
            <span className="pedidos-stat-value">{stats.entregados}</span>
          </div>
        </div>

        <div className="pedidos-stat-card">
          <div className="pedidos-stat-icon red">
            <FaChartLine />
          </div>
          <div className="pedidos-stat-info">
            <span className="pedidos-stat-label">Total Ventas</span>
            <span className="pedidos-stat-value total-sales">{formatCurrency(stats.totalPrecio)}</span>
          </div>
        </div>
      </div>

      {showPermissionDenied && (
        <div className="pedidos-permission-denied">
          <FaExclamationTriangle />
          <span>{permissionError}</span>
        </div>
      )}

      {successMessage && !showSuccessModal && (
        <div className="pedidos-success-message">
          <FaCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="pedidos-search-bar">
        <div className="pedidos-search-wrapper">
          <input type="text" placeholder="Buscar por cliente, email o número de pedido..." value={searchTerm} onChange={handleSearch} className="pedidos-search-input" />
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
          <button 
            onClick={handleRefresh} 
            className="pedidos-refresh-btn"
            disabled={refreshing}
            title="Actualizar datos"
          >
            <FaSync className={refreshing ? 'pedidos-spinning' : ''} /> {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          {dailyStats && permissions.canCreate && (
            <div className="pedidos-daily-stats-badge" title={`Creados hoy: ${dailyStats.used} / ${dailyStats.limit === 0 ? 'Sin límite' : dailyStats.limit}`}>
              Creados hoy: {dailyStats.used} / {dailyStats.limit === 0 ? 'Sin límite' : dailyStats.limit}
            </div>
          )}
          {permissions.canCreate && (
            <button onClick={handleCreateClick} className="pedidos-create-btn">
              + Crear Pedido
            </button>
          )}
        </div>
      </div>

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
            {currentOrders.map((order, index) => {
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
                    <button 
                      onClick={() => handleView(order)} 
                      className="pedidos-view-btn"
                      title="Ver detalles"
                    >
                      <FaEye /> Ver
                    </button>
                    <button 
                      onClick={() => handleEdit(order)} 
                      className={`pedidos-edit-btn ${!canEdit ? 'pedidos-disabled-btn' : ''}`}
                      disabled={!canEdit}
                      title="Editar"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(order)} 
                      className={`pedidos-delete-btn ${!canDelete ? 'pedidos-disabled-btn' : ''}`}
                      disabled={!canDelete}
                      title="Eliminar"
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="pedidos-empty">
          <p>No se encontraron pedidos</p>
        </div>
      )}

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

      <CreateOrderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onOrderCreated={handleOrderCreated} 
        currentUserRole={currentUserRole} 
        currentAdminId={currentAdminId}
      />
      
      <EditOrderModal 
        isOpen={isEditModalOpen} 
        onClose={() => { 
          setIsEditModalOpen(false); 
          setSelectedOrder(null); 
        }} 
        onOrderUpdated={handleOrderUpdated} 
        order={selectedOrder} 
        currentUserRole={currentUserRole}
        currentAdminId={currentAdminId}
      />

      <ViewOrderModal 
        isOpen={isViewModalOpen} 
        onClose={() => { 
          setIsViewModalOpen(false); 
          setSelectedOrder(null); 
        }} 
        order={selectedOrder} 
      />

      {showConfirmModal && (
        <div className="pedidos-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="pedidos-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="pedidos-modal-header"><h3>Confirmar Eliminación</h3></div>
            <div className="pedidos-modal-body">
              <p>¿Estás seguro de que deseas eliminar este pedido?</p>
              <p className="pedidos-modal-item"><strong>{orderToDelete?.order_number || `Pedido #${orderToDelete?.id}`}</strong></p>
              <p className="pedidos-modal-item">Cliente: {orderToDelete?.customer_name}</p>
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