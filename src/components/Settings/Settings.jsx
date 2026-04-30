import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaCog, 
  FaUserShield, 
  FaDollarSign, 
  FaTruck, 
  FaSpinner, 
  FaShoppingCart, 
  FaMoneyBillWave,
  FaStore
} from 'react-icons/fa';
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
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalShipping: 0,
    commissionBySales: 0,
    commissionByShipping: 0,
    totalCommission: 0,
    ordersWithShipping: 0,
    ordersWithoutShipping: 0
  });
  const [loadingOrderStats, setLoadingOrderStats] = useState(false);

  const loadAdminPermissions = useCallback(async () => {
    if (!userData?.id) return;
    
    setLoadingPermissions(true);
    try {
      const userPermissions = await UserController.getUserPermissions(userData.id, userData.rol);
      console.log('Permisos de usuario cargados:', userPermissions);
      
      const orderPermissionsResult = await OrderController.getAdminOrderPermissions(userData.id, userData.rol);
      const orderPermissions = orderPermissionsResult.success ? orderPermissionsResult.data : {};
      console.log('Permisos de pedidos cargados:', orderPermissions);
      
      if (userPermissions) {
        setAdminPermissions({
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

  const loadOrderStats = useCallback(async () => {
    if (!userData?.id || userData?.rol !== 1) return;
    
    setLoadingOrderStats(true);
    try {
      const ordersResult = await OrderController.getOrders(userData.id, userData.rol);
      
      if (ordersResult.success && ordersResult.data) {
        const adminOrders = ordersResult.data;
        
        // Obtener porcentajes de la configuración (default 5%)
        const percentageBySale = earningsConfig?.percentage_by_sale || 5;
        const percentageByShipping = earningsConfig?.percentage_by_shipping || 5;
        
        let totalSales = 0;
        let totalShipping = 0;
        let commissionBySales = 0;
        let commissionByShipping = 0;
        let ordersWithShipping = 0;
        let ordersWithoutShipping = 0;
        
        // Calcular por cada pedido individualmente
        adminOrders.forEach(order => {
          // Usar subtotal o total correctamente
          const subtotal = parseFloat(order.subtotal) || parseFloat(order.total) || 0;
          
          // Verificar si tiene envío basado en shipping_method y shipping_cost
          const hasShipping = order.shipping_method === 'delivery' && parseFloat(order.shipping_cost) > 0;
          const shippingCost = hasShipping ? parseFloat(order.shipping_cost) : 0;
          
          totalSales += subtotal;
          
          // Comisión por compra (siempre aplica)
          commissionBySales += subtotal * (percentageBySale / 100);
          
          // Comisión por envío (solo si tiene envío válido)
          if (hasShipping) {
            totalShipping += shippingCost;
            commissionByShipping += shippingCost * (percentageByShipping / 100);
            ordersWithShipping++;
          } else {
            ordersWithoutShipping++;
          }
          
          console.log(`📊 Pedido ${order.order_number}: subtotal=${subtotal}, hasShipping=${hasShipping}, shippingCost=${shippingCost}`);
        });
        
        const totalCommission = commissionBySales + commissionByShipping;
        
        console.log(`📊 Resumen: Pedidos con envío=${ordersWithShipping}, sin envío=${ordersWithoutShipping}`);
        console.log(`📊 Comisión por ventas: ${commissionBySales}, Comisión por envíos: ${commissionByShipping}, Total: ${totalCommission}`);
        
        setOrderStats({
          totalOrders: adminOrders.length,
          totalSales,
          totalShipping,
          commissionBySales,
          commissionByShipping,
          totalCommission,
          ordersWithShipping,
          ordersWithoutShipping
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas de pedidos:', error);
    } finally {
      setLoadingOrderStats(false);
    }
  }, [userData?.id, userData?.rol, earningsConfig?.percentage_by_sale, earningsConfig?.percentage_by_shipping]);

  useEffect(() => {
    if (userData?.rol === 1) {
      loadAdminPermissions();
      loadEarningsConfig();
    }
  }, [userData, loadAdminPermissions, loadEarningsConfig]);

  useEffect(() => {
    if (userData?.rol === 1 && earningsConfig) {
      loadOrderStats();
    }
  }, [userData?.rol, earningsConfig, loadOrderStats]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
  };

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
            
            {loadingEarnings || loadingOrderStats ? (
              <div className="settings-loading">
                <FaSpinner className="spinner" />
                <span>Cargando...</span>
              </div>
            ) : (
              <>
                {/* Tarjetas de configuración de ganancias */}
                <div className="settings-earnings-summary">
                  <div className="settings-earnings-card">
                    <div className="settings-earnings-icon"><FaStore /></div>
                    <div className="settings-earnings-info">
                      <label>Comisión por Compra</label>
                      <p>{earningsConfig?.percentage_by_sale || 5}%</p>
                      <small>Siempre aplica</small>
                    </div>
                  </div>
                  <div className="settings-earnings-card">
                    <div className="settings-earnings-icon"><FaTruck /></div>
                    <div className="settings-earnings-info">
                      <label>Comisión por Envío</label>
                      <p>{earningsConfig?.percentage_by_shipping || 5}%</p>
                      <small>Solo si hay envío</small>
                    </div>
                  </div>
                  <div className="settings-earnings-card">
                    <div className="settings-earnings-icon"><FaMoneyBillWave /></div>
                    <div className="settings-earnings-info">
                      <label>Ganancias Totales</label>
                      <p>{formatCurrency(orderStats.totalCommission)}</p>
                    </div>
                  </div>
                </div>

                {/* Desglose de ganancias */}
                <div className="settings-earnings-detail">
                  <h4 className="settings-subsection-title">Desglose de Ganancias</h4>
                  
                  <div className="settings-earnings-detail-item">
                    <span>Total de pedidos:</span>
                    <strong>{orderStats.totalOrders}</strong>
                  </div>
                  <div className="settings-earnings-detail-item">
                    <span>📦 Pedidos con envío:</span>
                    <strong>{orderStats.ordersWithShipping}</strong>
                  </div>
                  <div className="settings-earnings-detail-item">
                    <span>🏪 Pedidos sin envío (recoge en tienda):</span>
                    <strong>{orderStats.ordersWithoutShipping}</strong>
                  </div>
                  
                  <div className="settings-earnings-divider"></div>
                  
                  <div className="settings-earnings-detail-item">
                    <span>Total en ventas:</span>
                    <strong>{formatCurrency(orderStats.totalSales)}</strong>
                  </div>
                  <div className="settings-earnings-detail-item">
                    <span>Comisión por ventas ({earningsConfig?.percentage_by_sale || 5}%):</span>
                    <strong>{formatCurrency(orderStats.commissionBySales)}</strong>
                    <small className="info-text">✓ Siempre aplica</small>
                  </div>
                  
                  {orderStats.totalShipping > 0 && (
                    <>
                      <div className="settings-earnings-detail-item">
                        <span>Total en envíos:</span>
                        <strong>{formatCurrency(orderStats.totalShipping)}</strong>
                      </div>
                      <div className="settings-earnings-detail-item">
                        <span>Comisión por envíos ({earningsConfig?.percentage_by_shipping || 5}%):</span>
                        <strong>{formatCurrency(orderStats.commissionByShipping)}</strong>
                        <small className="info-text">✓ Solo pedidos con envío</small>
                      </div>
                    </>
                  )}
                  
                  <div className="settings-earnings-detail-item total">
                    <span>Total de ganancias:</span>
                    <strong className="commission-total">{formatCurrency(orderStats.totalCommission)}</strong>
                  </div>
                </div>

                <div className="settings-earnings-note">
                  <p>📊 <strong>¿Cómo se calculan tus ganancias?</strong></p>
                  <p>• <strong>Comisión por Compra:</strong> {earningsConfig?.percentage_by_sale || 5}% del total de CADA pedido (productos + servicios).</p>
                  <p>• <strong>Comisión por Envío:</strong> {earningsConfig?.percentage_by_shipping || 5}% del costo de envío, SOLO si el pedido incluye envío a domicilio.</p>
                  <p>• <strong>Ejemplo:</strong> Pedido de $100 con envío de $50 → Ganas $5 (compra) + $2.50 (envío) = <strong>$7.50</strong></p>
                  <p>• <strong>Ejemplo:</strong> Pedido de $100 sin envío (recoge en tienda) → Ganas solo <strong>$5</strong></p>
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
                <h4 className="settings-subsection-title">
                  <FaUserShield className="settings-subsection-icon" />
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

                <h4 className="settings-subsection-title">
                  <FaShoppingCart className="settings-subsection-icon" />
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