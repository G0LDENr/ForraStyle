// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserList } from '../components/Users/User';
import { FaBars, FaTimes, FaUsers, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import '../css/home/home-admin.css';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User data from localStorage:', user);
    setUserData(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    return <UserList />;
  };

  return (
    <div className="dashboard-container">
      <button 
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              <FaUserCircle size={60} />
            </div>
            <h1>
              Forra <span className="crazy-cursive">Style</span>
            </h1>
            <h2 className="user-name">{userData?.nombre || userData?.name || 'Administrador'}</h2>
            <p className="user-email">{userData?.correo || userData?.email || ''}</p>
            <span className="user-role">
              {userData?.rol === 1 ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers className="nav-icon" />
            Usuarios
          </button>

          <button 
            className="nav-btn logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="nav-icon" />
            Cerrar Sesión
          </button>
        </nav>
      </aside>

      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-wrapper">
          <div className="header-section">
            <h2 className="section-title">
              Forra <span className="crazy-cursive">Style</span>
            </h2>
            
            <div className="header-right">
              <button 
                className="logout-btn-header" 
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Salir
              </button>
            </div>
          </div>
          
          <div className="dynamic-content">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;