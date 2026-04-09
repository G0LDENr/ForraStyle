// src/components/users/UserList.jsx
import React, { useState, useEffect } from 'react';
import { UserController } from '../../controllers/UserController';
import { CreateUserModal } from './Create-User';
import '../../css/user/user.css';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

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

  const handleDelete = async (id) => {
    if (window.confirm('Eliminar usuario?')) {
      const result = await UserController.deleteUser(id);
      if (result.success) {
        loadUsers();
      } else {
        window.alert('Error al eliminar: ' + result.error);
      }
    }
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
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

  if (loading) return <div className="userlist-loading">Cargando usuarios...</div>;
  if (error) return <div className="userlist-error">Error: {error}</div>;

  return (
    <div className="userlist-container">
      {/* Fila con buscador y botón crear */}
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
        <button 
          onClick={() => setIsModalOpen(true)} 
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
                <td data-label="Acciones">
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    className="userlist-delete-btn"
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

      {filteredUsers.length > 0 && (
        <div className="userlist-pagination">
          <div className="pagination-info">
            Mostrando {indexOfFirstUser + 1} de {filteredUsers.length} usuarios
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

      <CreateUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}