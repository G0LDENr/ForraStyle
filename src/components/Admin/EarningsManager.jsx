import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaTruck, FaUserPlus, FaSave, FaSpinner, FaEdit } from 'react-icons/fa';
import { AdminEarningsModel } from '../../models/AdminEarningsModel';
import '../../css/admin/earnings-manager.css';

export function EarningsManager({ currentUserId }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editPercentages, setEditPercentages] = useState({ percentage_by_ship: 0, percentage_by_employee: 0 });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    const data = await AdminEarningsModel.getAllAdminsWithConfig();
    setAdmins(data);
    setLoading(false);
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setEditPercentages({
      percentage_by_ship: admin.admin_earnings_config?.percentage_by_ship || 0,
      percentage_by_employee: admin.admin_earnings_config?.percentage_by_employee || 0
    });
  };

  const handleSavePercentages = async () => {
    if (!selectedAdmin) return;
    
    setSaving(true);
    const result = await AdminEarningsModel.updatePercentages(
      selectedAdmin.id,
      editPercentages,
      0 // Super admin role
    );
    
    if (result.success) {
      setMessage(`Porcentajes de ${selectedAdmin.name} actualizados exitosamente`);
      await loadAdmins();
      setSelectedAdmin(null);
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setTimeout(() => setMessage(''), 3000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="earnings-loading">
        <FaSpinner className="spinner" />
        <p>Cargando administradores...</p>
      </div>
    );
  }

  return (
    <div className="earnings-container">
      <div className="earnings-header">
        <h2 className="earnings-title">
          <FaDollarSign className="earnings-title-icon" />
          Gestion de Sueldos y Porcentajes
        </h2>
      </div>

      {message && <div className="earnings-message">{message}</div>}

      <div className="earnings-table-container">
        <table className="earnings-table">
          <thead>
            <tr>
              <th>Administrador</th>
              <th>Email</th>
              <th>% por Envio</th>
              <th>% por Empleado</th>
              <th>Ganancias Totales</th>
              <th>Ganancias del Mes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => {
              const config = admin.admin_earnings_config || {};
              return (
                <tr key={admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{config.percentage_by_ship || 0}%</td>
                  <td>{config.percentage_by_employee || 0}%</td>
                  <td>${(config.total_earnings || 0).toFixed(2)}</td>
                  <td>${(config.monthly_earnings || 0).toFixed(2)}</td>
                  <td>
                    <button 
                      className="earnings-edit-btn"
                      onClick={() => handleEditClick(admin)}
                    >
                      <FaEdit /> Editar Porcentajes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {selectedAdmin && (
        <div className="earnings-modal-overlay" onClick={() => setSelectedAdmin(null)}>
          <div className="earnings-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="earnings-modal-header">
              <h3>Editar Porcentajes - {selectedAdmin.name}</h3>
              <button className="earnings-modal-close" onClick={() => setSelectedAdmin(null)}>×</button>
            </div>
            <div className="earnings-modal-body">
              <div className="earnings-form-group">
                <label>
                  <FaTruck /> Porcentaje por Envio (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editPercentages.percentage_by_ship}
                  onChange={(e) => setEditPercentages({...editPercentages, percentage_by_ship: parseFloat(e.target.value)})}
                  className="earnings-input"
                />
                <small>Porcentaje que recibe por cada envio realizado</small>
              </div>
              <div className="earnings-form-group">
                <label>
                  <FaUserPlus /> Porcentaje por Empleado (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editPercentages.percentage_by_employee}
                  onChange={(e) => setEditPercentages({...editPercentages, percentage_by_employee: parseFloat(e.target.value)})}
                  className="earnings-input"
                />
                <small>Porcentaje que recibe por cada empleado que registra</small>
              </div>
            </div>
            <div className="earnings-modal-footer">
              <button className="earnings-modal-cancel" onClick={() => setSelectedAdmin(null)}>
                Cancelar
              </button>
              <button className="earnings-modal-save" onClick={handleSavePercentages} disabled={saving}>
                {saving ? <><FaSpinner className="spinner" /> Guardando...</> : <><FaSave /> Guardar Cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}