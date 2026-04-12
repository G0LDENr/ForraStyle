import React, { useState, useEffect, useCallback } from 'react';
import { UserController } from '../../controllers/UserController';
import { CreateUserModal } from './Create-User';
import { EditUserModal } from './Edit-User';
import { FaSpinner, FaCheckCircle, FaUsers, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import '../../css/user/user.css';

export function UserList({ currentAdminId, currentUserRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [dailyStats, setDailyStats] = useState(null);
  const [editStats, setEditStats] = useState(null);
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canEditAdmins: false,
    canDeleteAdmins: false,
    canDeleteSuperAdmin: false,
    editDailyLimit: 0,
    currentEditCount: 0,
    createDailyLimit: 0,
    currentCreateCount: 0
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  
  const initialLoadDone = React.useRef(false);

  // Función para obtener adminId y userRole de manera consistente
  const getAdminIdAndRole = useCallback(() => {
    let adminId = currentAdminId;
    let userRole = currentUserRole;
    
    if (!adminId || userRole === undefined) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        adminId = user.id;
        userRole = user.rol;
      }
    }
    
    return { adminId, userRole };
  }, [currentAdminId, currentUserRole]);

  const loadPermissionsAndStats = useCallback(async (adminId, userRole) => {
    console.log('🔐 Cargando permisos y estadísticas...');
    
    try {
      // Cargar permisos
      const permissionsResult = await UserController.getUserPermissions(adminId, userRole);
      if (permissionsResult) {
        setPermissions({
          canCreate: permissionsResult.canCreate || false,
          canEdit: permissionsResult.canEdit || false,
          canDelete: permissionsResult.canDelete || false,
          canEditAdmins: permissionsResult.canEditAdmins || false,
          canDeleteAdmins: permissionsResult.canDeleteAdmins || false,
          canDeleteSuperAdmin: permissionsResult.canDeleteSuperAdmin || false,
          editDailyLimit: permissionsResult.editDailyLimit || 0,
          currentEditCount: permissionsResult.currentEditCount || 0,
          createDailyLimit: permissionsResult.dailyLimit || 0,
          currentCreateCount: permissionsResult.currentDailyCount || 0
        });
      }
      
      // Cargar estadísticas de creación
      const stats = await UserController.getDailyStats(adminId, userRole);
      setDailyStats(stats);
      console.log('📊 Estadísticas de creación:', stats);
      
      // Cargar estadísticas de edición
      const editStatsData = await UserController.getDailyEditStats(adminId, userRole);
      setEditStats(editStatsData);
      console.log('📊 Estadísticas de edición:', editStatsData);
    } catch (error) {
      console.error('Error cargando permisos/estadísticas:', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    console.log('🚀 Cargando datos...');
    
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      
      // Cargar usuarios
      const usersResult = await UserController.getUsers(adminId, userRole);
      if (usersResult.success) {
        setUsers(usersResult.data);
        console.log('✅ Usuarios cargados:', usersResult.data.length);
      } else {
        setError(usersResult.error);
      }
      
      // Cargar permisos según el rol
      if (userRole === 1 && adminId) {
        await loadPermissionsAndStats(adminId, userRole);
      } else if (userRole === 0) {
        setPermissions({
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canEditAdmins: true,
          canDeleteAdmins: true,
          canDeleteSuperAdmin: true,
          editDailyLimit: 0,
          currentEditCount: 0,
          createDailyLimit: 0,
          currentCreateCount: 0
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
      console.log('🏁 Carga finalizada');
    }
  }, [getAdminIdAndRole, loadPermissionsAndStats]);

  // Cargar datos SOLO UNA VEZ cuando el componente se monta
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadAllData();
    }
  }, [loadAllData]);

  // Función para refrescar todos los datos (manual)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('🔄 Refrescando datos manualmente...');
    
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      
      // Recargar usuarios
      const usersResult = await UserController.getUsers(adminId, userRole);
      if (usersResult.success) {
        setUsers(usersResult.data);
        console.log('✅ Usuarios refrescados:', usersResult.data.length);
      }
      
      // Recargar permisos y estadísticas según el rol
      if (userRole === 1 && adminId) {
        await loadPermissionsAndStats(adminId, userRole);
      } else if (userRole === 0) {
        setPermissions({
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canEditAdmins: true,
          canDeleteAdmins: true,
          canDeleteSuperAdmin: true,
          editDailyLimit: 0,
          currentEditCount: 0,
          createDailyLimit: 0,
          currentCreateCount: 0
        });
      }
      
      // Mostrar mensaje temporal de éxito
      setSuccessMessage('Datos actualizados correctamente');
      setTimeout(() => setSuccessMessage(''), 2000);
      
    } catch (error) {
      console.error('Error refrescando:', error);
      setPermissionError('Error al refrescar los datos');
      setShowPermissionDenied(true);
      setTimeout(() => setShowPermissionDenied(false), 3000);
    } finally {
      setRefreshing(false);
    }
  }, [getAdminIdAndRole, loadPermissionsAndStats]);

  // Función para refrescar usuarios después de crear/editar/eliminar
  const refreshUsers = useCallback(async () => {
    console.log('🔄 Refrescando usuarios...');
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      const result = await UserController.getUsers(adminId, userRole);
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error refrescando usuarios:', error);
    }
  }, [getAdminIdAndRole]);

  // Función para refrescar estadísticas después de crear/editar
  const refreshStats = useCallback(async () => {
    console.log('📊 Refrescando estadísticas...');
    try {
      const { adminId, userRole } = getAdminIdAndRole();
      
      if (userRole === 1 && adminId) {
        const stats = await UserController.getDailyStats(adminId, userRole);
        setDailyStats(stats);
        
        const editStatsData = await UserController.getDailyEditStats(adminId, userRole);
        setEditStats(editStatsData);
        
        const permissionsResult = await UserController.getUserPermissions(adminId, userRole);
        if (permissionsResult) {
          setPermissions(prev => ({
            ...prev,
            currentCreateCount: permissionsResult.currentDailyCount || 0,
            currentEditCount: permissionsResult.currentEditCount || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error refrescando estadísticas:', error);
    }
  }, [getAdminIdAndRole]);

  const canEditSpecificUser = useCallback((user) => {
    if (currentUserRole === 0) return true;
    if (!permissions.canEdit) return false;
    if (user.rol === 0) return false;
    if (user.rol === 1 && !permissions.canEditAdmins) return false;
    return true;
  }, [currentUserRole, permissions.canEdit, permissions.canEditAdmins]);

  const canDeleteSpecificUser = useCallback((user) => {
    if (currentUserRole === 0) return true;
    if (!permissions.canDelete) return false;
    if (user.rol === 0) return permissions.canDeleteSuperAdmin;
    if (user.rol === 1 && !permissions.canDeleteAdmins) return false;
    return true;
  }, [currentUserRole, permissions.canDelete, permissions.canDeleteSuperAdmin, permissions.canDeleteAdmins]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    
    const { adminId, userRole } = getAdminIdAndRole();
    
    const result = await UserController.deleteUser(userToDelete.id, adminId, userRole);
    if (result.success) {
      setSuccessMessage('Usuario eliminado exitosamente');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      await refreshUsers();
      await refreshStats();
      setTimeout(() => setShowSuccessModal(false), 2000);
    } else {
      setPermissionError(result.error);
      setShowPermissionDenied(true);
      setShowConfirmModal(false);
      setTimeout(() => setShowPermissionDenied(false), 3000);
    }
    setDeleteLoading(false);
    setUserToDelete(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleUserCreated = async () => {
    console.log('🔄 Usuario creado, actualizando datos...');
    await refreshUsers();
    await refreshStats();
  };

  const handleUserUpdated = async () => {
    console.log('🔄 Usuario actualizado, actualizando datos...');
    await refreshUsers();
    await refreshStats();
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower);
    let matchesRole = true;
    if (roleFilter === 'admin') matchesRole = user.rol === 1;
    else if (roleFilter === 'usuario') matchesRole = user.rol === 2;
    else if (roleFilter === 'superadmin') matchesRole = user.rol === 0;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleRoleFilter = (role) => { setRoleFilter(role); setCurrentPage(1); };

  if (loading) {
    return (
      <div className="userlist-loading">
        <FaSpinner className="spinner" /> Cargando usuarios...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="userlist-error">
        <FaExclamationTriangle />
        <span>Error: {error}</span>
        <button onClick={() => { initialLoadDone.current = false; loadAllData(); }} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="userlist-container">
      <div className="userlist-header">
        <h2 className="userlist-title"><FaUsers className="userlist-title-icon" /> Gestión de Usuarios</h2>
      </div>

      {showPermissionDenied && (
        <div className="userlist-permission-denied">
          <FaExclamationTriangle />
          <span>{permissionError}</span>
        </div>
      )}

      {successMessage && !showSuccessModal && (
        <div className="userlist-success-message">
          <FaCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="userlist-search-bar">
        <div className="search-wrapper">
          <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={handleSearch} className="search-input" />
        </div>
        <div className="role-filter-wrapper">
          <select value={roleFilter} onChange={(e) => handleRoleFilter(e.target.value)} className="role-filter-select">
            <option value="todos">Todos los roles</option>
            {currentUserRole === 0 && <option value="superadmin">Super Administradores</option>}
            <option value="admin">Administradores</option>
            <option value="usuario">Usuarios normales</option>
          </select>
        </div>
        <div className="userlist-actions">
          <button 
            onClick={handleRefresh} 
            className="userlist-refresh-btn"
            disabled={refreshing}
            title="Actualizar datos"
          >
            <FaSync className={refreshing ? 'spinning' : ''} /> {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          {dailyStats && permissions.canCreate && (
            <div className="daily-stats-badge" title={`Creados hoy: ${dailyStats.used} / ${dailyStats.limit === 0 ? '∞' : dailyStats.limit}`}>
              📊 Creados hoy: {dailyStats.used}/{dailyStats.limit === 0 ? '∞' : dailyStats.limit}
            </div>
          )}
          {editStats && permissions.canEdit && editStats.limit > 0 && (
            <div className="edit-stats-badge" title={`Editados hoy: ${editStats.used} / ${editStats.limit}`}>
              ✏️ Editados hoy: {editStats.used}/{editStats.limit}
            </div>
          )}
          {permissions.canCreate && (
            <button onClick={handleCreateClick} className="userlist-create-btn">
              + Crear Usuario
            </button>
          )}
        </div>
      </div>

      <div className="userlist-table-wrapper">
        <table className="userlist-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Edad</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => {
              const canEdit = canEditSpecificUser(user);
              const canDelete = canDeleteSpecificUser(user);
              
              return (
                <tr key={user.id}>
                  <td>{indexOfFirstUser + index + 1}</td>
                  <td>{user.name}</td>
                  <td><a href={`mailto:${user.email}`} className="userlist-email">{user.email}</a></td>
                  <td>{user.phone || '—'}</td>
                  <td>{user.age ? `${user.age} años` : '—'}</td>
                  <td>
                    <span className={`user-role-badge ${user.rol === 1 ? 'role-admin' : user.rol === 0 ? 'role-superadmin' : 'role-user'}`}>
                      {user.rol === 0 ? 'Super Admin' : user.rol === 1 ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => handleEdit(user)} 
                      className={`userlist-edit-btn ${!canEdit ? 'disabled-btn' : ''}`}
                      disabled={!canEdit}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)} 
                      className={`userlist-delete-btn ${!canDelete ? 'disabled-btn' : ''}`}
                      disabled={!canDelete}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="userlist-empty">
          <p>No se encontraron usuarios</p>
        </div>
      )}

      {filteredUsers.length > usersPerPage && (
        <div className="userlist-pagination">
          <div className="pagination-info">
            Mostrando {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
          </div>
          <div className="pagination-controls">
            <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn">Anterior</button>
            <span className="pagination-current">Página {currentPage} de {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-btn">Siguiente</button>
          </div>
        </div>
      )}

      <CreateUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onUserCreated={handleUserCreated} 
        currentUserRole={currentUserRole} 
        currentAdminId={currentAdminId}
      />
      
      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => { 
          setIsEditModalOpen(false); 
          setSelectedUser(null); 
        }} 
        onUserUpdated={handleUserUpdated} 
        user={selectedUser} 
        currentUserRole={currentUserRole}
        currentAdminId={currentAdminId}
      />

      {showConfirmModal && (
        <div className="userlist-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="userlist-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="userlist-modal-header"><h3>Confirmar Eliminación</h3></div>
            <div className="userlist-modal-body">
              <p>¿Estás seguro de que deseas eliminar este usuario?</p>
              <p className="userlist-modal-item"><strong>{userToDelete?.name}</strong></p>
              <p className="userlist-modal-warning">⚠️ Esta acción no se puede deshacer.</p>
            </div>
            <div className="userlist-modal-footer">
              <button className="userlist-modal-cancel" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button className="userlist-modal-confirm" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? <><FaSpinner className="userlist-spinner" /> Eliminando...</> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="userlist-success-overlay">
          <div className="userlist-success-container">
            <div className="userlist-success-icon"><FaCheckCircle /></div>
            <h3>¡Éxito!</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}