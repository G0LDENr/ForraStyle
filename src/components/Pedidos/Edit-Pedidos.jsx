import React, { useState, useEffect } from 'react';
import { OrderController } from '../../controllers/OrdenesController';
import { FaSpinner } from 'react-icons/fa';

export function EditOrderModal({ isOpen, onClose, onOrderUpdated, order, currentUserRole, currentAdminId }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    status: ''
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name || '',
        customer_email: order.customer_email || '',
        customer_phone: order.customer_phone || '',
        customer_address: order.customer_address || '',
        status: order.status || 'pendiente'
      });
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await OrderController.updateOrder(order.id, formData, currentAdminId, currentUserRole);
      if (result.success) {
        onOrderUpdated();
        onClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Error al actualizar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="orderlist-modal-overlay" onClick={onClose}>
      <div className="orderlist-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="orderlist-modal-header">
          <h3>Editar Pedido {order.order_number}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="orderlist-modal-body">
            <div className="form-group">
              <label>Nombre del Cliente *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email del Cliente *</label>
              <input
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <textarea
                value={formData.customer_address}
                onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="orderlist-modal-footer">
            <button type="button" className="orderlist-modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="orderlist-modal-confirm" disabled={loading}>
              {loading ? <><FaSpinner className="orderlist-spinner" /> Actualizando...</> : 'Actualizar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}