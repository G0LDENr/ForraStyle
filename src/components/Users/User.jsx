import React, { useState, useEffect } from 'react';
import { UserController } from '../../controllers/UserController';
import { CreateUserModal } from './Create-User';
import { EditUserModal } from './Edit-User';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import '../../css/user/user.css';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos'); // 'todos', 'admin', 'usuario'
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Estados para modales personalizados
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await UserController.getUsers();
    
    if (result.success) {
      setUsers(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    
    const result = await UserController.deleteUser(userToDelete.id);
    
    if (result.success) {
      setSuccessMessage('Usuario eliminado exitosamente');
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      loadUsers();
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } else {
      setSuccessMessage('Error al eliminar: ' + result.error);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    }
    
    setDeleteLoading(false);
    setUserToDelete(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  const handleUserUpdated = () => {
    loadUsers();
  };

  // Filtrar usuarios por nombre/email y por rol
  const filteredUsers = users.filter(user => {
    // Filtro por búsqueda
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower);
    
    // Filtro por rol
    let matchesRole = true;
    if (roleFilter === 'admin') {
      matchesRole = user.rol === 1;
    } else if (roleFilter === 'usuario') {
      matchesRole = user.rol === 2;
    }
    
    return matchesSearch && matchesRole;
  });

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  if (loading) return <div className="userlist-loading">Cargando usuarios...</div>;
  if (error) return <div className="userlist-error">Error: {error}</div>;

  return (
    <div className="userlist-container">
      {/* Fila con buscadores */}
      <div className="userlist-search-bar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="role-filter-wrapper">
          <select 
            value={roleFilter} 
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="role-filter-select"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="usuario">Usuarios normales</option>
          </select>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="userlist-create-btn"
        >
          Crear Usuario
        </button>
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
            {currentUsers.map((user, index) => (
              <tr key={user.id}>
                <td data-label="ID">{indexOfFirstUser + index + 1}</td>
                <td data-label="Nombre">
                  <strong>{user.name}</strong>
                </td>
                <td data-label="Email">
                  <a href={`mailto:${user.email}`} className="userlist-email">
                    {user.email}
                  </a>
                </td>
                <td data-label="Teléfono">{user.phone || '—'}</td>
                <td data-label="Edad">
                  {user.age ? `${user.age} años` : '—'}
                </td>
                <td data-label="Rol">
                  <span className={`user-role-badge ${user.rol === 1 ? 'role-admin' : 'role-user'}`}>
                    {user.rol === 1 ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td data-label="Acciones" className="actions-cell">
                  <button 
                    onClick={() => handleEdit(user)} 
                    className="userlist-edit-btn"
                    title="Editar usuario"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(user)} 
                    className="userlist-delete-btn"
                    title="Eliminar usuario"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="userlist-empty">
          <p>No se encontraron usuarios</p>
        </div>
      )}

      {/* Paginación - Solo se muestra si hay más de 10 usuarios */}
      {filteredUsers.length > usersPerPage && (
        <div className="userlist-pagination">
          <div className="pagination-info">
            Mostrando {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
          </div>
          <div className="pagination-controls">
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
        </div>
      )}
      
      {/* Paginación compacta para móviles cuando hay más de 10 usuarios */}
      {filteredUsers.length > usersPerPage && (
        <div className="userlist-pagination-mobile">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination-btn-mobile"
          >
            ◀ Anterior
          </button>
          <span className="pagination-current-mobile">
            Pág. {currentPage} / {totalPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn-mobile"
          >
            Siguiente ▶
          </button>
        </div>
      )}

      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="userlist-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="userlist-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="userlist-modal-header">
              <h3>Confirmar Eliminación</h3>
            </div>
            <div className="userlist-modal-body">
              <p>¿Estás seguro de que deseas eliminar este usuario?</p>
              <p className="userlist-modal-item">
                <strong>{userToDelete?.name}</strong>
              </p>
              <p className="userlist-modal-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="userlist-modal-footer">
              <button 
                className="userlist-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="userlist-modal-confirm"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <FaSpinner className="userlist-spinner" /> Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="userlist-success-overlay">
          <div className="userlist-success-container">
            <div className="userlist-success-icon">
              <FaCheckCircle />
            </div>
            <h3>¡Éxito!</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}