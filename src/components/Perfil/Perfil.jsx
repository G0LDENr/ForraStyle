import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../../css/perfil/perfil.css';

const Profile = ({ userData, orders }) => {
  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      <div className="profile-info">
        <div className="avatar">
          <FaUserCircle size={80} />
        </div>
        <div className="info-row">
          <label>Nombre completo:</label>
          <p>{userData?.nombre || userData?.name || 'Usuario'}</p>
        </div>
        <div className="info-row">
          <label>Correo electrónico:</label>
          <p>{userData?.correo || userData?.email || ''}</p>
        </div>
        <div className="info-row">
          <label>Tipo de usuario:</label>
          <p className="badge">{userData?.rol === 1 ? 'Administrador' : 'Usuario'}</p>
        </div>
        <div className="info-row">
          <label>Total pedidos:</label>
          <p>{orders.length} pedidos realizados</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;