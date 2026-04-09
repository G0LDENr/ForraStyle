// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserList } from '../components/Users/User';
import { FaUsers, FaUserCircle, FaClipboardList, FaShoppingCart, FaCog, FaSignOutAlt, FaBell } from 'react-icons/fa';
import '../css/home/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return <UserList />;
      case 'profile':
        return (
          <div className="profile-container">
            <h2>Mi Perfil</h2>
            <div className="profile-info">
              <div className="avatar">
                <FaUserCircle size={80} />
              </div>
              <div className="info-row">
                <label>Nombre completo:</label>
                <p>{userData?.nombre || userData?.name || 'Usuario'}</p>
              </div>
              <div className="info-row">
                <label>Correo electrónico:</label>
                <p>{userData?.correo || userData?.email || ''}</p>
              </div>
              <div className="info-row">
                <label>Tipo de usuario:</label>
                <p className="badge">{userData?.rol === 1 ? 'Administrador' : 'Usuario'}</p>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="empty-state">
            <FaClipboardList size={60} />
            <h3>No hay pedidos registrados</h3>
            <p>Tus pedidos aparecerán aquí</p>
          </div>
        );
      case 'cart':
        return (
          <div className="empty-state">
            <FaShoppingCart size={60} />
            <h3>Carrito vacío</h3>
            <p>Agrega productos a tu carrito</p>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-container">
            <h2>Configuración</h2>
            <div className="settings-option">
              <label>Notificaciones</label>
              <input type="checkbox" /> Recibir notificaciones por email
            </div>
            <div className="settings-option">
              <label>Idioma</label>
              <select>
                <option>Español</option>
                <option>Inglés</option>
              </select>
            </div>
          </div>
        );
      default:
        return <UserList />;
    }
  };

  return (
    <div className="home-app">
      {/* Navbar Superior */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <h2>MiApp</h2>
          </div>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>

          <div className="nav-right">
            <button className="icon-btn">
              <FaBell />
            </button>
            <div className="user-menu">
              <span className="user-name">{userData?.nombre || userData?.name || 'Usuario'}</span>
              <FaUserCircle size={32} />
            </div>
          </div>
        </div>
      </nav>

      {/* Menú inferior para móvil */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}>
          <FaUsers /> Usuarios
        </button>
        <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}>
          <FaUserCircle /> Perfil
        </button>
        <button onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}>
          <FaClipboardList /> Pedidos
        </button>
        <button onClick={() => { setActiveTab('cart'); setMobileMenuOpen(false); }}>
          <FaShoppingCart /> Carrito
        </button>
        <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}>
          <FaCog /> Configuración
        </button>
        <button onClick={handleLogout}>
          <FaSignOutAlt /> Salir
        </button>
      </div>

      {/* Layout principal */}
      <div className="main-layout">
        {/* Sidebar izquierdo */}
        <aside className="sidebar-menu">
          <div className="user-profile">
            <FaUserCircle size={60} />
            <h3>{userData?.nombre || userData?.name || 'Usuario'}</h3>
            <p>{userData?.correo || userData?.email || ''}</p>
          </div>
          
          <nav className="menu-nav">
            <button 
              className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FaUsers /> Usuarios
            </button>
            <button 
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUserCircle /> Mi Perfil
            </button>
            <button 
              className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaClipboardList /> Mis Pedidos
            </button>
            <button 
              className={`menu-item ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              <FaShoppingCart /> Mi Carrito
            </button>
            <button 
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Configuración
            </button>
            <button 
              className="menu-item logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="content-area">
          <div className="content-header">
            <h1>
              {activeTab === 'users' && 'Gestión de Usuarios'}
              {activeTab === 'profile' && 'Mi Perfil'}
              {activeTab === 'orders' && 'Mis Pedidos'}
              {activeTab === 'cart' && 'Mi Carrito'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
          </div>
          <div className="content-body">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;