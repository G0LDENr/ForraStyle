import React, { useState, useEffect, useCallback } from 'react';
import { UserController } from '../../controllers/UserController';
import { OrderController } from '../../controllers/OrdenesController';
import EditPermissionsModal from './Edit-Permissions';
import { FaUserShield, FaSync, FaCheck, FaTimes, FaEdit, FaSpinner, FaShoppingCart } from 'react-icons/fa';
import '../../css/admin/permission-manager.css';

const PermissionManager = ({ currentUserRole, currentUserId }) => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('users');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(null);
  const [initialModalTab, setInitialModalTab] = useState('users');

  const canEditAdminPermissions = useCallback(() => {
    return currentUserRole === 0;
  }, [currentUserRole]);

  const canViewPanel = useCallback(() => {
    return currentUserRole === 0;
  }, [currentUserRole]);

  const toBoolean = useCallback((value) => {
    if (value === true || value === false) return value;
    if (value === 1 || value === 0) return value === 1;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return false;
  }, []);

  const loadAdmins = useCallback(async () => {
    console.log('🚀 Iniciando carga de administradores...');
    setLoading(true);
    setError(null);
    
    try {
      const result = await UserController.getUsers(currentUserId, currentUserRole);
      console.log('📦 Resultado de getUsers:', result);
      
      if (result.success) {
        const adminUsers = result.data.filter(user => parseInt(user.rol) === 1);
        console.log(`👥 Total de administradores encontrados: ${adminUsers.length}`);
        
        const adminsWithPermissions = await Promise.all(
          adminUsers.map(async (admin) => {
            console.log(`\n📌 Procesando admin: ${admin.name} (ID: ${admin.id})`);
            
            const userPermissions = await UserController.getUserPermissions(admin.id, currentUserRole);
            console.log(`🔐 Permisos de usuarios para ${admin.name}:`, userPermissions);
            
            const orderPermissionsResult = await OrderController.getAdminOrderPermissions(admin.id, currentUserRole);
            const orderPermissions = orderPermissionsResult.success ? orderPermissionsResult.data : {};
            console.log(`📦 Permisos de pedidos para ${admin.name}:`, orderPermissions);
            
            const normalizedUserPermissions = {
              createUsers: { 
                enabled: toBoolean(userPermissions?.canCreate), 
                dailyLimit: userPermissions?.dailyLimit || 0,
              },
              editUsers: { 
                enabled: toBoolean(userPermissions?.canEdit), 
                dailyLimit: userPermissions?.editDailyLimit || 0,
                canEditAdmins: toBoolean(userPermissions?.canEditAdmins)
              },
              deleteUsers: { 
                enabled: toBoolean(userPermissions?.canDelete),
                canDeleteAdmins: toBoolean(userPermissions?.canDeleteAdmins),
                canDeleteSuperAdmin: toBoolean(userPermissions?.canDeleteSuperAdmin)
              }
            };
            
            const normalizedOrderPermissions = {
              createOrders: {
                enabled: toBoolean(orderPermissions.canCreateOrders),
                dailyLimit: orderPermissions.orderDailyLimit || 0,
              },
              editOrders: {
                enabled: toBoolean(orderPermissions.canEditOrders),
                dailyLimit: orderPermissions.orderEditDailyLimit || 0,
                canEditAllOrders: toBoolean(orderPermissions.canEditAllOrders)
              },
              deleteOrders: {
                enabled: toBoolean(orderPermissions.canDeleteOrders),
                canDeleteAllOrders: toBoolean(orderPermissions.canDeleteAllOrders)
              }
            };
            
            const allPermissions = {
              ...normalizedUserPermissions,
              ...normalizedOrderPermissions
            };
            
            console.log(`✅ Permisos normalizados para ${admin.name}:`, allPermissions);
            
            return {
              ...admin,
              permissions: allPermissions,
              currentCounts: {
                orderCurrentCount: orderPermissions.orderCurrentCount || 0,
                orderEditCurrentCount: orderPermissions.orderEditCurrentCount || 0
              }
            };
          })
        );
        
        console.log('\nTodos los admins procesados:', adminsWithPermissions);
        setAdmins(adminsWithPermissions);
        setFilteredAdmins(adminsWithPermissions);
      } else {
        console.error('❌ Error en getUsers:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar administradores:', error);
      setError('Error al cargar la lista de administradores');
    } finally {
      setLoading(false);
      console.log('Carga finalizada');
    }
  }, [currentUserId, currentUserRole, toBoolean]);

  const filterAdmins = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredAdmins(admins);
      setCurrentPage(1);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = admins.filter(admin => 
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower)
    );
    
    setFilteredAdmins(filtered);
    setCurrentPage(1);
  }, [searchTerm, admins]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  useEffect(() => {
    filterAdmins();
  }, [filterAdmins]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (admin) => {
    if (!canEditAdminPermissions()) {
      setMessage(`⚠️ No tienes permisos para editar los permisos de ${admin.name}`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setSelectedAdmin(admin);
    setSelectedPermissions({
      createUsers: { ...admin.permissions.createUsers },
      editUsers: { ...admin.permissions.editUsers },
      deleteUsers: { ...admin.permissions.deleteUsers },
      createOrders: { ...admin.permissions.createOrders },
      editOrders: { ...admin.permissions.editOrders },
      deleteOrders: { ...admin.permissions.deleteOrders }
    });
    
    // Establece la pestaña inicial basada en el activeTab actual
    setInitialModalTab(activeTab);
    setIsEditModalOpen(true);
  };

  const handleSavePermissions = async (newPermissions) => {
    if (!selectedAdmin) return;
    
    if (!canEditAdminPermissions()) {
      setMessage(`⚠️ No tienes permisos para modificar los permisos de ${selectedAdmin.name}`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    try {
      const userResult = await UserController.updateAdminPermissions(
        selectedAdmin.id,
        {
          canCreateUsers: Boolean(newPermissions.createUsers.enabled),
          createDailyLimit: newPermissions.createUsers.dailyLimit || 0,
          canEditUsers: Boolean(newPermissions.editUsers.enabled),
          editDailyLimit: newPermissions.editUsers.dailyLimit || 0,
          canEditAdmins: Boolean(newPermissions.editUsers.canEditAdmins),
          canDeleteUsers: Boolean(newPermissions.deleteUsers.enabled),
          canDeleteAdmins: Boolean(newPermissions.deleteUsers.canDeleteAdmins),
          canDeleteSuperAdmin: Boolean(newPermissions.deleteUsers.canDeleteSuperAdmin)
        },
        currentUserRole
      );
      
      const orderResult = await OrderController.updateOrderPermissions(
        selectedAdmin.id,
        {
          canCreateOrders: Boolean(newPermissions.createOrders.enabled),
          orderDailyLimit: newPermissions.createOrders.dailyLimit || 0,
          canEditOrders: Boolean(newPermissions.editOrders.enabled),
          orderEditDailyLimit: newPermissions.editOrders.dailyLimit || 0,
          canEditAllOrders: Boolean(newPermissions.editOrders.canEditAllOrders),
          canDeleteOrders: Boolean(newPermissions.deleteOrders.enabled),
          canDeleteAllOrders: Boolean(newPermissions.deleteOrders.canDeleteAllOrders)
        },
        currentUserRole
      );
      
      if (userResult.success && orderResult.success) {
        setMessage(`✅ Permisos de ${selectedAdmin.name} guardados exitosamente`);
        await loadAdmins();
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
        setSelectedPermissions(null);
        setInitialModalTab('users');
        
        // Disparar evento para actualizar todos los componentes
        window.dispatchEvent(new CustomEvent('permissionsUpdated', { 
          detail: { 
            adminId: selectedAdmin.id,
            permissions: newPermissions 
          } 
        }));
      } else {
        setMessage(`❌ Error: ${userResult.error || orderResult.error}`);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      setMessage('❌ Error al guardar los permisos');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (!canViewPanel()) {
    return (
      <div className="permission-denied">
        <FaUserShield size={48} />
        <h3>Acceso Denegado</h3>
        <p>Solo el Super Administrador puede gestionar permisos</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="permission-loading">
        <FaSpinner className="spinner" />
        <p>Cargando administradores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="permission-error">
        <p>Error: {error}</p>
        <button onClick={loadAdmins} className="retry-btn">
          <FaSync /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="permission-manager">
      <div className="permission-header">
        <h2 className="permission-title">
          <FaUserShield className="permission-title-icon" />
          Gestión de Permisos para Administradores
        </h2>
      </div>
      
      <div className="permission-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Permisos de Usuarios
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaShoppingCart /> Permisos de Pedidos
        </button>
      </div>
      
      {message && (
        <div className={`permission-message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="permission-search-bar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar administrador por nombre o email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button className="refresh-btn" onClick={loadAdmins}>
          <FaSync /> Refrescar
        </button>
      </div>
      
      <div className="permission-table-container">
        <table className="permission-table">
          <thead>
            <tr>
              <th>Administrador</th>
              <th>Email</th>
              {activeTab === 'users' ? (
                <>
                  <th>Crear Usuarios</th>
                  <th>Editar Usuarios</th>
                  <th>Eliminar Usuarios</th>
                </>
              ) : (
                <>
                  <th>Crear Pedidos</th>
                  <th>Editar Pedidos</th>
                  <th>Eliminar Pedidos</th>
                </>
              )}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentAdmins.map(admin => {
              const canEdit = canEditAdminPermissions();
              
              return (
                <tr key={admin.id}>
                  <td data-label="Administrador">
                    <strong>{admin.name}</strong>
                    {admin.id === currentUserId && (
                      <span className="current-user-badge">(Tú)</span>
                    )}
                  </td>
                  <td data-label="Email">{admin.email}</td>
                  
                  {activeTab === 'users' ? (
                    <>
                      <td data-label="Crear Usuarios">
                        <div className="permission-status">
                          {admin.permissions.createUsers?.enabled ? (
                            <span className="permission-enabled">
                              <FaCheck /> Sí
                              {admin.permissions.createUsers.dailyLimit > 0 && (
                                <small>({admin.permissions.createUsers.dailyLimit} por día)</small>
                              )}
                              {admin.permissions.createUsers.dailyLimit === 0 && (
                                <small>(sin límite)</small>
                              )}
                            </span>
                          ) : (
                            <span className="permission-disabled">
                              <FaTimes /> No
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Editar Usuarios">
                        <div className="permission-status">
                          {admin.permissions.editUsers?.enabled ? (
                            <span className="permission-enabled">
                              <FaCheck /> Sí
                              {admin.permissions.editUsers.dailyLimit > 0 && (
                                <small>({admin.permissions.editUsers.dailyLimit} por día)</small>
                              )}
                              {admin.permissions.editUsers.canEditAdmins && (
                                <small>(incluye admins)</small>
                              )}
                            </span>
                          ) : (
                            <span className="permission-disabled">
                              <FaTimes /> No
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Eliminar Usuarios">
                        <div className="permission-status">
                          {admin.permissions.deleteUsers?.enabled ? (
                            <span className="permission-enabled">
                              <FaCheck /> Sí
                              {admin.permissions.deleteUsers.canDeleteAdmins && (
                                <small>(incluye admins)</small>
                              )}
                              {admin.permissions.deleteUsers.canDeleteSuperAdmin && (
                                <small>(incluye Super Admin)</small>
                              )}
                            </span>
                          ) : (
                            <span className="permission-disabled">
                              <FaTimes /> No
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td data-label="Crear Pedidos">
                        <div className="permission-status">
                          {admin.permissions.createOrders?.enabled ? (
                            <span className="permission-enabled">
                              <FaCheck /> Sí
                              {admin.permissions.createOrders.dailyLimit > 0 && (
                                <small>({admin.permissions.createOrders.dailyLimit} por día)</small>
                              )}
                              {admin.permissions.createOrders.dailyLimit === 0 && (
                                <small>(sin límite)</small>
                              )}
                              {admin.currentCounts?.orderCurrentCount > 0 && (
                                <small className="count-badge">Hoy: {admin.currentCounts.orderCurrentCount}</small>
                              )}
                            </span>
                          ) : (
                            <span className="permission-disabled">
                              <FaTimes /> No
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Editar Pedidos">
                        <div className="permission-status">
                          {admin.permissions.editOrders?.enabled ? (
                            <span className="permission-enabled">
                              <FaCheck /> Sí
                              {admin.permissions.editOrders.dailyLimit > 0 && (
                                <small>({admin.permissions.editOrders.dailyLimit} por día)</small>
                              )}
                              {admin.permissions.editOrders.canEditAllOrders && (
                                <small>(todos los pedidos)</small>
                              )}
                              {admin.currentCounts?.orderEditCurrentCount > 0 && (
                                <small className="count-badge">✏️ Hoy: {admin.currentCounts.orderEditCurrentCount}</small>
                              )}
                            </span>
                          ) : (
                            <span className="permission-disabled">
                              <FaTimes /> No
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label="Eliminar Pedidos">
                        <div className="permission-status">
                          {admin.permissions.deleteOrders?.enabled ? (
                            <span className="permission-enabled">
                              <FaCheck /> Sí
                              {admin.permissions.deleteOrders.canDeleteAllOrders && (
                                <small>(todos los pedidos)</small>
                              )}
                            </span>
                          ) : (
                            <span className="permission-disabled">
                              <FaTimes /> No
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                  
                  <td data-label="Acciones">
                    <button 
                      className={`edit-permissions-btn ${!canEdit ? 'disabled-btn' : ''}`}
                      onClick={() => handleEditClick(admin)}
                      disabled={!canEdit}
                      title={!canEdit ? 'Solo el Super Admin puede editar permisos' : 'Editar permisos'}
                    >
                      <FaEdit /> Editar Permisos
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredAdmins.length === 0 && (
          <div className="no-admins">
            <p>No se encontraron administradores</p>
            {searchTerm && (
              <p className="no-admins-hint">
                No hay resultados para "{searchTerm}"
              </p>
            )}
          </div>
        )}
      </div>

      {filteredAdmins.length > 0 && (
        <div className="permission-pagination-info">
          <span>
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAdmins.length)} de {filteredAdmins.length} administradores
          </span>
        </div>
      )}

      {filteredAdmins.length > itemsPerPage && (
        <div className="permission-pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Anterior
          </button>
          <span className="pagination-current">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente
          </button>
        </div>
      )}

      <EditPermissionsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
          setSelectedPermissions(null);
          setInitialModalTab('users');
        }}
        onSave={handleSavePermissions}
        admin={selectedAdmin}
        permissions={selectedPermissions}
        currentUserRole={currentUserRole}
        initialTab={initialModalTab}
      />
    </div>
  );
};

export default PermissionManager;