import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSearch } from 'react-icons/fa';
import '../../../css/pedidos/Pasos/paso1.css';

const Step1PersonalData = ({ formData, updateFormData, users = [] }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar usuarios normales (rol 2)
  const normalUsers = users.filter(user => user.rol === 2);
  
  // Filtrar por búsqueda
  const filteredUsers = normalUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user) => {
    console.log('Usuario seleccionado:', user);
    updateFormData({
      user_id: user.id,
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: user.phone || ''
    });
    setSearchTerm(user.name);
    setShowDropdown(false);
  };

  const handleNameClick = () => {
    console.log('Click en input - Mostrando dropdown');
    setShowDropdown(true);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      updateFormData({
        user_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: ''
      });
    }
    setShowDropdown(true);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="step1-personal-data">
      <h3>Datos del Cliente</h3>
      <br />      
      <div className="step1-form-group" ref={dropdownRef}>
        <label><FaUser /> Nombre completo *</label>
        <div className="step1-autocomplete-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Nombre del cliente o busca aquí..."
            value={searchTerm || formData.customer_name}
            onChange={handleInputChange}
            onClick={handleNameClick}
            className="step1-autocomplete-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <FaSearch className="step1-search-icon" />
        </div>
        
        {/* Dropdown con usuarios */}
        {showDropdown && (
          <div className="step1-autocomplete-dropdown">
            {normalUsers.length === 0 ? (
              <div className="step1-autocomplete-empty">
                No hay clientes registrados
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className="step1-autocomplete-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                  {user.phone && <span>{user.phone}</span>}
                </div>
              ))
            ) : (
              <div className="step1-autocomplete-empty">
                No se encontraron clientes con "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="step1-form-group">
        <label><FaEnvelope /> Correo electrónico *</label>
        <input
          type="email"
          value={formData.customer_email}
          onChange={(e) => updateFormData({ customer_email: e.target.value })}
          placeholder="cliente@ejemplo.com"
          autoComplete="off"
          required
        />
      </div>
      
      <div className="step1-form-group">
        <label><FaPhone /> Teléfono</label>
        <input
          type="tel"
          value={formData.customer_phone}
          onChange={(e) => updateFormData({ customer_phone: e.target.value })}
          placeholder="10 dígitos"
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default Step1PersonalData;