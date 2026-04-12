import React, { useState, useEffect } from 'react';
import { UserController } from '../../controllers/UserController';
import EditPermissionsModal from './Edit-Permissions';
import { FaUserShield, FaSync, FaCheck, FaTimes, FaEdit, FaSpinner, FaSearch } from 'react-icons/fa';
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
  
  // Estado para el modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [searchTerm, admins]);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener todos los usuarios
      const result = await UserController.getUsers(currentUserId, currentUserRole);
      
      if (result.success) {
        // Filtrar solo administradores (rol === 1)
        const adminUsers = result.data.filter(user => parseInt(user.rol) === 1);
        
        // Cargar permisos para cada admin desde la base de datos
        const adminsWithPermissions = await Promise.all(
          adminUsers.map(async (admin) => {
            const permissions = await UserController.getUserPermissions(admin.id, currentUserRole);
            return {
              ...admin,
              permissions: {
                createUsers: { 
                  enabled: permissions?.canCreate || false, 
                  dailyLimit: permissions?.dailyLimit || 0,
                  currentCount: permissions?.currentDailyCount || 0
                },
                editUsers: { 
                  enabled: permissions?.canEdit || false, 
                  dailyLimit: permissions?.editDailyLimit || 0,
                  currentCount: permissions?.currentEditCount || 0,
                  canEditAdmins: permissions?.canEditAdmins || false
                },
                deleteUsers: { 
                  enabled: permissions?.canDelete || false,
                  canDeleteAdmins: permissions?.canDeleteAdmins || false,
                  canDeleteSuperAdmin: permissions?.canDeleteSuperAdmin || false
                }
              }
            };
          })
        );
        
        setAdmins(adminsWithPermissions);
        setFilteredAdmins(adminsWithPermissions);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      setError('Error al cargar la lista de administradores');
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
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
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setSelectedPermissions({
      createUsers: { ...admin.permissions.createUsers },
      editUsers: { ...admin.permissions.editUsers },
      deleteUsers: { ...admin.permissions.deleteUsers }
    });
    setIsEditModalOpen(true);
  };

  const handleSavePermissions = async (newPermissions) => {
    if (!selectedAdmin) return;
    
    try {
      // Guardar en la base de datos a través del controlador
      const result = await UserController.updateAdminPermissions(
        selectedAdmin.id,
        {
          canCreateUsers: newPermissions.createUsers.enabled,
          createDailyLimit: newPermissions.createUsers.dailyLimit,
          canEditUsers: newPermissions.editUsers.enabled,
          editDailyLimit: newPermissions.editUsers.dailyLimit,
          canEditAdmins: newPermissions.editUsers.canEditAdmins,
          canDeleteUsers: newPermissions.deleteUsers.enabled,
          canDeleteAdmins: newPermissions.deleteUsers.canDeleteAdmins,
          canDeleteSuperAdmin: newPermissions.deleteUsers.canDeleteSuperAdmin
        },
        currentUserRole
      );
      
      if (result.success) {
        setMessage(`✅ Permisos de ${selectedAdmin.name} guardados exitosamente`);
        
        // Actualizar la lista localmente
        const updatedAdmins = admins.map(admin => 
          admin.id === selectedAdmin.id 
            ? { 
                ...admin, 
                permissions: {
                  createUsers: { 
                    enabled: newPermissions.createUsers.enabled, 
                    dailyLimit: newPermissions.createUsers.dailyLimit,
                    currentCount: admin.permissions.createUsers.currentCount
                  },
                  editUsers: { 
                    enabled: newPermissions.editUsers.enabled, 
                    dailyLimit: newPermissions.editUsers.dailyLimit,
                    currentCount: admin.permissions.editUsers.currentCount,
                    canEditAdmins: newPermissions.editUsers.canEditAdmins
                  },
                  deleteUsers: { 
                    enabled: newPermissions.deleteUsers.enabled,
                    canDeleteAdmins: newPermissions.deleteUsers.canDeleteAdmins,
                    canDeleteSuperAdmin: newPermissions.deleteUsers.canDeleteSuperAdmin
                  }
                }
              }
            : admin
        );
        
        setAdmins(updatedAdmins);
        setFilteredAdmins(prev => 
          prev.map(admin => 
            admin.id === selectedAdmin.id 
              ? { 
                  ...admin, 
                  permissions: {
                    createUsers: { 
                      enabled: newPermissions.createUsers.enabled, 
                      dailyLimit: newPermissions.createUsers.dailyLimit,
                      currentCount: admin.permissions.createUsers.currentCount
                    },
                    editUsers: { 
                      enabled: newPermissions.editUsers.enabled, 
                      dailyLimit: newPermissions.editUsers.dailyLimit,
                      currentCount: admin.permissions.editUsers.currentCount,
                      canEditAdmins: newPermissions.editUsers.canEditAdmins
                    },
                    deleteUsers: { 
                      enabled: newPermissions.deleteUsers.enabled,
                      canDeleteAdmins: newPermissions.deleteUsers.canDeleteAdmins,
                      canDeleteSuperAdmin: newPermissions.deleteUsers.canDeleteSuperAdmin
                    }
                  }
                }
              : admin
          )
        );
        
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
        setSelectedPermissions(null);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      setMessage('❌ Error al guardar los permisos');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Paginación
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

  if (currentUserRole !== 0) {
    return (
      <div className="permission-denied">
        <FaUserShield size={48} />
        <h3>Acceso Denegado</h3>
        <p>No tienes permisos para acceder a esta sección</p>
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
      {/* Título */}
      <div className="permission-header">
        <h2 className="permission-title">
          <FaUserShield className="permission-title-icon" />
          Gestión de Permisos para Administradores
        </h2>
      </div>
      
      {message && <div className="permission-message success">{message}</div>}
      
      {/* Barra de búsqueda */}
      <div className="permission-search-bar">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
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
              <th>Crear Usuarios</th>
              <th>Editar Usuarios</th>
              <th>Eliminar Usuarios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentAdmins.map(admin => (
              <tr key={admin.id}>
                <td data-label="Administrador">
                  <strong>{admin.name}</strong>
                  {admin.id === currentUserId && (
                    <span className="current-user-badge">(Tú)</span>
                  )}
                </td>
                <td data-label="Email">{admin.email}</td>
                
                {/* Crear Usuarios */}
                <td data-label="Crear Usuarios">
                  <div className="permission-status">
                    {admin.permissions.createUsers.enabled ? (
                      <span className="permission-enabled">
                        <FaCheck /> Sí
                        {admin.permissions.createUsers.dailyLimit > 0 && (
                          <small>({admin.permissions.createUsers.dailyLimit}/día)</small>
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
                
                {/* Editar Usuarios */}
                <td data-label="Editar Usuarios">
                  <div className="permission-status">
                    {admin.permissions.editUsers.enabled ? (
                      <span className="permission-enabled">
                        <FaCheck /> Sí
                        {admin.permissions.editUsers.dailyLimit > 0 && (
                          <small>({admin.permissions.editUsers.dailyLimit}/día)</small>
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
                
                {/* Eliminar Usuarios */}
                <td data-label="Eliminar Usuarios">
                  <div className="permission-status">
                    {admin.permissions.deleteUsers.enabled ? (
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
                
                <td data-label="Acciones">
                  <button 
                    className="edit-permissions-btn"
                    onClick={() => handleEditClick(admin)}
                  >
                    <FaEdit /> Editar Permisos
                  </button>
                </td>
              </tr>
            ))}
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

      {/* Información de paginación */}
      {filteredAdmins.length > 0 && (
        <div className="permission-pagination-info">
          <span>
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAdmins.length)} de {filteredAdmins.length} administradores
          </span>
        </div>
      )}

      {/* Controles de paginación */}
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

      {/* Modal de edición de permisos */}
      <EditPermissionsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
          setSelectedPermissions(null);
        }}
        onSave={handleSavePermissions}
        admin={selectedAdmin}
        permissions={selectedPermissions}
      />
    </div>
  );
};

export default PermissionManager;