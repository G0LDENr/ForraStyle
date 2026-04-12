import React, { useState, useEffect } from 'react';
import { UserController } from '../../controllers/UserController';
import { CreateUserModal } from './Create-User';
import { EditUserModal } from './Edit-User';
import { FaSpinner, FaCheckCircle, FaShieldAlt, FaUsers } from 'react-icons/fa';
import '../../css/user/user.css';

export function UserList({ currentAdminId, currentUserRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    currentEditCount: 0
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  useEffect(() => {
    loadUserPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAdminId, currentUserRole]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserPermissions = async () => {
    if (currentUserRole === 0) {
      setPermissions({
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canEditAdmins: true,
        canDeleteAdmins: true,
        canDeleteSuperAdmin: true,
        editDailyLimit: 0,
        currentEditCount: 0
      });
      return;
    }

    if (currentUserRole === 1 && currentAdminId) {
      const userPermissions = await UserController.getUserPermissions(currentAdminId, currentUserRole);
      if (userPermissions) {
        setPermissions({
          canCreate: userPermissions.canCreate || false,
          canEdit: userPermissions.canEdit || false,
          canDelete: userPermissions.canDelete || false,
          canEditAdmins: userPermissions.canEditAdmins || false,
          canDeleteAdmins: userPermissions.canDeleteAdmins || false,
          canDeleteSuperAdmin: userPermissions.canDeleteSuperAdmin || false,
          editDailyLimit: userPermissions.editDailyLimit || 0,
          currentEditCount: userPermissions.currentEditCount || 0
        });
      }

      const stats = await UserController.getDailyStats(currentAdminId, currentUserRole);
      setDailyStats(stats);

      const editStatsData = await UserController.getDailyEditStats(currentAdminId, currentUserRole);
      setEditStats(editStatsData);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const result = await UserController.getUsers(currentAdminId, currentUserRole);
    if (result.success) {
      setUsers(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const canEditSpecificUser = (user) => {
    if (currentUserRole === 0) return true;
    if (!permissions.canEdit) return false;

    if (permissions.editDailyLimit > 0 && permissions.currentEditCount >= permissions.editDailyLimit) {
      showPermissionError(`Límite de ediciones alcanzado. Solo puedes editar ${permissions.editDailyLimit} usuario(s) por día`);
      return false;
    }

    if (user.rol === 0) return false;
    if (user.rol === 1 && !permissions.canEditAdmins) return false;
    return true;
  };

  const canDeleteSpecificUser = (user) => {
    if (currentUserRole === 0) return true;
    if (!permissions.canDelete) return false;
    if (user.rol === 0) return permissions.canDeleteSuperAdmin;
    if (user.rol === 1 && !permissions.canDeleteAdmins) return false;
    return true;
  };

  const handleDeleteClick = (user) => {
    if (!canDeleteSpecificUser(user)) {
      let errorMsg = 'No tienes permiso para eliminar este usuario';
      if (user.rol === 0) errorMsg = 'No puedes eliminar un Super Administrador';
      else if (user.rol === 1 && !permissions.canDeleteAdmins) errorMsg = 'No tienes permiso para eliminar otros administradores';
      showPermissionError(errorMsg);
      return;
    }
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const result = await UserController.deleteUser(userToDelete.id, currentAdminId, currentUserRole);
    if (result.success) {
      setSuccessMessage('Usuario eliminado exitosamente');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      loadUsers();
      setTimeout(() => setShowSuccessModal(false), 2000);
    } else {
      showPermissionError(result.error);
      setShowConfirmModal(false);
    }
    setDeleteLoading(false);
    setUserToDelete(null);
  };

  const handleEdit = (user) => {
    if (!canEditSpecificUser(user)) {
      let errorMsg = 'No tienes permiso para editar este usuario';
      if (user.rol === 0) errorMsg = 'No puedes editar un Super Administrador';
      else if (user.rol === 1 && !permissions.canEditAdmins) errorMsg = 'No tienes permiso para editar otros administradores';
      showPermissionError(errorMsg);
      return;
    }
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    if (currentUserRole === 1 && !permissions.canCreate) {
      showPermissionError('No tienes permiso para crear usuarios');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const showPermissionError = (message) => {
    setPermissionError(message);
    setShowPermissionDenied(true);
    setTimeout(() => setShowPermissionDenied(false), 3000);
  };

  const handleUserCreated = async (userData) => {
    const result = await UserController.createUser(userData, currentAdminId, currentUserRole);
    if (result.success) {
      loadUsers();
      if (currentUserRole === 1) {
        const stats = await UserController.getDailyStats(currentAdminId, currentUserRole);
        setDailyStats(stats);
      }
      return true;
    } else {
      showPermissionError(result.error);
      return false;
    }
  };

  const handleUserUpdated = async (userId, userData) => {
    const result = await UserController.updateUser(userId, userData, currentAdminId, currentUserRole);
    if (result.success) {
      loadUsers();
      if (currentUserRole === 1) {
        const editStatsData = await UserController.getDailyEditStats(currentAdminId, currentUserRole);
        setEditStats(editStatsData);
        const userPermissions = await UserController.getUserPermissions(currentAdminId, currentUserRole);
        if (userPermissions) {
          setPermissions(prev => ({ ...prev, currentEditCount: userPermissions.currentEditCount || 0 }));
        }
      }
      return true;
    } else {
      showPermissionError(result.error);
      return false;
    }
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

  if (loading) return <div className="userlist-loading">Cargando usuarios...</div>;
  if (error) return <div className="userlist-error">Error: {error}</div>;

  return (
    <div className="userlist-container">
      <div className="userlist-header">
        <h2 className="userlist-title"><FaUsers className="userlist-title-icon" /> Gestión de Usuarios</h2>
      </div>

      {showPermissionDenied && (
        <div className="userlist-permission-denied"><FaShieldAlt /><span>{permissionError}</span></div>
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
          {dailyStats && permissions.canCreate && (
            <div className="daily-stats-badge" title={`Creados hoy: ${dailyStats.used} / ${dailyStats.limit === 0 ? '∞' : dailyStats.limit}`}>
              Creados hoy: {dailyStats.used}/{dailyStats.limit === 0 ? '∞' : dailyStats.limit}
            </div>
          )}
          {editStats && permissions.canEdit && editStats.limit > 0 && (
            <div className="edit-stats-badge" title={`Editados hoy: ${editStats.used} / ${editStats.limit}`}>
              Editados hoy: {editStats.used}/{editStats.limit}
            </div>
          )}
          {permissions.canCreate && <button onClick={handleCreateClick} className="userlist-create-btn">Crear Usuario</button>}
        </div>
      </div>

      <div className="userlist-table-wrapper">
        <table className="userlist-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Edad</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{indexOfFirstUser + index + 1}</td>
                <td>{user.name}</td>
                <td><a href={`mailto:${user.email}`} className="userlist-email">{user.email}</a></td>
                <td>{user.phone || '—'}</td>
                <td>{user.age ? `${user.age} años` : '—'}</td>
                <td><span className={`user-role-badge ${user.rol === 1 ? 'role-admin' : user.rol === 0 ? 'role-superadmin' : 'role-user'}`}>{user.rol === 0 ? 'Super Admin' : user.rol === 1 ? 'Administrador' : 'Usuario'}</span></td>
                <td className="actions-cell">
                  <button 
                    onClick={() => permissions.canEdit ? handleEdit(user) : null} 
                    className={`userlist-edit-btn ${!permissions.canEdit ? 'disabled-btn' : ''}`}
                    disabled={!permissions.canEdit || (user.rol === 0 && currentUserRole !== 0)}
                    style={{ opacity: !permissions.canEdit ? 0.5 : 1, cursor: !permissions.canEdit ? 'not-allowed' : 'pointer' }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => permissions.canDelete ? handleDeleteClick(user) : null} 
                    className={`userlist-delete-btn ${!permissions.canDelete ? 'disabled-btn' : ''}`}
                    disabled={!permissions.canDelete || (user.rol === 0 && !permissions.canDeleteSuperAdmin)}
                    style={{ opacity: !permissions.canDelete ? 0.5 : 1, cursor: !permissions.canDelete ? 'not-allowed' : 'pointer' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && <div className="userlist-empty"><p>No se encontraron usuarios</p></div>}

      {filteredUsers.length > usersPerPage && (
        <>
          <div className="userlist-pagination">
            <div className="pagination-info">Mostrando {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios</div>
            <div className="pagination-controls">
              <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn">Anterior</button>
              <span className="pagination-current">Página {currentPage} de {totalPages}</span>
              <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-btn">Siguiente</button>
            </div>
          </div>
          <div className="userlist-pagination-mobile">
            <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn-mobile">◀ Anterior</button>
            <span className="pagination-current-mobile">Pág. {currentPage} / {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-btn-mobile">Siguiente ▶</button>
          </div>
        </>
      )}

      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onUserCreated={handleUserCreated} currentUserRole={currentUserRole} currentAdminId={currentAdminId}/>
      <EditUserModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }} onUserUpdated={handleUserUpdated} user={selectedUser} currentUserRole={currentUserRole} />

      {showConfirmModal && (
        <div className="userlist-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="userlist-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="userlist-modal-header"><h3>Confirmar Eliminación</h3></div>
            <div className="userlist-modal-body"><p>¿Estás seguro de que deseas eliminar este usuario?</p><p className="userlist-modal-item"><strong>{userToDelete?.name}</strong></p><p className="userlist-modal-warning">Esta acción no se puede deshacer.</p></div>
            <div className="userlist-modal-footer">
              <button className="userlist-modal-cancel" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button className="userlist-modal-confirm" onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? <><FaSpinner className="userlist-spinner" /> Eliminando...</> : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="userlist-success-overlay">
          <div className="userlist-success-container"><div className="userlist-success-icon"><FaCheckCircle /></div><h3>¡Éxito!</h3><p>{successMessage}</p></div>
        </div>
      )}
    </div>
  );
}