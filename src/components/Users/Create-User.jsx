import React, { useState } from 'react';
import { UserController } from '../../controllers/UserController';
import '../../css/user/create-user.css';

export function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    rol: 2 // Por defecto Usuario (2)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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
    
    if (!formData.password) {
      setError('La contraseña es requerida');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
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
      password: formData.password,
      rol: parseInt(formData.rol) // Asegurar que sea número
    };
    
    const result = await UserController.createUser(userData);
    
    if (result.success) {
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        age: '', 
        password: '',
        rol: 2 
      });
      onUserCreated();
      onClose();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Usuario</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
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
          
          <div className="form-group">
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
          
          <div className="form-group">
            <label>Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <div className="form-group">
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
          
          <div className="form-group">
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
          
          <div className="form-group">
            <label>Rol *</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="rol-select"
            >
              <option value={2}>Usuario Normal</option>
              <option value={1}>Administrador</option>
            </select>
            <small className="form-hint">
              {formData.rol === 1 ? 'El administrador tiene acceso total al sistema' : 'El usuario solo tiene acceso a sus pedidos'}
            </small>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}