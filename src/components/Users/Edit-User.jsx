import React, { useState, useEffect } from 'react';
import { UserController } from '../../controllers/UserController';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../../css/user/edit-user.css';

export function EditUserModal({ isOpen, onClose, onUserUpdated, user, currentUserRole, currentAdminId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    rol: 2
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        password: '',
        rol: user.rol || 2
      });
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Evitar múltiples envíos
    if (loading) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }
    
    if (!formData.email.trim()) {
      setError('El email es requerido');
      setLoading(false);
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Email inválido');
      setLoading(false);
      return;
    }
    
    if (formData.phone && formData.phone.length < 10) {
      setError('El teléfono debe tener al menos 10 dígitos');
      setLoading(false);
      return;
    }
    
    if (formData.age && (formData.age < 18 || formData.age > 120)) {
      setError('La edad debe estar entre 18 y 120 años');
      setLoading(false);
      return;
    }
    
    // Preparar datos para enviar
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      age: formData.age || null,
      rol: parseInt(formData.rol)
    };
    
    // Solo incluir password si se proporcionó una nueva
    if (formData.password) {
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
      userData.password = formData.password;
    }
    
    try {
      const result = await UserController.updateUser(
        user.id, 
        userData, 
        currentAdminId, 
        currentUserRole
      );
      
      if (result.success) {
        setSuccess('Usuario actualizado exitosamente');
        
        // Esperar a que onUserUpdated termine antes de cerrar
        if (onUserUpdated) {
          await onUserUpdated(user.id, userData);
        }
        
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          onClose();
          setSuccess('');
          setLoading(false);
        }, 2000);
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError(error.message || 'Error al actualizar el usuario');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Determinar las opciones de rol según el rol del usuario actual
  const getRoleOptions = () => {
    const options = [];
    
    if (currentUserRole === 0) {
      options.push(<option key={0} value={0}>Super Administrador</option>);
      options.push(<option key={1} value={1}>Administrador</option>);
      options.push(<option key={2} value={2}>Usuario Normal</option>);
    } else if (currentUserRole === 1) {
      options.push(<option key={1} value={1}>Administrador</option>);
      options.push(<option key={2} value={2}>Usuario Normal</option>);
    } else {
      options.push(<option key={formData.rol} value={formData.rol}>
        {formData.rol === 0 ? 'Super Administrador' : formData.rol === 1 ? 'Administrador' : 'Usuario Normal'}
      </option>);
    }
    
    return options;
  };

  // Determinar si puede cambiar el rol
  const canChangeRole = () => {
    if (user?.rol === 0 && currentUserRole !== 0) return false;
    if (user?.id === currentAdminId) return false;
    if (currentUserRole === 0) return true;
    if (currentUserRole === 1 && user?.rol !== 0) return true;
    return false;
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>Editar Usuario</h2>
          <button className="edit-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        {error && (
          <div className="edit-error-message">
            <FaExclamationTriangle className="edit-error-icon" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="edit-success-message">
            <FaCheckCircle className="edit-success-icon" />
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="edit-form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Ingrese el nombre completo"
            />
          </div>
          
          <div className="edit-form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="usuario@email.com"
            />
          </div>
          
          <div className="edit-form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Dejar vacío para no cambiar"
            />
            <small className="edit-form-hint">Dejar en blanco si no desea cambiar la contraseña</small>
          </div>
          
          <div className="edit-form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="5551234567"
            />
          </div>
          
          <div className="edit-form-group">
            <label>Edad</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="18"
              min="18"
              max="120"
            />
          </div>
          
          <div className="edit-form-group">
            <label>Rol *</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              required
              disabled={loading || !canChangeRole()}
              className="edit-rol-select"
            >
              {getRoleOptions()}
            </select>
          </div>
          
          <div className="edit-modal-footer">
            <button type="button" className="edit-btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="edit-btn-submit" disabled={loading}>
              {loading ? <><FaSpinner className="edit-spinner" /> Actualizando...</> : 'Actualizar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}