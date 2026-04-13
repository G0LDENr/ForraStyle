import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaMoneyBillWave, FaClipboardList, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSync } from 'react-icons/fa';
import '../../css/pedidos/pedidos.css';

export function OrdersManager({ userRole }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, estado: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'pendiente': return 'pedidos-status-pending';
      case 'completado': return 'pedidos-status-completed';
      case 'cancelado': return 'pedidos-status-cancelled';
      default: return 'pedidos-status-default';
    }
  };

  const getStatusIcon = (estado) => {
    switch(estado) {
      case 'pendiente': return <FaHourglassHalf />;
      case 'completado': return <FaCheckCircle />;
      case 'cancelado': return <FaTimesCircle />;
      default: return <FaClipboardList />;
    }
  };

  const getStatusText = (estado) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.cliente?.toLowerCase().includes(searchLower) || 
      order.producto?.toLowerCase().includes(searchLower) ||
      order.id?.toString().includes(searchLower);
    
    let matchesFilter = true;
    if (filter !== 'todos') {
      matchesFilter = order.estado === filter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  const stats = {
    total: orders.length,
    pendientes: orders.filter(o => o.estado === 'pendiente').length,
    completados: orders.filter(o => o.estado === 'completado').length,
    cancelados: orders.filter(o => o.estado === 'cancelado').length,
    ingresos: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="pedidos-loading">
        <div className="pedidos-spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h2 className="pedidos-title">
          <FaClipboardList className="pedidos-title-icon" />
          Gestión de Pedidos
        </h2>
      </div>

      {/* Estadisticas */}
      <div className="pedidos-stats">
        <div className="pedidos-stat-card pedidos-stat-total">
          <div className="pedidos-stat-icon"><FaBoxOpen /></div>
          <div className="pedidos-stat-info">
            <h3>Total Pedidos</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="pedidos-stat-card pedidos-stat-pending">
          <div className="pedidos-stat-icon"><FaHourglassHalf /></div>
          <div className="pedidos-stat-info">
            <h3>Pendientes</h3>
            <p>{stats.pendientes}</p>
          </div>
        </div>
        <div className="pedidos-stat-card pedidos-stat-completed">
          <div className="pedidos-stat-icon"><FaCheckCircle /></div>
          <div className="pedidos-stat-info">
            <h3>Completados</h3>
            <p>{stats.completados}</p>
          </div>
        </div>
        <div className="pedidos-stat-card pedidos-stat-cancelled">
          <div className="pedidos-stat-icon"><FaTimesCircle /></div>
          <div className="pedidos-stat-info">
            <h3>Cancelados</h3>
            <p>{stats.cancelados}</p>
          </div>
        </div>
        <div className="pedidos-stat-card pedidos-stat-income">
          <div className="pedidos-stat-icon"><FaMoneyBillWave /></div>
          <div className="pedidos-stat-info">
            <h3>Ingresos Totales</h3>
            <p>${stats.ingresos.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Barra de busqueda y filtros */}
      <div className="pedidos-search-bar">
        <div className="pedidos-search-wrapper">
          <input 
            type="text" 
            placeholder="Buscar por cliente, producto o ID..." 
            value={searchTerm} 
            onChange={handleSearch} 
            className="pedidos-search-input" 
          />
        </div>
        <div className="pedidos-filter-wrapper">
          <select 
            value={filter} 
            onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }} 
            className="pedidos-filter-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
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
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="pedidos-table-container">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              {userRole === 0 && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan={userRole === 0 ? 8 : 7} className="pedidos-empty-row">
                  No hay pedidos registrados
                </td>
              </tr>
            ) : (
              currentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id.toString().slice(-6)}</td>
                  <td>{order.cliente || 'N/A'}</td>
                  <td>{order.producto || 'N/A'}</td>
                  <td>{order.cantidad || 0}</td>
                  <td>${(order.total || order.cantidad * order.precio || 0).toFixed(2)}</td>
                  <td>
                    <span className={`pedidos-status-badge ${getStatusColor(order.estado)}`}>
                      {getStatusIcon(order.estado)}
                      {getStatusText(order.estado)}
                    </span>
                  </td>
                  <td>{order.fecha || new Date().toLocaleDateString()}</td>
                  {userRole === 0 && (
                    <td className="pedidos-actions-cell">
                      <select
                        value={order.estado}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="pedidos-status-select"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && searchTerm && (
        <div className="pedidos-no-results">
          <p>No se encontraron pedidos para "{searchTerm}"</p>
        </div>
      )}

      {/* Paginacion */}
      {filteredOrders.length > ordersPerPage && (
        <div className="pedidos-pagination">
          <div className="pedidos-pagination-info">
            Mostrando {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} de {filteredOrders.length} pedidos
          </div>
          <div className="pedidos-pagination-controls">
            <button onClick={prevPage} disabled={currentPage === 1} className="pedidos-pagination-btn">
              Anterior
            </button>
            <span className="pedidos-pagination-current">
              Página {currentPage} de {totalPages}
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="pedidos-pagination-btn">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}