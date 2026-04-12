import React, { useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import '../../css/admin/edit-permissions.css';

const EditPermissionsModal = ({ isOpen, onClose, onSave, admin, permissions }) => {
  const defaultPermissions = {
    createUsers: { enabled: false, dailyLimit: 0 },
    editUsers: { enabled: false, canEditAdmins: false, dailyLimit: 0 },
    deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false }
  };

  const initialPermissions = permissions || defaultPermissions;
  const [tempPermissions, setTempPermissions] = useState(initialPermissions);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handlePermissionToggle = (category, field, value) => {
    setTempPermissions(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleDailyLimitChange = (category, field, value) => {
    setTempPermissions(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: parseInt(value) || 0 }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(tempPermissions);
    setSaving(false);
  };

  return (
    <div className="edit-permissions-modal-overlay" onClick={onClose}>
      <div className="edit-permissions-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="edit-permissions-modal-header">
          <h3>Editar Permisos - {admin?.name || 'Administrador'}</h3>
          <button className="edit-permissions-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="edit-permissions-modal-body">
          {/* CREAR USUARIOS */}
          <div className="edit-permission-group">
            <div className="edit-permission-header">
              <FaPlus className="edit-permission-icon" />
              <label>Crear Usuarios</label>
            </div>
            <div className="edit-permission-controls">
              <label className="edit-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={tempPermissions.createUsers?.enabled || false} 
                  onChange={(e) => handlePermissionToggle('createUsers', 'enabled', e.target.checked)} 
                />
                <span>Habilitar creación de usuarios</span>
              </label>
              {tempPermissions.createUsers?.enabled && (
                <div className="edit-permission-limit">
                  <label>Límite de creación por día:</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={tempPermissions.createUsers?.dailyLimit || 0} 
                    onChange={(e) => handleDailyLimitChange('createUsers', 'dailyLimit', e.target.value)} 
                    className="edit-limit-input" 
                  />
                  <small>0 = sin límite | Ej: 3 = puede crear 3 usuarios en total por día</small>
                </div>
              )}
            </div>
          </div>

          {/* EDITAR USUARIOS */}
          <div className="edit-permission-group">
            <div className="edit-permission-header">
              <FaEdit className="edit-permission-icon" />
              <label>Editar Usuarios</label>
            </div>
            <div className="edit-permission-controls">
              <label className="edit-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={tempPermissions.editUsers?.enabled || false} 
                  onChange={(e) => handlePermissionToggle('editUsers', 'enabled', e.target.checked)} 
                />
                <span>Habilitar edición de usuarios</span>
              </label>
              {tempPermissions.editUsers?.enabled && (
                <>
                  <div className="edit-permission-limit">
                    <label>Límite de ediciones por día (por usuario):</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="50" 
                      value={tempPermissions.editUsers?.dailyLimit || 0} 
                      onChange={(e) => handleDailyLimitChange('editUsers', 'dailyLimit', e.target.value)} 
                      className="edit-limit-input" 
                    />
                    <small>0 = sin límite | Ej: 1 = cada usuario solo puede ser editado 1 vez al día | 3 = cada usuario puede ser editado 3 veces al día</small>
                  </div>
                  <label className="edit-checkbox-label sub-permission">
                    <input 
                      type="checkbox" 
                      checked={tempPermissions.editUsers?.canEditAdmins || false} 
                      onChange={(e) => handlePermissionToggle('editUsers', 'canEditAdmins', e.target.checked)} 
                    />
                    <span>Permitir editar otros administradores</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* ELIMINAR USUARIOS */}
          <div className="edit-permission-group">
            <div className="edit-permission-header">
              <FaTrash className="edit-permission-icon" />
              <label>Eliminar Usuarios</label>
            </div>
            <div className="edit-permission-controls">
              <label className="edit-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={tempPermissions.deleteUsers?.enabled || false} 
                  onChange={(e) => handlePermissionToggle('deleteUsers', 'enabled', e.target.checked)} 
                />
                <span>Habilitar eliminación de usuarios</span>
              </label>
              {tempPermissions.deleteUsers?.enabled && (
                <>
                  <div className="edit-permission-warning">
                    <FaExclamationTriangle className="warning-icon" />
                    <span>Configuración de eliminación:</span>
                  </div>
                  <label className="edit-checkbox-label sub-permission">
                    <input 
                      type="checkbox" 
                      checked={tempPermissions.deleteUsers?.canDeleteAdmins || false} 
                      onChange={(e) => handlePermissionToggle('deleteUsers', 'canDeleteAdmins', e.target.checked)} 
                    />
                    <span>Permitir eliminar otros administradores</span>
                  </label>
                  <label className="edit-checkbox-label sub-permission">
                    <input 
                      type="checkbox" 
                      checked={tempPermissions.deleteUsers?.canDeleteSuperAdmin || false} 
                      onChange={(e) => handlePermissionToggle('deleteUsers', 'canDeleteSuperAdmin', e.target.checked)} 
                    />
                    <span>Permitir eliminar Super Administradores</span>
                  </label>
                  <div className="edit-permission-note">
                    <small>⚠️ Nota: Un administrador nunca puede eliminarse a sí mismo</small>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="edit-permissions-modal-footer">
          <button className="edit-permissions-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="edit-permissions-modal-save" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPermissionsModal;