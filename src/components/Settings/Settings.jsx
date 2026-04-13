import React, { useState, useEffect, useCallback } from 'react';
import { FaCog, FaUserShield, FaDollarSign, FaTruck, FaUserPlus, FaSpinner } from 'react-icons/fa';
import { AdminEarningsModel } from '../../models/AdminEarningsModel';
import { UserController } from '../../controllers/UserController';
import '../../css/settings/settings.css';

export function SettingsManager({ userData, users, orders }) {
  const [adminPermissions, setAdminPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  // Estados para ganancias (solo para admins)
  const [earningsConfig, setEarningsConfig] = useState(null);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const loadAdminPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    try {
      const permissions = await UserController.getUserPermissions(userData.id, userData.rol);
      console.log('Permisos cargados:', permissions);
      
      if (permissions) {
        setAdminPermissions({
          createUsers: { 
            enabled: permissions.canCreate, 
            dailyLimit: permissions.dailyLimit || 0,
            currentCount: permissions.currentDailyCount || 0
          },
          editUsers: { 
            enabled: permissions.canEdit, 
            canEditAdmins: permissions.canEditAdmins,
            dailyLimit: permissions.editDailyLimit || 0,
            currentCount: permissions.currentEditCount || 0
          },
          deleteUsers: { 
            enabled: permissions.canDelete,
            canDeleteAdmins: permissions.canDeleteAdmins,
            canDeleteSuperAdmin: permissions.canDeleteSuperAdmin
          }
        });
      } else {
        setAdminPermissions({
          createUsers: { enabled: false, dailyLimit: 0, currentCount: 0 },
          editUsers: { enabled: false, canEditAdmins: false, dailyLimit: 0, currentCount: 0 },
          deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false }
        });
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
      setAdminPermissions({
        createUsers: { enabled: false, dailyLimit: 0, currentCount: 0 },
        editUsers: { enabled: false, canEditAdmins: false, dailyLimit: 0, currentCount: 0 },
        deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false }
      });
    } finally {
      setLoadingPermissions(false);
    }
  }, [userData.id, userData.rol]);

  const loadEarningsConfig = useCallback(async () => {
    if (!userData?.id) return;
    
    setLoadingEarnings(true);
    try {
      const config = await AdminEarningsModel.getByAdminId(userData.id);
      setEarningsConfig(config);
    } catch (error) {
      console.error('Error cargando configuración de ganancias:', error);
    } finally {
      setLoadingEarnings(false);
    }
  }, [userData.id]);

  useEffect(() => {
    if (userData?.rol === 1) {
      loadAdminPermissions();
      loadEarningsConfig();
    }
  }, [userData, loadAdminPermissions, loadEarningsConfig]);

  const getCreateLimitText = () => {
    const limit = adminPermissions?.createUsers?.dailyLimit;
    if (limit === 0) return 'sin limite';
    return `${limit} por dia`;
  };

  const getEditLimitText = () => {
    const limit = adminPermissions?.editUsers?.dailyLimit;
    if (limit === 0) return 'sin limite';
    return `${limit} ediciones por dia`;
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">
          <FaCog className="settings-title-icon" />
          Configuracion del Sistema
        </h2>
      </div>

      <div className="settings-card">
        {/* Información del usuario actual */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <FaUserShield className="settings-section-icon" />
            Informacion de Usuario
          </h3>
          <div className="settings-item">
            <label>Rol del usuario actual:</label>
            <span className={userData?.rol === 0 ? 'settings-badge-super' : 'settings-badge-admin'}>
              {userData?.rol === 0 ? 'Super Administrador' : 'Administrador'}
            </span>
          </div>
          <div className="settings-item">
            <label>Nombre:</label>
            <span>{userData?.name || userData?.nombre || 'N/A'}</span>
          </div>
          <div className="settings-item">
            <label>Email:</label>
            <span>{userData?.email || userData?.correo || 'N/A'}</span>
          </div>
        </div>

        {/* Ganancias - Solo visible para Administradores (rol 1) */}
        {userData?.rol === 1 && (
          <div className="settings-section">
            <h3 className="settings-section-title">
              <FaDollarSign className="settings-section-icon" />
              Mis Ganancias
            </h3>
            
            {loadingEarnings ? (
              <div className="settings-loading">
                <FaSpinner className="spinner" />
                <span>Cargando...</span>
              </div>
            ) : (
              <>
                <div className="settings-earnings-summary">
                  <div className="settings-earnings-card">
                    <div className="settings-earnings-icon"><FaTruck /></div>
                    <div className="settings-earnings-info">
                      <label>Porcentaje por Envio</label>
                      <p>{earningsConfig?.percentage_by_ship || 0}%</p>
                    </div>
                  </div>
                  <div className="settings-earnings-card">
                    <div className="settings-earnings-icon"><FaUserPlus /></div>
                    <div className="settings-earnings-info">
                      <label>Porcentaje por Empleado</label>
                      <p>{earningsConfig?.percentage_by_employee || 0}%</p>
                    </div>
                  </div>
                  <div className="settings-earnings-card">
                    <div className="settings-earnings-icon"><FaDollarSign /></div>
                    <div className="settings-earnings-info">
                      <label>Ganancias Totales</label>
                      <p>${(earningsConfig?.total_earnings || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="settings-earnings-note">
                  <p>Nota: Tus ganancias se calculan automaticamente segun los envios y empleados que registras.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mostrar permisos actuales si es admin */}
        {userData?.rol === 1 && (
          <div className="settings-section">
            <h3 className="settings-section-title">
              <FaUserShield className="settings-section-icon" />
              Mis Permisos
            </h3>
            
            {loadingPermissions ? (
              <div className="settings-loading">
                <FaSpinner className="spinner" />
                <span>Cargando permisos...</span>
              </div>
            ) : (
              <div className="settings-permissions-list">
                <div className="settings-permission-item">
                  <span className="settings-permission-label">Crear usuarios:</span>
                  <span className={adminPermissions?.createUsers?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                    {adminPermissions?.createUsers?.enabled ? 
                      `Si (${getCreateLimitText()})` : 
                      'No'}
                  </span>
                </div>
                <div className="settings-permission-item">
                  <span className="settings-permission-label">Editar usuarios:</span>
                  <span className={adminPermissions?.editUsers?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                    {adminPermissions?.editUsers?.enabled ? 
                      `Si (${getEditLimitText()})` : 
                      'No'}
                  </span>
                </div>
                {adminPermissions?.editUsers?.enabled && adminPermissions?.editUsers?.canEditAdmins && (
                  <div className="settings-permission-item sub-permission">
                    <span className="settings-permission-label">─ Editar administradores:</span>
                    <span className="settings-permission-enabled">Si</span>
                  </div>
                )}
                <div className="settings-permission-item">
                  <span className="settings-permission-label">Eliminar usuarios:</span>
                  <span className={adminPermissions?.deleteUsers?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                    {adminPermissions?.deleteUsers?.enabled ? 'Si' : 'No'}
                  </span>
                </div>
                {adminPermissions?.deleteUsers?.enabled && adminPermissions?.deleteUsers?.canDeleteAdmins && (
                  <div className="settings-permission-item sub-permission">
                    <span className="settings-permission-label">─ Eliminar administradores:</span>
                    <span className="settings-permission-enabled">Si</span>
                  </div>
                )}
                {adminPermissions?.deleteUsers?.enabled && adminPermissions?.deleteUsers?.canDeleteSuperAdmin && (
                  <div className="settings-permission-item sub-permission">
                    <span className="settings-permission-label">─ Eliminar Super Administradores:</span>
                    <span className="settings-permission-enabled">Si</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Información del sistema */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <FaCog className="settings-section-icon" />
            Informacion del Sistema
          </h3>
          <div className="settings-item">
            <label>Version del sistema:</label>
            <span>1.0.0</span>
          </div>
          <div className="settings-item">
            <label>Total de usuarios:</label>
            <span>{users.length}</span>
          </div>
          <div className="settings-item">
            <label>Total de pedidos:</label>
            <span>{orders.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}