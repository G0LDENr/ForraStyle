import React, { useState, useEffect, useCallback } from 'react';
import { UserController } from '../../controllers/UserController';
import EditPermissionsModal from './Edit-Permissions';
import { FaUserShield, FaSync, FaCheck, FaTimes, FaEdit, FaSpinner } from 'react-icons/fa';
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
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(null);

  // Función para convertir cualquier valor a booleano
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
            
            const permissions = await UserController.getUserPermissions(admin.id, currentUserRole);
            console.log(`🔐 Permisos recibidos para ${admin.name}:`, permissions);
            
            if (!permissions) {
              console.log(`⚠️ No se encontraron permisos para ${admin.name}, usando valores por defecto`);
              const normalizedPermissions = {
                createUsers: { enabled: false, dailyLimit: 0 },
                editUsers: { enabled: false, dailyLimit: 0, canEditAdmins: false },
                deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false }
              };
              
              return {
                ...admin,
                permissions: normalizedPermissions
              };
            }
            
            const normalizedPermissions = {
              createUsers: { 
                enabled: toBoolean(permissions.canCreate), 
                dailyLimit: permissions.dailyLimit || 0,
              },
              editUsers: { 
                enabled: toBoolean(permissions.canEdit), 
                dailyLimit: permissions.editDailyLimit || 0,
                canEditAdmins: toBoolean(permissions.canEditAdmins)
              },
              deleteUsers: { 
                enabled: toBoolean(permissions.canDelete),
                canDeleteAdmins: toBoolean(permissions.canDeleteAdmins),
                canDeleteSuperAdmin: toBoolean(permissions.canDeleteSuperAdmin)
              }
            };
            
            console.log(`✅ Permisos normalizados para ${admin.name}:`, normalizedPermissions);
            
            return {
              ...admin,
              permissions: normalizedPermissions
            };
          })
        );
        
        console.log('\n🎯 Todos los admins procesados:', adminsWithPermissions);
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
      console.log('🏁 Carga finalizada');
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
      const result = await UserController.updateAdminPermissions(
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
      
      if (result.success) {
        setMessage(`✅ Permisos de ${selectedAdmin.name} guardados exitosamente`);
        await loadAdmins();
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
      <div className="permission-header">
        <h2 className="permission-title">
          <FaUserShield className="permission-title-icon" />
          Gestión de Permisos para Administradores
        </h2>
      </div>
      
      {message && <div className="permission-message success">{message}</div>}
      
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
                
                <td data-label="Crear Usuarios">
                  <div className="permission-status">
                    {admin.permissions.createUsers.enabled ? (
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
                    {admin.permissions.editUsers.enabled ? (
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
        }}
        onSave={handleSavePermissions}
        admin={selectedAdmin}
        permissions={selectedPermissions}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

export default PermissionManager;