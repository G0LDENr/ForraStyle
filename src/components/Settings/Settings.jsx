import React, { useState, useEffect, useCallback } from 'react';
import { FaCog, FaUserShield, FaDollarSign, FaTruck, FaUserPlus, FaSpinner } from 'react-icons/fa';
import { AdminEarningsModel } from '../../models/AdminEarningsModel';
import { UserController } from '../../controllers/UserController';
import { OrderController } from '../../controllers/OrdenesController';
import '../../css/settings/settings.css';

export function SettingsManager({ userData, users = [], orders = [] }) {
  const [adminPermissions, setAdminPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  // Estados para ganancias (solo para admins)
  const [earningsConfig, setEarningsConfig] = useState(null);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const loadAdminPermissions = useCallback(async () => {
    if (!userData?.id) return;
    
    setLoadingPermissions(true);
    try {
      // Cargar permisos de usuarios
      const userPermissions = await UserController.getUserPermissions(userData.id, userData.rol);
      console.log('Permisos de usuario cargados:', userPermissions);
      
      // Cargar permisos de pedidos
      const orderPermissionsResult = await OrderController.getAdminOrderPermissions(userData.id, userData.rol);
      const orderPermissions = orderPermissionsResult.success ? orderPermissionsResult.data : {};
      console.log('Permisos de pedidos cargados:', orderPermissions);
      
      if (userPermissions) {
        setAdminPermissions({
          // Permisos de usuarios
          createUsers: { 
            enabled: userPermissions.canCreate, 
            dailyLimit: userPermissions.dailyLimit || 0,
            currentCount: userPermissions.currentDailyCount || 0
          },
          editUsers: { 
            enabled: userPermissions.canEdit, 
            canEditAdmins: userPermissions.canEditAdmins,
            dailyLimit: userPermissions.editDailyLimit || 0,
            currentCount: userPermissions.currentEditCount || 0
          },
          deleteUsers: { 
            enabled: userPermissions.canDelete,
            canDeleteAdmins: userPermissions.canDeleteAdmins,
            canDeleteSuperAdmin: userPermissions.canDeleteSuperAdmin
          },
          // Permisos de pedidos
          createOrders: {
            enabled: orderPermissions.canCreateOrders || false,
            dailyLimit: orderPermissions.orderDailyLimit || 0,
            currentCount: orderPermissions.orderCurrentCount || 0
          },
          editOrders: {
            enabled: orderPermissions.canEditOrders || false,
            dailyLimit: orderPermissions.orderEditDailyLimit || 0,
            currentCount: orderPermissions.orderEditCurrentCount || 0,
            canEditAllOrders: orderPermissions.canEditAllOrders || false
          },
          deleteOrders: {
            enabled: orderPermissions.canDeleteOrders || false,
            canDeleteAllOrders: orderPermissions.canDeleteAllOrders || false
          }
        });
      } else {
        setAdminPermissions({
          createUsers: { enabled: false, dailyLimit: 0, currentCount: 0 },
          editUsers: { enabled: false, canEditAdmins: false, dailyLimit: 0, currentCount: 0 },
          deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false },
          createOrders: { enabled: false, dailyLimit: 0, currentCount: 0 },
          editOrders: { enabled: false, dailyLimit: 0, currentCount: 0, canEditAllOrders: false },
          deleteOrders: { enabled: false, canDeleteAllOrders: false }
        });
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
      setAdminPermissions({
        createUsers: { enabled: false, dailyLimit: 0, currentCount: 0 },
        editUsers: { enabled: false, canEditAdmins: false, dailyLimit: 0, currentCount: 0 },
        deleteUsers: { enabled: false, canDeleteAdmins: false, canDeleteSuperAdmin: false },
        createOrders: { enabled: false, dailyLimit: 0, currentCount: 0 },
        editOrders: { enabled: false, dailyLimit: 0, currentCount: 0, canEditAllOrders: false },
        deleteOrders: { enabled: false, canDeleteAllOrders: false }
      });
    } finally {
      setLoadingPermissions(false);
    }
  }, [userData?.id, userData?.rol]);

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
  }, [userData?.id]);

  useEffect(() => {
    if (userData?.rol === 1) {
      loadAdminPermissions();
      loadEarningsConfig();
    }
  }, [userData, loadAdminPermissions, loadEarningsConfig]);

  const getCreateUsersLimitText = () => {
    const limit = adminPermissions?.createUsers?.dailyLimit;
    if (limit === 0) return 'Sin límite';
    return `${limit} por día`;
  };

  const getCreateUsersUsageText = () => {
    const current = adminPermissions?.createUsers?.currentCount || 0;
    const limit = adminPermissions?.createUsers?.dailyLimit;
    if (limit === 0) return `${current} usados`;
    return `${current}/${limit} usados`;
  };

  const getEditUsersLimitText = () => {
    const limit = adminPermissions?.editUsers?.dailyLimit;
    if (limit === 0) return 'Sin límite';
    return `${limit} ediciones por día`;
  };

  const getEditUsersUsageText = () => {
    const current = adminPermissions?.editUsers?.currentCount || 0;
    const limit = adminPermissions?.editUsers?.dailyLimit;
    if (limit === 0) return `${current} usados`;
    return `${current}/${limit} usados`;
  };

  const getCreateOrdersLimitText = () => {
    const limit = adminPermissions?.createOrders?.dailyLimit;
    if (limit === 0) return 'Sin límite';
    return `${limit} por día`;
  };

  const getCreateOrdersUsageText = () => {
    const current = adminPermissions?.createOrders?.currentCount || 0;
    const limit = adminPermissions?.createOrders?.dailyLimit;
    if (limit === 0) return `${current} creados hoy`;
    return `${current}/${limit} creados hoy`;
  };

  const getEditOrdersLimitText = () => {
    const limit = adminPermissions?.editOrders?.dailyLimit;
    if (limit === 0) return 'Sin límite';
    return `${limit} ediciones por día`;
  };

  const getEditOrdersUsageText = () => {
    const current = adminPermissions?.editOrders?.currentCount || 0;
    const limit = adminPermissions?.editOrders?.dailyLimit;
    if (limit === 0) return `${current} editados hoy`;
    return `${current}/${limit} editados hoy`;
  };

  // Validar que userData existe
  if (!userData) {
    return (
      <div className="settings-container">
        <div className="settings-card">
          <div className="settings-loading">
            <FaSpinner className="spinner" />
            <span>Cargando información del usuario...</span>
          </div>
        </div>
      </div>
    );
  }

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
              <>
                {/* Tabla de permisos de usuarios */}
                <h4 className="settings-subsection-title">
                  Permisos de Usuarios
                </h4>
                <div className="settings-permissions-table-container">
                  <table className="settings-permissions-table">
                    <thead>
                      <tr>
                        <th>Permiso</th>
                        <th>Estado</th>
                        <th>Límite</th>
                        <th>Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="settings-permission-name">Crear usuarios</td>
                        <td>
                          <span className={adminPermissions?.createUsers?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                            {adminPermissions?.createUsers?.enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td>{getCreateUsersLimitText()}</td>
                        <td>{getCreateUsersUsageText()}</td>
                      </tr>
                      <tr>
                        <td className="settings-permission-name">Editar usuarios</td>
                        <td>
                          <span className={adminPermissions?.editUsers?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                            {adminPermissions?.editUsers?.enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td>{getEditUsersLimitText()}</td>
                        <td>{getEditUsersUsageText()}</td>
                      </tr>
                      {adminPermissions?.editUsers?.enabled && adminPermissions?.editUsers?.canEditAdmins && (
                        <tr className="settings-permission-subrow">
                          <td className="settings-permission-name sub-permission-name">└ Editar administradores</td>
                          <td colSpan="3">
                            <span className="settings-permission-enabled">Habilitado</span>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="settings-permission-name">Eliminar usuarios</td>
                        <td>
                          <span className={adminPermissions?.deleteUsers?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                            {adminPermissions?.deleteUsers?.enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td colSpan="2">
                          {adminPermissions?.deleteUsers?.enabled && (
                            <div className="settings-delete-subpermissions">
                              {adminPermissions?.deleteUsers?.canDeleteAdmins && (
                                <span className="settings-sub-badge">Puede eliminar admins</span>
                              )}
                              {adminPermissions?.deleteUsers?.canDeleteSuperAdmin && (
                                <span className="settings-sub-badge warning">Puede eliminar Super Admins</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tabla de permisos de pedidos */}
                <h4 className="settings-subsection-title">
                  Permisos de Pedidos
                </h4>
                <div className="settings-permissions-table-container">
                  <table className="settings-permissions-table">
                    <thead>
                      <tr>
                        <th>Permiso</th>
                        <th>Estado</th>
                        <th>Límite</th>
                        <th>Uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="settings-permission-name">Crear pedidos</td>
                        <td>
                          <span className={adminPermissions?.createOrders?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                            {adminPermissions?.createOrders?.enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td>{getCreateOrdersLimitText()}</td>
                        <td>{getCreateOrdersUsageText()}</td>
                      </tr>
                      <tr>
                        <td className="settings-permission-name">Editar pedidos</td>
                        <td>
                          <span className={adminPermissions?.editOrders?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                            {adminPermissions?.editOrders?.enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td>{getEditOrdersLimitText()}</td>
                        <td>{getEditOrdersUsageText()}</td>
                      </tr>
                      {adminPermissions?.editOrders?.enabled && adminPermissions?.editOrders?.canEditAllOrders && (
                        <tr className="settings-permission-subrow">
                          <td className="settings-permission-name sub-permission-name">└ Editar todos los pedidos</td>
                          <td colSpan="3">
                            <span className="settings-permission-enabled">Habilitado</span>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="settings-permission-name">Eliminar pedidos</td>
                        <td>
                          <span className={adminPermissions?.deleteOrders?.enabled ? 'settings-permission-enabled' : 'settings-permission-disabled'}>
                            {adminPermissions?.deleteOrders?.enabled ? 'Habilitado' : 'Deshabilitado'}
                          </span>
                        </td>
                        <td colSpan="2">
                          {adminPermissions?.deleteOrders?.enabled && adminPermissions?.deleteOrders?.canDeleteAllOrders && (
                            <div className="settings-delete-subpermissions">
                              <span className="settings-sub-badge warning">Puede eliminar todos los pedidos</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
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
            <span>{users?.length || 0}</span>
          </div>
          <div className="settings-item">
            <label>Total de pedidos:</label>
            <span>{orders?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}