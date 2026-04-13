import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserList } from '../components/Users/User';
import PermissionManager from '../components/Admin/PermissionManager';
import { OrdersManager } from '../components/Pedidos/Pedidos';
import { SettingsManager } from '../components/Settings/Settings';
import { EarningsManager } from '../components/Admin/EarningsManager';
import { FaBars, FaTimes, FaUsers, FaUserCircle, FaSignOutAlt, FaClipboardList, FaCog, FaShieldAlt, FaDollarSign } from 'react-icons/fa';
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
        return <OrdersManager userRole={userData?.rol} />;
      
      case 'earnings':
        // Solo Super Admin ve esta sección en el menú
        if (userData?.rol === 0) {
          return <EarningsManager currentUserId={userData?.id} />;
        }
        return null;
      
      case 'settings':
        return (
          <SettingsManager 
            userData={userData}
            users={users}
            orders={orders}
          />
        );
      
      default:
        return (
          <UserList 
            currentAdminId={userData?.id}
            currentUserRole={userData?.rol}
          />
        );
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

          {userData?.rol === 0 && (
            <button 
              className={`admin-nav-btn ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <FaShieldAlt className="admin-nav-icon" />
              Gestión de Permisos
            </button>
          )}

          <button 
            className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaClipboardList className="admin-nav-icon" />
            Pedidos
          </button>

          {/* Solo Super Admin ve Ganancias en el menú */}
          {userData?.rol === 0 && (
            <button 
              className={`admin-nav-btn ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              <FaDollarSign className="admin-nav-icon" />
              Ganancias
            </button>
          )}

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