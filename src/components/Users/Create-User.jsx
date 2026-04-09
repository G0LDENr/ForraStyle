import React, { useState } from 'react';
import { UserController } from '../../controllers/UserController';
import '../../css/user/create-user.css';

export function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await UserController.createUser(formData);
    
    if (result.success) {
      setFormData({ name: '', email: '', phone: '', age: '' });
      onUserCreated();
      onClose();
    } else {
      window.alert('Error al crear: ' + result.error);
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
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
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}