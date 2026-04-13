import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaMoneyBillWave, FaChartLine, FaTruck, FaUsers, FaSpinner } from 'react-icons/fa';
import { AdminEarningsModel } from '../../models/AdminEarningsModel';
import '../../css/admin/admin-earnings.css';

export function AdminEarnings({ adminId }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, [adminId]);

  const loadEarnings = async () => {
    setLoading(true);
    const data = await AdminEarningsModel.getByAdminId(adminId);
    setConfig(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="admin-earnings-loading">
        <FaSpinner className="spinner" />
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="admin-earnings-container">
      <div className="admin-earnings-header">
        <h2 className="admin-earnings-title">
          <FaDollarSign className="admin-earnings-title-icon" />
          Mis Ganancias
        </h2>
      </div>

      <div className="admin-earnings-cards">
        <div className="earnings-card earnings-card-total">
          <div className="earnings-card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="earnings-card-info">
            <h3>Ganancias Totales</h3>
            <p>${(config?.total_earnings || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="earnings-card earnings-card-monthly">
          <div className="earnings-card-icon">
            <FaChartLine />
          </div>
          <div className="earnings-card-info">
            <h3>Ganancias del Mes</h3>
            <p>${(config?.monthly_earnings || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="earnings-card earnings-card-ship">
          <div className="earnings-card-icon">
            <FaTruck />
          </div>
          <div className="earnings-card-info">
            <h3>Porcentaje por Envío</h3>
            <p>{config?.percentage_by_ship || 0}%</p>
          </div>
        </div>

        <div className="earnings-card earnings-card-employee">
          <div className="earnings-card-icon">
            <FaUsers />
          </div>
          <div className="earnings-card-info">
            <h3>Porcentaje por Empleado</h3>
            <p>{config?.percentage_by_employee || 0}%</p>
          </div>
        </div>
      </div>

      <div className="admin-earnings-info">
        <h3>¿Cómo se calculan tus ganancias?</h3>
        <ul>
          <li>
            <strong>Por Envíos:</strong> Recibes el {config?.percentage_by_ship || 0}% del valor de cada envío que gestionas.
          </li>
          <li>
            <strong>Por Empleados:</strong> Recibes el {config?.percentage_by_employee || 0}% del valor generado por cada empleado que registras.
          </li>
          <li>
            <strong>Pago Mensual:</strong> Tus ganancias se acumulan durante el mes y se reinician al inicio de cada mes.
          </li>
        </ul>
      </div>
    </div>
  );
}