import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaClipboardList, FaShoppingCart, FaCog, FaSignOutAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Logo from '../img/ForraDtyle.png';
import '../css/home/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Estados para el formulario de pedidos
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    cliente: '',
    producto: '',
    cantidad: 1,
    precio: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    descripcion: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
    
    // Cargar pedidos guardados
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, [navigate]);

  // Guardar pedidos en localStorage
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateTotal = () => {
    return formData.cantidad * formData.precio;
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    if (editingId) {
      const updatedOrders = orders.map(order => 
        order.id === editingId 
          ? { ...formData, id: editingId, total: calculateTotal() }
          : order
      );
      setOrders(updatedOrders);
      setEditingId(null);
    } else {
      const newOrder = {
        ...formData,
        id: Date.now(),
        total: calculateTotal(),
        fechaCreacion: new Date().toISOString()
      };
      setOrders([newOrder, ...orders]);
    }
    
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      producto: '',
      cantidad: 1,
      precio: 0,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      descripcion: ''
    });
    setEditingId(null);
  };

  const handleEditOrder = (order) => {
    setFormData({
      cliente: order.cliente,
      producto: order.producto,
      cantidad: order.cantidad,
      precio: order.precio,
      fecha: order.fecha,
      estado: order.estado,
      descripcion: order.descripcion || ''
    });
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleDeleteOrder = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      const filteredOrders = orders.filter(order => order.id !== id);
      setOrders(filteredOrders);
    }
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.producto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || order.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <div className="orders-container">
            <div className="orders-header">
              <button 
                className="btn-primary"
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
              >
                <FaPlus /> {showForm ? 'Cancelar' : 'Nuevo Pedido'}
              </button>
            </div>

            {showForm && (
              <div className="order-form-container">
                <h3>{editingId ? 'Editar Pedido' : 'Crear Nuevo Pedido'}</h3>
                <form onSubmit={handleSubmitOrder} className="order-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cliente *</label>
                      <input
                        type="text"
                        name="cliente"
                        value={formData.cliente}
                        onChange={handleInputChange}
                        required
                        placeholder="Nombre del cliente"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Producto *</label>
                      <input
                        type="text"
                        name="producto"
                        value={formData.producto}
                        onChange={handleInputChange}
                        required
                        placeholder="Nombre del producto"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad *</label>
                      <input
                        type="number"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleInputChange}
                        required
                        min="1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Precio Unitario *</label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de entrega</label>
                      <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Detalles adicionales del pedido..."
                    />
                  </div>

                  <div className="form-total">
                    <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success">
                      {editingId ? 'Actualizar Pedido' : 'Crear Pedido'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="orders-filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por cliente o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-buttons">
                <button 
                  className={filterStatus === 'todos' ? 'active' : ''}
                  onClick={() => setFilterStatus('todos')}
                >
                  Todos
                </button>
                <button 
                  className={filterStatus === 'pendiente' ? 'active' : ''}
                  onClick={() => setFilterStatus('pendiente')}
                >
                  Pendientes
                </button>
                <button 
                  className={filterStatus === 'procesando' ? 'active' : ''}
                  onClick={() => setFilterStatus('procesando')}
                >
                  Procesando
                </button>
                <button 
                  className={filterStatus === 'completado' ? 'active' : ''}
                  onClick={() => setFilterStatus('completado')}
                >
                  Completados
                </button>
              </div>
            </div>

            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <FaClipboardList size={60} />
                  <h3>No hay pedidos registrados</h3>
                  <p>Haz clic en "Nuevo Pedido" para comenzar</p>
                </div>
              ) : (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id.toString().slice(-6)}</td>
                          <td>{order.cliente}</td>
                          <td>{order.producto}</td>
                          <td>{order.cantidad}</td>
                          <td>${order.precio.toFixed(2)}</td>
                          <td><strong>${order.total.toFixed(2)}</strong></td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(order.estado) }}
                            >
                              {getStatusText(order.estado)}
                            </span>
                          </td>
                          <td>{order.fecha}</td>
                          <td className="actions">
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditOrder(order)}
                              title="Editar"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Eliminar"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
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
              <div className="info-row">
                <label>Total pedidos:</label>
                <p>{orders.length} pedidos realizados</p>
              </div>
            </div>
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
        return <div></div>;
    }
  };

  return (
    <div className="home-app">
      {/* Navbar Superior con Logo y Nombre a la izquierda */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo-section">
            <img 
              src={Logo} 
              alt="ForraStyle" 
              className="logo-img"
            />
            <h2 className="logo-text">ForraStyle</h2>
          </div>
          
          <div className="nav-menu">
            <button 
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaClipboardList /> Pedidos
            </button>
            <button 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUserCircle /> Perfil
            </button>
            <button 
              className={`nav-link ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              <FaShoppingCart /> Carrito
            </button>
            <button 
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Configuración
            </button>
            <button 
              className="nav-link logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === 'orders' && 'Gestión de Pedidos'}
            {activeTab === 'profile' && 'Mi Perfil'}
            {activeTab === 'cart' && 'Mi Carrito'}
            {activeTab === 'settings' && 'Configuración'}
          </h1>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Home;