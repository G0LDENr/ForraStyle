import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserList } from '../components/Users/User';
import { FaBars, FaTimes, FaUsers, FaUserCircle, FaSignOutAlt, FaClipboardList, FaCog } from 'react-icons/fa';
import '../css/home/home-admin.css';

const HomeAdmin = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User Role:', userRole);
    
    if (!token || !user) {
      console.log('No autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }

    if (userRole !== '1') {
      console.log('No es administrador, redirigiendo a home');
      navigate('/home');
      return;
    }

    try {
      const userParsed = JSON.parse(user);
      console.log('User data from localStorage:', userParsed);
      setUserData(userParsed);
      loadOrders();
      loadUsers();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  }, [navigate]);

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  };

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#f59e0b';
      case 'procesando': return '#3b82f6';
      case 'completado': return '#10b981';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (estado) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'procesando': return 'Procesando';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return <UserList />;
      
      case 'orders':
        return (
          <div className="admin-orders-container">
            <h2 className="admin-section-title">Gestión de Pedidos</h2>
            <div className="admin-orders-stats">
              <div className="admin-stat-card">
                <h3>Total Pedidos</h3>
                <p>{orders.length}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Pendientes</h3>
                <p>{orders.filter(o => o.estado === 'pendiente').length}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Completados</h3>
                <p>{orders.filter(o => o.estado === 'completado').length}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Ingresos Totales</h3>
                <p>${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="admin-orders-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty-row">No hay pedidos registrados</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id.toString().slice(-6)}</td>
                        <td>{order.cliente}</td>
                        <td>{order.producto}</td>
                        <td>{order.cantidad}</td>
                        <td>${(order.total || order.cantidad * order.precio).toFixed(2)}</td>
                        <td>
                          <span 
                            className="admin-status-badge"
                            style={{ backgroundColor: getStatusColor(order.estado) }}
                          >
                            {getStatusText(order.estado)}
                          </span>
                        </td>
                        <td>{order.fecha}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="admin-settings-container">
            <h2 className="admin-section-title">Configuración del Sistema</h2>
            <div className="admin-settings-card">
              <div className="admin-setting-item">
                <label>Rol del usuario actual:</label>
                <span className="admin-badge-admin">Administrador</span>
              </div>
              <div className="admin-setting-item">
                <label>Versión del sistema:</label>
                <span>1.0.0</span>
              </div>
              <div className="admin-setting-item">
                <label>Total de usuarios:</label>
                <span>{users.length}</span>
              </div>
              <div className="admin-setting-item">
                <label>Total de pedidos:</label>
                <span>{orders.length}</span>
              </div>
              <div className="admin-setting-item">
                <button 
                  className="admin-btn-clear-data"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de limpiar todos los datos?')) {
                      localStorage.removeItem('orders');
                      setOrders([]);
                      alert('Datos limpiados correctamente');
                    }
                  }}
                >
                  Limpiar todos los datos
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <UserList />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <button 
        className={`admin-sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              <FaUserCircle size={60} />
            </div>
            <h1>
              Forra <span className="admin-crazy-cursive">Style</span>
            </h1>
            <h2 className="admin-user-name">
              {userData?.name || userData?.nombre || 'Administrador'}
            </h2>
            <p className="admin-user-email">
              {userData?.email || userData?.correo || ''}
            </p>
            <span className="admin-user-role">
              {userData?.rol === 1 ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>
        
        <nav className="admin-sidebar-nav">
          <button 
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers className="admin-nav-icon" />
            Usuarios
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaClipboardList className="admin-nav-icon" />
            Pedidos
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="admin-nav-icon" />
            Configuración
          </button>

          <button 
            className="admin-nav-btn admin-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="admin-nav-icon" />
            Cerrar Sesión
          </button>
        </nav>
      </aside>

      <main className={`admin-main-content ${sidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        <div className="admin-content-wrapper">
          <div className="admin-header-section">
            <h2 className="admin-section-title">
              Panel de Administración - Forra <span className="admin-crazy-cursive">Style</span>
            </h2>
            
            <div className="admin-header-right">
              <button 
                className="admin-logout-btn-header" 
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Salir
              </button>
            </div>
          </div>
          
          <div className="admin-dynamic-content">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeAdmin;