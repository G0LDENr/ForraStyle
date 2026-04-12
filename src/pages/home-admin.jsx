import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserList } from '../components/Users/User';
import PermissionManager from '../components/Admin/PermissionManager';
import { FaBars, FaTimes, FaUsers, FaUserCircle, FaSignOutAlt, FaClipboardList, FaCog, FaShieldAlt } from 'react-icons/fa';
import '../css/home/home-admin.css';

const HomeAdmin = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminPermissions, setAdminPermissions] = useState(null);

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

    if (userRole !== '1' && userRole !== '0') {
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
      
      // Cargar permisos si es admin (rol 1)
      if (userParsed.rol === 1) {
        loadAdminPermissions(userParsed.id);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  }, [navigate]);

  const loadAdminPermissions = (adminId) => {
    const permissions = localStorage.getItem(`admin_permissions_${adminId}`);
    if (permissions) {
      setAdminPermissions(JSON.parse(permissions));
    } else {
      // Permisos por defecto para nuevos admins
      const defaultPermissions = {
        createUsers: { enabled: false, dailyLimit: 0, currentCount: 0, lastReset: new Date().toDateString() },
        editUsers: { enabled: false, canEditAdmins: false },
        deleteUsers: { enabled: false, canDeleteAdmins: false },
        viewReports: { enabled: false },
        manageOrders: { enabled: false }
      };
      setAdminPermissions(defaultPermissions);
    }
  };

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

  // Verificar si el admin puede ver pedidos
  const canViewOrders = () => {
    if (userData?.rol === 0) return true;
    return adminPermissions?.manageOrders?.enabled || false;
  };

  // Verificar si el admin puede ver configuraciones
  const canViewSettings = () => {
    if (userData?.rol === 0) return true;
    return adminPermissions?.viewReports?.enabled || false;
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return (
          <UserList 
            currentAdminId={userData?.id}
            currentUserRole={userData?.rol}
          />
        );
      
      case 'permissions':
        // Solo visible para super admin (rol 0)
        if (userData?.rol === 0) {
          return (
            <PermissionManager 
              currentUserRole={userData?.rol}
              currentUserId={userData?.id}
            />
          );
        }
        return (
          <div className="admin-access-denied">
            <FaShieldAlt size={48} />
            <h3>Acceso Denegado</h3>
            <p>No tienes permisos para acceder a esta sección</p>
          </div>
        );
      
      case 'orders':
        if (!canViewOrders()) {
          return (
            <div className="admin-access-denied">
              <FaShieldAlt size={48} />
              <h3>Acceso Denegado</h3>
              <p>No tienes permisos para ver los pedidos</p>
            </div>
          );
        }
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
        if (!canViewSettings()) {
          return (
            <div className="admin-access-denied">
              <FaShieldAlt size={48} />
              <h3>Acceso Denegado</h3>
              <p>No tienes permisos para ver la configuración</p>
            </div>
          );
        }
        return (
          <div className="admin-settings-container">
            <h2 className="admin-section-title">Configuración del Sistema</h2>
            <div className="admin-settings-card">
              <div className="admin-setting-item">
                <label>Rol del usuario actual:</label>
                <span className={userData?.rol === 0 ? 'admin-badge-super' : 'admin-badge-admin'}>
                  {userData?.rol === 0 ? 'Super Administrador' : 'Administrador'}
                </span>
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
              
              {/* Mostrar permisos actuales si es admin */}
              {userData?.rol === 1 && adminPermissions && (
                <div className="admin-permissions-info">
                  <h4>Tus permisos actuales:</h4>
                  <ul>
                    <li>Crear usuarios: {adminPermissions.createUsers?.enabled ? `Sí (${adminPermissions.createUsers.dailyLimit === 0 ? 'sin límite' : adminPermissions.createUsers.dailyLimit + '/día'})` : 'No'}</li>
                    <li>Editar usuarios: {adminPermissions.editUsers?.enabled ? 'Sí' : 'No'}</li>
                    <li>Eliminar usuarios: {adminPermissions.deleteUsers?.enabled ? 'Sí' : 'No'}</li>
                    <li>Ver reportes: {adminPermissions.viewReports?.enabled ? 'Sí' : 'No'}</li>
                    <li>Gestionar pedidos: {adminPermissions.manageOrders?.enabled ? 'Sí' : 'No'}</li>
                  </ul>
                </div>
              )}
              
              {userData?.rol === 0 && (
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
              )}
            </div>
          </div>
        );
      
      default:
        return <UserList 
          currentAdminId={userData?.id}
          currentUserRole={userData?.rol}
        />;
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
            <span className={`admin-user-role ${userData?.rol === 0 ? 'role-super' : 'role-admin'}`}>
              {userData?.rol === 0 ? 'Super Administrador' : 'Administrador'}
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

          {/* Solo super admin puede ver gestión de permisos */}
          {userData?.rol === 0 && (
            <button 
              className={`admin-nav-btn ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <FaShieldAlt className="admin-nav-icon" />
              Gestión de Permisos
            </button>
          )}

          {/* Mostrar pedidos solo si tiene permiso */}
          {canViewOrders() && (
            <button 
              className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaClipboardList className="admin-nav-icon" />
              Pedidos
            </button>
          )}

          {/* Mostrar configuración solo si tiene permiso */}
          {canViewSettings() && (
            <button 
              className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog className="admin-nav-icon" />
              Configuración
            </button>
          )}

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
              {/* Mostrar estadísticas diarias si es admin */}
              {userData?.rol === 1 && adminPermissions?.createUsers?.enabled && (
                <div className="admin-daily-stats">
                  <span className="stats-badge">
                    Creados hoy: {adminPermissions.createUsers.currentCount}/{adminPermissions.createUsers.dailyLimit === 0 ? '∞' : adminPermissions.createUsers.dailyLimit}
                  </span>
                </div>
              )}
              
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