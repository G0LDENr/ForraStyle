import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaInfinity, FaSync, FaCheck, FaSpinner } from 'react-icons/fa';
import { UserController } from '../../controllers/UserController';
import '../../css/admin/edit-permissions.css';

const EditPermissionsModal = ({ isOpen, onClose, onSave, admin, permissions, currentUserRole }) => {
  const defaultPermissions = {
    createUsers: { enabled: false, dailyLimit: 0 },
    editUsers: { enabled: false, canEditAdmins: false, dailyLimit: 0 },
    deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false }
  };

  const [tempPermissions, setTempPermissions] = useState(defaultPermissions);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  // Actualizar tempPermissions cuando cambian los permisos o se abre el modal
  useEffect(() => {
    if (isOpen && permissions) {
      console.log('Inicializando modal con permisos:', permissions);
      setTempPermissions({
        createUsers: { 
          enabled: permissions.createUsers?.enabled || false, 
          dailyLimit: permissions.createUsers?.dailyLimit || 0 
        },
        editUsers: { 
          enabled: permissions.editUsers?.enabled || false, 
          dailyLimit: permissions.editUsers?.dailyLimit || 0,
          canEditAdmins: permissions.editUsers?.canEditAdmins || false 
        },
        deleteUsers: { 
          enabled: permissions.deleteUsers?.enabled || false, 
          canDeleteAdmins: permissions.deleteUsers?.canDeleteAdmins || false, 
          canDeleteSuperAdmin: permissions.deleteUsers?.canDeleteSuperAdmin || false 
        }
      });
    }
  }, [isOpen, permissions]);

  if (!isOpen) return null;

  const handlePermissionToggle = (category, field, value) => {
    setTempPermissions(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleDailyLimitChange = (category, field, value) => {
    const newValue = parseInt(value) || 0;
    setTempPermissions(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: newValue }
    }));
  };

  const setUnlimited = (category, field) => {
    setTempPermissions(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: 0 }
    }));
  };

  const handleResetCounters = async () => {
    setResetting(true);
    try {
      const result = await UserController.resetAdminCounters(admin.id, currentUserRole);
      
      if (result.success) {
        setResetMessage('✅ Contadores reiniciados exitosamente');
        setShowResetSuccess(true);
        
        // Disparar evento para que UserList actualice solo estadísticas
        window.dispatchEvent(new CustomEvent('refreshStats'));
        
        setTimeout(() => setShowResetSuccess(false), 3000);
      } else {
        setResetMessage(`❌ Error: ${result.error}`);
        setTimeout(() => setResetMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error reiniciando contadores:', error);
      setResetMessage('❌ Error al reiniciar contadores');
      setTimeout(() => setResetMessage(''), 3000);
    }
    setResetting(false);
    setShowResetConfirm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('Guardando permisos:', tempPermissions);
    
    // Asegurar que todos los campos tengan valores válidos
    const permissionsToSave = {
      createUsers: {
        enabled: tempPermissions.createUsers?.enabled || false,
        dailyLimit: tempPermissions.createUsers?.dailyLimit || 0
      },
      editUsers: {
        enabled: tempPermissions.editUsers?.enabled || false,
        dailyLimit: tempPermissions.editUsers?.dailyLimit || 0,
        canEditAdmins: tempPermissions.editUsers?.canEditAdmins || false
      },
      deleteUsers: {
        enabled: tempPermissions.deleteUsers?.enabled || false,
        canDeleteAdmins: tempPermissions.deleteUsers?.canDeleteAdmins || false,
        canDeleteSuperAdmin: tempPermissions.deleteUsers?.canDeleteSuperAdmin || false
      }
    };
    
    await onSave(permissionsToSave);
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
          {/* Botón de reinicio de contadores */}
          <div className="edit-permission-group reset-counters-group">
            <div className="edit-permission-header">
              <FaSync className="edit-permission-icon" />
              <label>Reiniciar Contadores Diarios</label>
            </div>
            <div className="edit-permission-controls">
              <button 
                className="reset-counters-btn"
                onClick={() => setShowResetConfirm(true)}
                disabled={resetting}
              >
                <FaSync /> {resetting ? 'Reiniciando...' : 'Reiniciar Contadores de Hoy'}
              </button>
              <small className="reset-help-text">
                ⚠️ Esto reiniciará los contadores de creaciones y ediciones del día actual para este administrador.
                Los usuarios editados hoy podrán ser editados nuevamente.
              </small>
              {resetMessage && (
                <div className={`reset-message ${resetMessage.includes('') ? 'success' : 'error'}`}>
                  {resetMessage}
                </div>
              )}
            </div>
          </div>

          <div className="edit-permissions-divider"></div>

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
                  <div className="edit-limit-input-group">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={tempPermissions.createUsers?.dailyLimit || 0} 
                      onChange={(e) => handleDailyLimitChange('createUsers', 'dailyLimit', e.target.value)} 
                      className="edit-limit-input" 
                    />
                    <button 
                      type="button"
                      className="edit-unlimited-btn"
                      onClick={() => setUnlimited('createUsers', 'dailyLimit')}
                      title="Sin límite (0 = infinito)"
                    >
                      <FaInfinity /> Sin Límite
                    </button>
                  </div>
                  <small>
                    {tempPermissions.createUsers?.dailyLimit === 0 
                      ? "Límite infinito - Puede crear usuarios ilimitados por día" 
                      : `Límite actual: ${tempPermissions.createUsers?.dailyLimit} usuario(s) por día`}
                  </small>
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
                    <div className="edit-limit-input-group">
                      <input 
                        type="number" 
                        min="0" 
                        max="50" 
                        value={tempPermissions.editUsers?.dailyLimit || 0} 
                        onChange={(e) => handleDailyLimitChange('editUsers', 'dailyLimit', e.target.value)} 
                        className="edit-limit-input" 
                      />
                      <button 
                        type="button"
                        className="edit-unlimited-btn"
                        onClick={() => setUnlimited('editUsers', 'dailyLimit')}
                        title="Sin límite (0 = infinito)"
                      >
                        <FaInfinity /> Sin Límite
                      </button>
                    </div>
                    <small>
                      {tempPermissions.editUsers?.dailyLimit === 0 
                        ? "Límite infinito - Puede editar usuarios ilimitadas veces por día" 
                        : `Límite actual: ${tempPermissions.editUsers?.dailyLimit} edición(es) por usuario al día`}
                    </small>
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

      {/* Modal de confirmación para reiniciar contadores */}
      {showResetConfirm && (
        <div className="edit-permissions-modal-overlay reset-confirm-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="reset-confirm-container" onClick={(e) => e.stopPropagation()}>
            <div className="reset-confirm-header">
              <FaExclamationTriangle className="warning-icon" />
              <h3>Confirmar Reinicio</h3>
            </div>
            <div className="reset-confirm-body">
              <p>¿Estás seguro de que deseas reiniciar los contadores diarios de <strong>{admin?.name}</strong>?</p>
              <p>Esto permitirá que el administrador pueda:</p>
              <ul>
                <li>Crear más usuarios hoy (si tiene límite diario)</li>
                <li>Editar nuevamente a los usuarios que ya editó hoy</li>
              </ul>
              <p className="warning-text">⚠️ Esta acción no afecta los límites configurados, solo reinicia los contadores del día actual.</p>
            </div>
            <div className="reset-confirm-footer">
              <button className="reset-confirm-cancel" onClick={() => setShowResetConfirm(false)}>
                Cancelar
              </button>
              <button className="reset-confirm-btn" onClick={handleResetCounters} disabled={resetting}>
                {resetting ? <><FaSpinner className="spinner" /> Reiniciando...</> : <><FaSync /> Sí, Reiniciar Contadores</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPermissionsModal;